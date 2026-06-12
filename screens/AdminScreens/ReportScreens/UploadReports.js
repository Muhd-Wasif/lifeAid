import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { addDoc, collection, getDocs, query, serverTimestamp, where } from 'firebase/firestore';

import AdminHeader from '../../../components/AdminHeader';
import LoadingModal from '../../../components/LoadingModel';
import { COLORS } from '../../../constants';
import { db } from '../../../config';
import cloudinaryConfig from '../../../constants/cloudinary';

const UploadReports = ({ navigation }) => {
  const [ownerType, setOwnerType] = useState('patient');
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [reportTitle, setReportTitle] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      setSelectedUser(null);

      try {
        const usersQuery = query(collection(db, 'users'), where('userType', '==', ownerType));
        const snapshot = await getDocs(usersQuery);
        const fetchedUsers = snapshot.docs.map((docSnap) => ({
          docId: docSnap.id,
          ...docSnap.data(),
        }));
        setUsers(fetchedUsers);
      } catch (error) {
        console.error('Error fetching users for reports:', error);
        Alert.alert('Error', 'Unable to load users.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [ownerType]);

  const filteredUsers = useMemo(() => {
    const queryText = searchQuery.trim().toLowerCase();
    if (!queryText) return users;

    return users.filter((user) => {
      const name = user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim();
      return (
        name.toLowerCase().includes(queryText) ||
        (user.email || '').toLowerCase().includes(queryText) ||
        (user.phoneNumber || '').toLowerCase().includes(queryText) ||
        (user.cnic || '').toLowerCase().includes(queryText)
      );
    });
  }, [searchQuery, users]);

  const getUserName = (user) => (
    user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'Unnamed User'
  );

  const pickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const asset = result.assets?.[0];
      if (asset) {
        setSelectedFile(asset);
      }
    } catch (error) {
      console.error('Error picking report file:', error);
      Alert.alert('Error', 'Unable to pick file.');
    }
  };

  const uploadReport = async () => {
    if (!selectedUser) {
      Alert.alert('Error', `Please select a ${ownerType}.`);
      return;
    }

    if (!reportTitle.trim()) {
      Alert.alert('Error', 'Please enter report title.');
      return;
    }

    if (!selectedFile) {
      Alert.alert('Error', 'Please select a report file.');
      return;
    }

    const ownerUid = selectedUser.uid;
    if (!ownerUid) {
      Alert.alert('Error', 'Selected user has no UID.');
      return;
    }

    setIsUploading(true);

    try {
      const safeName = `${Date.now()}_${selectedFile.name || 'report'}`.replace(/[^\w.\-]/g, '_');
      const publicId = `${ownerType}_${ownerUid}_${safeName.replace(/\.[^/.]+$/, '')}`;
      const { cloudName, uploadPreset, folder } = cloudinaryConfig;

      if (
        !cloudName ||
        !uploadPreset ||
        cloudName === 'YOUR_CLOUDINARY_CLOUD_NAME' ||
        uploadPreset === 'YOUR_UNSIGNED_UPLOAD_PRESET'
      ) {
        Alert.alert(
          'Cloudinary Setup Required',
          'Please add your free Cloudinary cloudName and unsigned uploadPreset in constants/cloudinary.js.'
        );
        return;
      }

      const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;
      const uploadResult = await FileSystem.uploadAsync(uploadUrl, selectedFile.uri, {
        httpMethod: 'POST',
        uploadType: FileSystem.FileSystemUploadType.MULTIPART,
        fieldName: 'file',
        mimeType: selectedFile.mimeType || 'application/octet-stream',
        parameters: {
          upload_preset: uploadPreset,
          folder,
          public_id: publicId,
        },
      });

      if (uploadResult.status < 200 || uploadResult.status >= 300) {
        throw new Error(`Cloudinary upload failed (${uploadResult.status}): ${uploadResult.body}`);
      }

      const cloudinaryResponse = JSON.parse(uploadResult.body || '{}');
      const fileUrl = cloudinaryResponse.secure_url || cloudinaryResponse.url;

      if (!fileUrl) {
        throw new Error(`Cloudinary upload succeeded but no file URL was returned: ${uploadResult.body}`);
      }

      const ownerName = getUserName(selectedUser);
      const reportData = {
        ownerUid,
        ownerType,
        ownerName,
        title: reportTitle.trim(),
        description: reportDescription.trim(),
        fileUrl,
        fileName: selectedFile.name || safeName,
        fileType: selectedFile.mimeType || null,
        storageProvider: 'cloudinary',
        storagePath: cloudinaryResponse.public_id || `${folder}/${publicId}`,
        cloudinaryPublicId: cloudinaryResponse.public_id || null,
        cloudinaryResourceType: cloudinaryResponse.resource_type || null,
        uploadedAt: serverTimestamp(),
      };

      if (ownerType === 'patient') {
        reportData.patientUid = ownerUid;
      } else {
        reportData.donorUid = ownerUid;
      }

      await addDoc(collection(db, 'reports'), reportData);

      Alert.alert('Success', 'Report uploaded successfully.');
      setReportTitle('');
      setReportDescription('');
      setSelectedFile(null);
    } catch (error) {
      console.error('Error uploading report:', {
        code: error?.code,
        message: error?.message,
        serverResponse: error?.serverResponse,
        customData: error?.customData,
      });
      Alert.alert(
        'Error',
        error?.message?.includes('Cloudinary upload failed')
          ? error.message
          : 'Unable to upload report. Check Cloudinary cloudName/uploadPreset configuration.'
      );
    } finally {
      setIsUploading(false);
    }
  };

  const renderUser = ({ item }) => {
    const isSelected = selectedUser?.docId === item.docId;

    return (
      <TouchableOpacity
        style={[styles.userItem, isSelected && styles.selectedUserItem]}
        onPress={() => setSelectedUser(item)}
      >
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{getUserName(item)}</Text>
          <Text style={styles.userMeta}>{item.email || item.phoneNumber || item.cnic || '-'}</Text>
        </View>
        {isSelected && (
          <Ionicons name="checkmark-circle" size={22} color={COLORS.primaryRed} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <AdminHeader navigation={navigation} />
      <LoadingModal visible={isLoading} />

      <Text style={styles.title}>Upload Reports</Text>

      <View style={styles.pickerWrap}>
        <Picker selectedValue={ownerType} onValueChange={setOwnerType}>
          <Picker.Item label="Patient Report" value="patient" />
          <Picker.Item label="Donor Report" value="donor" />
        </Picker>
      </View>

      <TextInput
        style={styles.input}
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder={`Search ${ownerType} by name, email, phone, CNIC`}
      />

      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item.docId}
        renderItem={renderUser}
        style={styles.userList}
        contentContainerStyle={styles.userListContent}
        ListEmptyComponent={!isLoading ? (
          <Text style={styles.emptyText}>No {ownerType}s found.</Text>
        ) : null}
      />

      <TextInput
        style={styles.input}
        value={reportTitle}
        onChangeText={setReportTitle}
        placeholder="Report title e.g. CBC, Blood CP"
      />

      <TextInput
        style={[styles.input, styles.descriptionInput]}
        value={reportDescription}
        onChangeText={setReportDescription}
        placeholder="Description (optional)"
        multiline
      />

      <TouchableOpacity style={styles.fileButton} onPress={pickFile}>
        <Ionicons name="document-attach-outline" size={20} color={COLORS.primaryRed} />
        <Text style={styles.fileButtonText}>
          {selectedFile?.name || 'Choose PDF or Image'}
        </Text>
      </TouchableOpacity>

      {isUploading ? (
        <ActivityIndicator size="large" color={COLORS.primaryRed} style={styles.loader} />
      ) : (
        <TouchableOpacity style={styles.uploadButton} onPress={uploadReport}>
          <Text style={styles.uploadButtonText}>Upload Report</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 5,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: COLORS.primaryRed,
    textAlign: 'center',
    marginBottom: 14,
  },
  pickerWrap: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    marginBottom: 10,
    overflow: 'hidden',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  descriptionInput: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  userList: {
    maxHeight: 210,
    marginBottom: 10,
  },
  userListContent: {
    paddingBottom: 4,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#f7f7f7',
    marginBottom: 8,
  },
  selectedUserItem: {
    backgroundColor: '#fff1f1',
    borderWidth: 1,
    borderColor: COLORS.primaryRed,
  },
  userInfo: {
    flex: 1,
    paddingRight: 10,
  },
  userName: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  userMeta: {
    marginTop: 3,
    fontSize: 12,
    color: '#666',
  },
  emptyText: {
    textAlign: 'center',
    color: '#777',
    marginVertical: 20,
  },
  fileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.primaryRed,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  fileButtonText: {
    flex: 1,
    marginLeft: 8,
    color: COLORS.primaryRed,
    fontWeight: '600',
  },
  uploadButton: {
    backgroundColor: COLORS.primaryRed,
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  uploadButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loader: {
    marginVertical: 12,
  },
});

export default UploadReports;

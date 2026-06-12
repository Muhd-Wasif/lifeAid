import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, BackHandler, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import { COLORS } from '../../../constants';
import { db } from '../../../config';
import { doc, updateDoc } from 'firebase/firestore';
import AdminHeader from '../../../components/AdminHeader';

const ModifyPatient = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { patientData } = route.params || {};

  const [formData, setFormData] = useState({
    firstName: patientData.firstName || '',
    lastName: patientData.lastName || '',
    fatherName: patientData.fatherName || '',
    phoneNumber: patientData.phoneNumber || '',
    email: patientData.email || '',
    cnic: patientData.cnic || '',
    address: patientData.address || '',
    username: patientData.username || '',
  });

  const [selectedBloodGroup, setSelectedBloodGroup] = useState(patientData.bloodGroup || '');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        navigation.goBack();
        return true;
      }
    );
    return () => backHandler.remove();
  }, [navigation]);

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSaveChanges = async () => {
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.phoneNumber.trim() || !formData.cnic.trim()) {
      Alert.alert('Error', 'First Name, Last Name, Phone Number and CNIC are required!');
      return;
    }

    setIsLoading(true);
    try {
      const patientRef = doc(db, 'patients', patientData.id);

      const updatedPatient = {
        ...patientData,
        ...formData,
        bloodGroup: selectedBloodGroup,
      };

      await updateDoc(patientRef, updatedPatient);

      Alert.alert('Success', 'Patient updated successfully!', [
        { text: 'OK', onPress: () => navigation.navigate('ViewPatient', { patientData: updatedPatient }) }
      ]);
      setIsLoading(false);
    } catch (error) {
      console.error('Error updating patient:', error);
      Alert.alert('Error', 'Failed to update patient. Check console.');
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <AdminHeader navigation={navigation} />

      <Text style={styles.title}>Edit Patient Details</Text>

      <TextInput
        style={styles.input}
        placeholder="First Name"
        value={formData.firstName}
        onChangeText={(text) => handleInputChange('firstName', text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Last Name"
        value={formData.lastName}
        onChangeText={(text) => handleInputChange('lastName', text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Father Name"
        value={formData.fatherName}
        onChangeText={(text) => handleInputChange('fatherName', text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Phone Number"
        value={formData.phoneNumber}
        keyboardType="phone-pad"
        onChangeText={(text) => handleInputChange('phoneNumber', text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={formData.email}
        keyboardType="email-address"
        onChangeText={(text) => handleInputChange('email', text)}
      />
      <TextInput
        style={styles.input}
        placeholder="CNIC"
        value={formData.cnic}
        keyboardType="numeric"
        onChangeText={(text) => handleInputChange('cnic', text)}
      />
      <TextInput
        style={[styles.input, { height: 80 }]}
        placeholder="Address"
        value={formData.address}
        multiline
        onChangeText={(text) => handleInputChange('address', text)}
      />

      <Text style={styles.pickerLabel}>Blood Group:</Text>
      <View style={styles.pickerContainer}>
        <Picker
          style={styles.picker}
          selectedValue={selectedBloodGroup}
          onValueChange={(value) => setSelectedBloodGroup(value)}
        >
          <Picker.Item label="Select Blood Group" value="" />
          <Picker.Item label="A+" value="A+" />
          <Picker.Item label="B+" value="B+" />
          <Picker.Item label="AB+" value="AB+" />
          <Picker.Item label="O+" value="O+" />
          <Picker.Item label="A-" value="A-" />
          <Picker.Item label="B-" value="B-" />
          <Picker.Item label="AB-" value="AB-" />
          <Picker.Item label="O-" value="O-" />
        </Picker>
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSaveChanges}>
        <Text style={styles.saveButtonText}>Save Changes</Text>
      </TouchableOpacity>
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
    color: COLORS.primaryRed,
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 10,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 2,
    borderRadius: 10,
    marginBottom: 16,
    paddingHorizontal: 10,
  },
  pickerContainer: {
    borderWidth: 2,
    borderColor: '#ccc',
    borderRadius: 10,
    marginBottom: 30,
  },
  pickerLabel: {
    marginBottom: 10,
    fontSize: 16,
  },
  picker: {
    height: 50,
  },
  saveButton: {
    backgroundColor: COLORS.primaryRed,
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 0,
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default ModifyPatient;

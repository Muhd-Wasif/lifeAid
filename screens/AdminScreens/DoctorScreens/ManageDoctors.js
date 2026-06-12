import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    Image,
    StyleSheet,
    BackHandler,
    Alert,
    ScrollView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../../../constants';
import {
    collection,
    addDoc,
    deleteDoc,
    doc,
    onSnapshot,
    query,
    where,
    getDocs,
} from 'firebase/firestore';
import { db, firebaseConfig } from '../../../config';
import AdminHeader from '../../../components/AdminHeader';
import LoadingModal from '../../../components/LoadingModel';
import cloudinaryConfig from '../../../constants/cloudinary';

export default function ManageDoctors() {
    const navigation = useNavigation();
    const [doctors, setDoctors] = useState([]);
    const [name, setName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [email, setEmail] = useState('');
    const [cnic, setCnic] = useState('');
    const [specialization, setSpecialization] = useState('');
    const [degree, setDegree] = useState('');
    const [timing, setTiming] = useState('');
    const [days, setDays] = useState('');
    const [doctorImage, setDoctorImage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            navigation.goBack();
            return true;
        });

        return () => backHandler.remove();
    }, [navigation]);

    useEffect(() => {
        const doctorsRef = collection(db, 'doctors');
        const unsubscribe = onSnapshot(doctorsRef, (snapshot) => {
            const fetched = snapshot.docs.map((docSnap) => ({
                id: docSnap.id,
                ...docSnap.data(),
            }));
            setDoctors(fetched);
        }, (error) => {
            console.error('Error loading doctors:', error);
        });

        return () => unsubscribe();
    }, []);

    const pickDoctorImage = async () => {
        try {
            const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!permission.granted) {
                Alert.alert('Permission Required', 'Please allow gallery access to select doctor picture.');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled && result.assets?.[0]) {
                setDoctorImage(result.assets[0]);
            }
        } catch (error) {
            console.error('Error picking doctor image:', error);
            Alert.alert('Error', 'Unable to select doctor picture.');
        }
    };

    const uploadDoctorImage = async (asset, doctorName) => {
        const { cloudName, uploadPreset, folder } = cloudinaryConfig;

        if (
            !cloudName ||
            !uploadPreset ||
            cloudName === 'YOUR_CLOUDINARY_CLOUD_NAME' ||
            uploadPreset === 'YOUR_UNSIGNED_UPLOAD_PRESET'
        ) {
            throw new Error('Cloudinary setup is missing. Please check constants/cloudinary.js.');
        }

        const safeName = `${Date.now()}_${doctorName || asset.fileName || 'doctor'}`.replace(/[^\w.\-]/g, '_');
        const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
        const uploadResult = await FileSystem.uploadAsync(uploadUrl, asset.uri, {
            httpMethod: 'POST',
            uploadType: FileSystem.FileSystemUploadType.MULTIPART,
            fieldName: 'file',
            mimeType: asset.mimeType || 'image/jpeg',
            parameters: {
                upload_preset: uploadPreset,
                folder: `${folder}/doctors`,
                public_id: `doctor_${safeName.replace(/\.[^/.]+$/, '')}`,
            },
        });

        if (uploadResult.status < 200 || uploadResult.status >= 300) {
            throw new Error(`Doctor image upload failed (${uploadResult.status}): ${uploadResult.body}`);
        }

        const response = JSON.parse(uploadResult.body || '{}');
        const imageUrl = response.secure_url || response.url;
        if (!imageUrl) {
            throw new Error('Doctor image upload succeeded but no image URL was returned.');
        }

        return imageUrl;
    };

    const createDoctorAuthAccount = async (doctorEmail, password) => {
        const response = await fetch(
            `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${firebaseConfig.apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: doctorEmail,
                    password,
                    returnSecureToken: true,
                }),
            }
        );
        const data = await response.json();

        if (!response.ok) {
            const message = data?.error?.message || 'Unable to create doctor login.';
            const error = new Error(message);
            error.code = message;
            throw error;
        }

        return data.localId;
    };

    const handleAddDoctor = async () => {
        if (!name.trim()) {
            Alert.alert('Validation', 'Doctor name is required');
            return;
        }
        if (!phoneNumber.trim()) {
            Alert.alert('Validation', 'Phone number is required');
            return;
        }
        if (!email.trim()) {
            Alert.alert('Validation', 'Email is required');
            return;
        }
        if (!cnic.trim()) {
            Alert.alert('Validation', 'CNIC is required');
            return;
        }
        if (!specialization.trim()) {
            Alert.alert('Validation', 'Specialization is required');
            return;
        }
        if (!degree.trim()) {
            Alert.alert('Validation', 'Doctor degree is required');
            return;
        }
        if (!timing.trim()) {
            Alert.alert('Validation', 'Doctor timing is required');
            return;
        }
        if (!days.trim()) {
            Alert.alert('Validation', 'Doctor availability days are required');
            return;
        }
        if (!doctorImage?.uri) {
            Alert.alert('Validation', 'Doctor picture is required');
            return;
        }

        setIsLoading(true);

        try {
            const trimmedEmail = email.trim().toLowerCase();
            const trimmedCnic = cnic.trim();
            const trimmedPhone = phoneNumber.trim();

            const existingDoctorByEmail = await getDocs(
                query(collection(db, 'doctors'), where('email', '==', trimmedEmail))
            );
            if (!existingDoctorByEmail.empty) {
                Alert.alert('Duplicate doctor', 'A doctor with this email already exists.');
                setIsLoading(false);
                return;
            }

            const existingDoctorByCnic = await getDocs(
                query(collection(db, 'doctors'), where('cnic', '==', trimmedCnic))
            );
            if (!existingDoctorByCnic.empty) {
                Alert.alert('Duplicate doctor', 'A doctor with this CNIC already exists.');
                setIsLoading(false);
                return;
            }

            const existingUserByEmail = await getDocs(
                query(collection(db, 'users'), where('email', '==', trimmedEmail))
            );
            if (!existingUserByEmail.empty) {
                Alert.alert('Duplicate account', 'A user with this email already exists.');
                setIsLoading(false);
                return;
            }

            const authUid = await createDoctorAuthAccount(trimmedEmail, trimmedCnic);
            const doctorImageUrl = await uploadDoctorImage(doctorImage, name.trim());

            const doctorRef = await addDoc(collection(db, 'doctors'), {
                name: name.trim(),
                phoneNumber: trimmedPhone,
                email: trimmedEmail,
                cnic: trimmedCnic,
                specialization: specialization.trim(),
                degree: degree.trim(),
                timing: timing.trim(),
                days: days.trim(),
                authUid,
                image: doctorImageUrl,
                imageUrl: doctorImageUrl,
                username: trimmedEmail,
                userType: 'doctor',
                createdAt: new Date().toISOString(),
            });

            await addDoc(collection(db, 'users'), {
                uid: authUid,
                fullName: name.trim(),
                email: trimmedEmail,
                phoneNumber: trimmedPhone,
                cnic: trimmedCnic,
                specialization: specialization.trim(),
                degree: degree.trim(),
                timing: timing.trim(),
                days: days.trim(),
                profilePicture: doctorImageUrl,
                image: doctorImageUrl,
                imageUrl: doctorImageUrl,
                username: trimmedEmail,
                userType: 'doctor',
                isAdmin: false,
                doctorId: doctorRef.id,
                createdAt: new Date().toISOString(),
            });

            setName('');
            setPhoneNumber('');
            setEmail('');
            setCnic('');
            setSpecialization('');
            setDegree('');
            setTiming('');
            setDays('');
            setDoctorImage(null);
            Alert.alert('Success', 'Doctor account created successfully.');
        } catch (error) {
            console.error('Error adding doctor:', error);
            let errorMessage = 'Could not add doctor. Please try again.';
            if (error.code === 'auth/email-already-in-use') {
                errorMessage = 'This email is already registered.';
            } else if (error.code === 'EMAIL_EXISTS') {
                errorMessage = 'This email is already registered.';
            } else if (error.code === 'auth/invalid-email' || error.code === 'INVALID_EMAIL') {
                errorMessage = 'Invalid email format.';
            } else if (error.code === 'auth/weak-password' || String(error.code).includes('WEAK_PASSWORD')) {
                errorMessage = 'Password is too weak. Use a stronger CNIC value.';
            }
            Alert.alert('Error', errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteDoctor = async (doctorId) => {
        try {
            const linkedUsers = await getDocs(
                query(collection(db, 'users'), where('doctorId', '==', doctorId))
            );
            await Promise.all(linkedUsers.docs.map((userDoc) => deleteDoc(doc(db, 'users', userDoc.id))));
            await deleteDoc(doc(db, 'doctors', doctorId));
        } catch (error) {
            console.error('Error deleting doctor:', error);
            Alert.alert('Error', 'Could not delete doctor.');
        }
    };

    return (
        <View style={styles.container}>
            <AdminHeader navigation={navigation} />
            <LoadingModal visible={isLoading} />
            <Text style={styles.title}>Manage Doctors</Text>
            <ScrollView style={styles.formRow}>
                <TextInput
                    style={styles.input}
                    placeholder="Doctor Name"
                    value={name}
                    onChangeText={setName}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Phone Number"
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    keyboardType="phone-pad"
                />
                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
                <TextInput
                    style={styles.input}
                    placeholder="CNIC"
                    value={cnic}
                    onChangeText={setCnic}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Specialization"
                    value={specialization}
                    onChangeText={setSpecialization}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Degree"
                    value={degree}
                    onChangeText={setDegree}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Available Days (e.g. Mon-Wed)"
                    value={days}
                    onChangeText={setDays}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Timing (e.g. 9:00am-1:00pm)"
                    value={timing}
                    onChangeText={setTiming}
                />
                <TouchableOpacity style={styles.imagePicker} onPress={pickDoctorImage}>
                    {doctorImage?.uri ? (
                        <Image source={{ uri: doctorImage.uri }} style={styles.previewImage} />
                    ) : (
                        <View style={styles.imagePlaceholder}>
                            <Text style={styles.imagePlaceholderText}>Add Doctor Picture</Text>
                        </View>
                    )}
                </TouchableOpacity>
                <TouchableOpacity style={styles.addButton} onPress={handleAddDoctor}>
                    <Text style={styles.addButtonText}>Add Doctor</Text>
                </TouchableOpacity>
            </ScrollView>

            <Text style={styles.subtitle}>Available Doctors</Text>
            <FlatList
                data={doctors}
                keyExtractor={(item) => item.id}
                ListEmptyComponent={() => (
                    <Text style={styles.emptyText}>No doctors added yet.</Text>
                )}
                renderItem={({ item }) => (
                    <View style={styles.doctorRow}>
                        <Image
                            source={item.image || item.imageUrl ? { uri: item.image || item.imageUrl } : require('../../../assets/images/Dr_akramullah_image.jpg')}
                            style={styles.doctorThumb}
                        />
                        <View style={styles.doctorInfo}>
                            <Text style={styles.doctorName}>{item.name}</Text>
                            <Text style={styles.doctorMeta}>Email: {item.email || '-'}</Text>
                            <Text style={styles.doctorMeta}>Phone: {item.phoneNumber || '-'}</Text>
                            <Text style={styles.doctorMeta}>CNIC: {item.cnic || '-'}</Text>
                            <Text style={styles.doctorMeta}>Specialization: {item.specialization || '-'}</Text>
                            <Text style={styles.doctorMeta}>Degree: {item.degree || '-'}</Text>
                            <Text style={styles.doctorMeta}>Days: {item.days || '-'}</Text>
                            <Text style={styles.doctorMeta}>Timing: {item.timing || '-'}</Text>
                        </View>
                        <TouchableOpacity
                            style={styles.deleteButton}
                            onPress={() => handleDeleteDoctor(item.id)}
                        >
                            <Text style={styles.deleteText}>Delete</Text>
                        </TouchableOpacity>
                    </View>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 12,
        backgroundColor: 'white',
    },
    title: {
        fontSize: 30,
        fontWeight: 'bold',
        color: COLORS.primaryRed,
        marginTop: 10,
        marginBottom: 16,
        textAlign: 'center',
    },
    formRow: {
        marginBottom: 16,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        padding: 12,
        marginBottom: 12,
        fontSize: 15,
        backgroundColor: '#fff',
    },
    imagePicker: {
        marginBottom: 12,
    },
    imagePlaceholder: {
        minHeight: 92,
        borderWidth: 1,
        borderColor: '#ccc',
        borderStyle: 'dashed',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
    },
    imagePlaceholderText: {
        color: COLORS.primaryRed,
        fontWeight: '700',
    },
    previewImage: {
        width: 96,
        height: 96,
        borderRadius: 48,
        alignSelf: 'center',
        backgroundColor: '#eee',
    },
    addButton: {
        backgroundColor: COLORS.primaryRed,
        borderRadius: 10,
        paddingVertical: 14,
        alignItems: 'center',
        marginBottom: 20,
    },
    addButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    subtitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 12,
    },
    emptyText: {
        color: '#666',
        textAlign: 'center',
        marginTop: 20,
    },
    doctorRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        backgroundColor: '#fafafa',
        padding: 14,
        borderRadius: 12,
        marginBottom: 12,
        elevation: 2,
    },
    doctorInfo: {
        flex: 1,
        marginRight: 10,
    },
    doctorThumb: {
        width: 58,
        height: 58,
        borderRadius: 29,
        marginRight: 10,
        backgroundColor: '#eee',
    },
    doctorName: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    doctorMeta: {
        fontSize: 14,
        color: '#555',
        marginTop: 2,
    },
    deleteButton: {
        backgroundColor: '#D60000',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
    },
    deleteText: {
        color: 'white',
        fontWeight: '600',
    },
});

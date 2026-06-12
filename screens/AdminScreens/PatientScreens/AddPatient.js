import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, BackHandler, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../../../constants';
import { addDoc, collection, doc, getDocs, query, setDoc, where } from 'firebase/firestore';
import { db, firebaseConfig } from '../../../config';
import LoadingModal from '../../../components/LoadingModel';
import AdminHeader from '../../../components/AdminHeader';

const AddPatient = () => {
  const navigation = useNavigation();

  // State for form fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [cnic, setCnic] = useState('');
  const [address, setAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const createPatientAuthAccount = async (patientUsername, password) => {
    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${firebaseConfig.apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: patientUsername,
          password,
          returnSecureToken: true,
        }),
      }
    );
    const data = await response.json();

    if (!response.ok) {
      const message = data?.error?.message || 'Unable to create patient login.';
      const error = new Error(message);
      error.code = message;
      throw error;
    }

    return data.localId;
  };

  //Function to navigate back when hardware back button is pressed
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        navigation.goBack();
        return true; // Prevent default behavior (exit the app)
      }
    );

    return () => backHandler.remove();
  }, [navigation]);

  const handleAddPatient = async () => {
    if (isLoading) {
      return;
    }

    // Validation
    if (!firstName.trim()) {
      Alert.alert('Error', 'First Name is required');
      return;
    }
    if (!lastName.trim()) {
      Alert.alert('Error', 'Last Name is required');
      return;
    }
    if (!phoneNumber.trim()) {
      Alert.alert('Error', 'Phone Number is required');
      return;
    }
    if (!cnic.trim()) {
      Alert.alert('Error', 'CNIC is required');
      return;
    }

    setIsLoading(true);

    try {
      const username = email.trim() ? email.trim() : phoneNumber.trim();
      const trimmedCnic = cnic.trim();
      const trimmedPhone = phoneNumber.trim();
      const trimmedEmail = email.trim();
      const authEmail = trimmedEmail || `${trimmedPhone.replace(/\D/g, '')}@lifeaid.local`;

      const patientQuery = query(collection(db, 'patients'), where('cnic', '==', trimmedCnic));
      const patientSnapshot = await getDocs(patientQuery);
      if (!patientSnapshot.empty) {
        Alert.alert('Error', 'A patient with this CNIC already exists.');
        setIsLoading(false);
        return;
      }

      const phoneQuery = query(collection(db, 'patients'), where('phoneNumber', '==', trimmedPhone));
      const phoneSnapshot = await getDocs(phoneQuery);
      if (!phoneSnapshot.empty) {
        Alert.alert('Error', 'A patient with this phone number already exists.');
        setIsLoading(false);
        return;
      }

      if (trimmedEmail) {
        const emailQuery = query(collection(db, 'patients'), where('email', '==', trimmedEmail));
        const emailSnapshot = await getDocs(emailQuery);
        if (!emailSnapshot.empty) {
          Alert.alert('Error', 'A patient with this email already exists.');
          setIsLoading(false);
          return;
        }
      }

      const userQuery1 = query(collection(db, 'users'), where('username', '==', username));
      const userSnapshot1 = await getDocs(userQuery1);
      if (!userSnapshot1.empty) {
        Alert.alert('Error', 'This username is already registered.');
        setIsLoading(false);
        return;
      }

      if (trimmedEmail) {
        const userQuery2 = query(collection(db, 'users'), where('email', '==', trimmedEmail));
        const userSnapshot2 = await getDocs(userQuery2);
        if (!userSnapshot2.empty) {
          Alert.alert('Error', 'This email is already registered.');
          setIsLoading(false);
          return;
        }
      }

      const patientUid = await createPatientAuthAccount(authEmail, trimmedCnic);
      console.log('Patient account created:', patientUid);

      // Generate a unique ID for the new patient
      const SerialId = Math.random().toString(36).substr(2, 9);

      // Create patient object with all fields
      const newPatient = {
        id: SerialId,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        fatherName: fatherName.trim(),
        phoneNumber: phoneNumber.trim(),
        email: email.trim() || null,
        authEmail,
        cnic: cnic.trim(),
        address: address.trim(),
        username: username,
        uid: patientUid, // Firebase Auth UID
        userType: 'patient', // Mark as patient
        createdAt: new Date().toISOString(),
      };

      const patientRef = doc(db, 'patients', SerialId);
      console.log('Patient ref:', patientRef.path);
      await setDoc(patientRef, newPatient);
      console.log('Patient data saved to Firestore');

      // Also save to users collection for compatibility
      const usersCollection = collection(db, 'users');
      await addDoc(usersCollection, {
        uid: patientUid,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        fullName: `${firstName.trim()} ${lastName.trim()}`,
        fatherName: fatherName.trim(),
        phoneNumber: phoneNumber.trim(),
        email: email.trim() || null,
        authEmail,
        cnic: cnic.trim(),
        address: address.trim(),
        username: username,
        userType: 'patient',
        isAdmin: false,
        createdAt: new Date().toISOString(),
      });

      setIsLoading(false);
      Alert.alert('Success', 'Patient added successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      setIsLoading(false);
      console.error('Error adding patient:', error);

      let errorMessage = 'Failed to add patient. Please try again.';
      if (error.code === 'auth/email-already-in-use' || error.code === 'EMAIL_EXISTS') {
        errorMessage = 'This email/phone number is already registered.';
      } else if (error.code === 'auth/invalid-email' || error.code === 'INVALID_EMAIL') {
        errorMessage = 'Invalid email format.';
      } else if (error.code === 'auth/weak-password' || String(error.code).includes('WEAK_PASSWORD')) {
        errorMessage = 'Password is too weak.';
      }

      Alert.alert('Error', errorMessage);
    }
  };

  return (
    <View style={styles.container}>
      <LoadingModal visible={isLoading} />
      <AdminHeader navigation={navigation} />
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.formContainer}>
          <Text style={styles.title}>Add New Patient</Text>

          {/* First Name - Required */}
          <Text style={styles.label}>First Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter First Name"
            value={firstName}
            onChangeText={(text) => setFirstName(text)}
          />

          {/* Last Name - Required */}
          <Text style={styles.label}>Last Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Last Name"
            value={lastName}
            onChangeText={(text) => setLastName(text)}
          />

          {/* Father Name */}
          <Text style={styles.label}>Father Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Father Name"
            value={fatherName}
            onChangeText={(text) => setFatherName(text)}
          />

          {/* Phone Number - Required */}
          <Text style={styles.label}>Phone Number *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Phone Number"
            value={phoneNumber}
            onChangeText={(text) => setPhoneNumber(text)}
            keyboardType="phone-pad"
          />

          {/* Email - Optional */}
          <Text style={styles.label}>Email (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Email"
            value={email}
            onChangeText={(text) => setEmail(text)}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          {/* CNIC - Required */}
          <Text style={styles.label}>CNIC *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter CNIC (e.g., 12345-1234567-1)"
            value={cnic}
            onChangeText={(text) => setCnic(text)}
            keyboardType="numeric"
          />

          {/* Address */}
          <Text style={styles.label}>Address</Text>
          <TextInput
            style={[styles.input, styles.addressInput]}
            placeholder="Enter Address"
            value={address}
            onChangeText={(text) => setAddress(text)}
            multiline
            numberOfLines={3}
          />

          <TouchableOpacity
            style={[styles.button, isLoading && styles.disabledButton]}
            onPress={handleAddPatient}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>Add Patient</Text>
          </TouchableOpacity>

          <Text style={styles.note}>
            * Username: {email.trim() ? email.trim() : phoneNumber.trim() || 'Email or Phone'}
          </Text>
          <Text style={styles.note}>
            * Password: CNIC
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 5,
    backgroundColor: 'white'
  },
  scrollView: {
    flex: 1,
  },
  formContainer: {
    paddingBottom: 20,
  },
  title: {
    color: COLORS.primaryRed,
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 24,
    marginTop: 10,
    alignSelf: 'center'
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: 8,
    marginTop: 10,
  },
  input: {
    height: 55,
    borderColor: '#ccc',
    borderWidth: 2,
    borderRadius: 8,
    marginBottom: 10,
    paddingHorizontal: 10,
    fontSize: 16,
    backgroundColor: 'white',
  },
  addressInput: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: 10,
  },
  button: {
    backgroundColor: COLORS.primaryRed,
    alignItems: 'center',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
    marginHorizontal: 0
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    fontWeight: 'bold',
    color: 'white',
    fontSize: 18,
  },
  note: {
    fontSize: 12,
    color: '#666',
    marginTop: 10,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default AddPatient;

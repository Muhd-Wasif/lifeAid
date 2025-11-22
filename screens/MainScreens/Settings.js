import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, TextInput, Alert, BackHandler } from 'react-native'
import React, { useState, useEffect } from 'react';
import { COLORS, FONTS, SIZES } from "../../constants/themes";
import { icons } from '../../constants';
import Input from "../../components/Input";
import Button from "../../components/Button";
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db, storageRef, storage } from '../../config';
import { getAuth } from 'firebase/auth';
import { updateDoc, deleteDoc } from 'firebase/firestore';
import * as FileSystem from 'expo-file-system';
import { getStorage, ref } from 'firebase/storage';
import { getDownloadURL, uploadBytes } from 'firebase/storage';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { onSnapshot } from 'firebase/firestore';
import LoadingModal from '../../components/LoadingModel';

const Settings = ({ navigation }) => {

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

    // To show loading on the screen
    const [isLoading, setIsLoading] = useState(true);
    //Other imports
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [phoneNumber, setPhoneNumber] = useState('');
    const [address, setAddress] = useState("");
    const [bloodGroup, setSelectedItem] = useState(null);
    const [dateOfBirth, setDateOfBirth] = useState(new Date()); // State to store date of birth fetched from Firestore
    const [profilePictureUrl, setProfilePictureUrl] = useState(icons.profilePicGrey);
    const [profilePicture, setProfilePicture] = useState(null);
    const [uploadProfilePic, setuploadProfilePic] = useState(false);
    const storageRef = ref(storage, 'profilePicture'); // Reference to the "profilePicture" folder in Firebase Storage



    const listenForProfilePictureChanges = async (userEmail) => {
        const q = query(collection(db, 'users'), where('email', '==', userEmail));
        const unsubscribe = onSnapshot(q, async (querySnapshot) => {
            if (!querySnapshot.empty) {
                const doc = querySnapshot.docs[0];
                const userData = doc.data();
                if (userData.profilePicture) {
                    // Update the profilePictureUrl state with the new URL
                    const url = await getDownloadURL(ref(storage, userData.profilePicture));
                    setProfilePictureUrl(url);
                }
            }
        });
        return unsubscribe;
    };


    useEffect(() => {
        const fetchData = async () => {
            const auth = getAuth();
            const user = auth.currentUser;
            // Start listening for profile picture changes
            const unsubscribe = listenForProfilePictureChanges(user.email);
            if (user) {
                const q = query(collection(db, 'users'), where('email', '==', user.email));
                const querySnapshot = await getDocs(q);
                if (!querySnapshot.empty) {
                    const doc = querySnapshot.docs[0];
                    const userData = doc.data();
                    setFullName(userData.fullName);
                    setEmail(userData.email);
                    setPhoneNumber(userData.phoneNumber);
                    setAddress(userData.address);
                    setSelectedItem(userData.bloodGroup);
                    // Fetch and set the date of birth from Firestore
                    if (userData.dateOfBirth) {
                        // Parse the date string from Firestore into a Date object
                        const dobDate = new Date(userData.dateOfBirth.toDate());

                        // Set the parsed date as the date of birth
                        setDateOfBirth(dobDate);

                    }
                    if (userData.profilePicture) {
                        const url = await getDownloadURL(ref(storage, userData.profilePicture));
                        setProfilePictureUrl(url);
                    } else {
                        const storedProfilePicture = await AsyncStorage.getItem('profilePicture');
                        if (storedProfilePicture) {
                            setProfilePicture(storedProfilePicture);
                        }
                    }

                }
                // Set profile picture URL
                setIsLoading(false); // Set loading to false when done
            }
            // Remember to unsubscribe when the component unmounts
            return () => {
                unsubscribe();
            };
        };

        fetchData();
    }, []);

    const handleSaveChanges = async () => {
        const auth = getAuth();
        const user = auth.currentUser;
        if (user) {
            const q = query(collection(db, 'users'), where('email', '==', user.email));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                const doc = querySnapshot.docs[0];
                await updateDoc(doc.ref, {
                    fullName,
                    email,
                    phoneNumber,
                    address,
                    bloodGroup,
                    dateOfBirth
                });

                Alert.alert(
                    "ALERT!",
                    "Changes Saved Successfully.",
                    [
                        { text: "OK", onPress: () => console.log("OK Pressed") }
                    ]
                );


            }
        }

    }
    const uploadPic = async () => {
        setuploadProfilePic(true);

        try {
            let blob = null;

            if (profilePicture) {
                if (profilePicture.startsWith('http')) {
                    const response = await fetch(profilePicture);
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    blob = await response.blob();
                } else {
                    blob = await new Promise((resolve) => {
                        const xhr = new XMLHttpRequest();
                        xhr.onload = () => {
                            resolve(xhr.response);
                        };
                        xhr.onerror = (e) => {
                            console.error(e);
                            resolve(null);
                        };
                        xhr.responseType = 'blob';
                        xhr.open('GET', profilePicture, true);
                        xhr.send(null);
                    });
                }

                const filename = profilePicture.substring(profilePicture.lastIndexOf('/') + 1);
                const fileRef = ref(storageRef, filename);
                await uploadBytes(fileRef, blob);

                setuploadProfilePic(false);

                Alert.alert('Profile Pic Uploaded!');


            } else {
                setuploadProfilePic(false);
                Alert.alert('Please select a profile picture.');
            }
        } catch (error) {
            console.error('Error uploading profile picture:', error);
            setuploadProfilePic(false);
        }
    };


    const handleImageChange = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 1,
            });

            if (!result.canceled) {
                // Set the selected image URI as the profile picture
                if (result.assets && result.assets.length > 0) {
                    const selectedAsset = result.assets[0];
                    setProfilePicture(selectedAsset.uri);
                    await AsyncStorage.setItem('profilePicture', selectedAsset.uri);
                    // Upload the selected image to Firebase Storage and update the profilePicture field in Firestore
                    await uploadImageToFirebase(selectedAsset.uri);
                }
            }
        } catch (error) {
            console.error('Error picking image:', error);
        }
    };



    const uploadImageToFirebase = async (imageUri) => {
        try {
            const auth = getAuth();
            const user = auth.currentUser;

            if (user) {
                const filename = user.uid + '_profile_pic.jpg'; // Unique filename
                const fileRef = ref(storageRef, filename); // Reference to the file in the "profilePicture" folder

                // Convert the image URI to a blob
                const response = await fetch(imageUri);
                const blob = await response.blob();

                // Upload the blob to Firebase Storage
                await uploadBytes(fileRef, blob);

                // Get the download URL of the uploaded image
                const imageUrl = await getDownloadURL(fileRef);

                // Update the profilePicture field in Firestore with the image URL
                const q = query(collection(db, 'users'), where('email', '==', user.email));
                const querySnapshot = await getDocs(q);
                if (!querySnapshot.empty) {
                    const doc = querySnapshot.docs[0];
                    await updateDoc(doc.ref, { profilePicture: imageUrl });
                }

                // Update the profilePictureUrl state to display the new image
                setProfilePictureUrl(imageUrl);

                Alert.alert('Profile Picture Updated!');
            }
        } catch (error) {
            console.error('Error uploading profile picture:', error);
        }
    };


    const saveAllChanges = () => {
        handleSaveChanges();
        uploadPic();

    }

    const handleDeleteAccount = () => {
        // Display a confirmation dialog
        Alert.alert(
            "Delete Account",
            "Are you sure you want to delete your account? This action cannot be undone.",
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Delete",
                    onPress: () => deleteAccount()
                }
            ]
        );
    };


    const deleteAccount = async () => {
        try {
            const auth = getAuth();
            const user = auth.currentUser;

            if (user) {
                // Delete user from Firebase Authentication
                await user.delete();

                // Delete user data from Firestore
                const q = query(collection(db, 'users'), where('email', '==', user.email));
                const querySnapshot = await getDocs(q);
                if (!querySnapshot.empty) {
                    const doc = querySnapshot.docs[0];
                    await deleteDoc(doc.ref);
                }

                // Navigate to a signin screen 
                navigation.navigate('Signin');
            }
        } catch (error) {
            console.error('Error deleting account:', error);
        }
    };



    return (
        <View style={styles.container}>
            <View style={{ marginRight: 30, marginLeft: 30 }}>
                <LoadingModal visible={isLoading} />
                <ScrollView>
                    <Text style={styles.text}>Personal Information</Text>

                    <View style={{ marginTop: 20, }}>
                        <Text style={{ ...FONTS.h3, color: COLORS.black, alignSelf: 'center', fontWeight: '500' }}>
                            Avatar
                        </Text>
                        <View style={{ marginBottom: 20, justifyContent: 'center', alignSelf: 'center' }}>
                            {profilePictureUrl && typeof profilePictureUrl === 'string' ? (
                                <Image source={{ uri: profilePictureUrl }} style={styles.Profileimage} />
                            ) : (
                                <Image source={icons.profilePicGrey} style={styles.Profileimage} />
                            )
                            }

                            <View style={{ flexDirection: 'row' }}>
                                <TouchableOpacity style={styles.button1} onPress={handleImageChange}>
                                    <Text style={{ color: COLORS.primaryRed, ...FONTS.h6, fontWeight: '700' }}>
                                        Change
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.button2}>
                                    <Text style={{ color: COLORS.black, ...FONTS.h6, fontWeight: '700' }}>Remove</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    <View style={{ marginTop: 20 }}>
                        <Text style={styles.inputLabel}>Email:</Text>
                        <Input
                            placeholder={email}
                            editable={false} />
                    </View>

                    <View style={{ marginTop: 20 }}>
                        <Text style={styles.inputLabel}>Full Name:</Text>
                        <Input
                            value={fullName}
                            onChangeText={setFullName}

                        />
                    </View>

                    <View style={{ marginTop: 20 }}>
                        <Text style={styles.inputLabel}>Phone Number:</Text>
                        <Input
                            value={phoneNumber}
                            onChangeText={setPhoneNumber}
                            keyboardType="phone-pad"
                            maxLength={14}
                        />
                    </View>

                    <View style={{ marginTop: 20 }}>
                        <Text style={styles.inputLabel}>Address:</Text>
                        <Input
                            value={address}
                            onChangeText={setAddress}
                        />
                    </View>
                    <View style={{ marginTop: 20 }}>
                        <Text style={styles.inputLabel}>Blood Group:</Text>
                        <View style={styles.pickerContainer}>
                            <Picker style={styles.picker}
                                selectedValue={bloodGroup}
                                onValueChange={(itemValue) => setSelectedItem(itemValue)}>
                                <Picker.Item label="Select Blood Group" value={null} />
                                <Picker.Item label="A+" value="A+" />
                                <Picker.Item label="A-" value="A-" />
                                <Picker.Item label="B+" value="B+" />
                                <Picker.Item label="B-" value="B-" />
                                <Picker.Item label="O+" value="O+" />
                                <Picker.Item label="O-" value="O-" />
                                <Picker.Item label="AB+" value="AB+" />
                                <Picker.Item label="AB-" value="AB-" />
                            </Picker>
                        </View>
                    </View>
                    <View style={{ marginTop: 20 }}>
                        <Text style={styles.inputLabel}>Date of Birth:</Text>
                        <TextInput
                            style={styles.textInputContainer}
                            value={new Intl.DateTimeFormat('en-US').format(dateOfBirth)} // Display the date of birth as a string
                            editable={false} // Make the field non-editable
                        />
                    </View>
                    <View style={{ marginTop: 20 }}>
                        <Text style={styles.inputLabel}>Notifications:</Text>
                    </View>
                    <View style={{ marginBottom: 50, justifyContent: 'center' }}>
                        <Button title="Delete Account" onPress={handleDeleteAccount} />
                    </View>
                    <View style={{ marginBottom: 100, flexDirection: 'row', justifyContent: 'center' }}>
                        <TouchableOpacity style={styles.button3}  >
                            <Text style={{ color: COLORS.black, ...FONTS.h6, fontWeight: '700' }}>Discard Changes</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.button4} onPress={saveAllChanges}>
                            <Text style={{ color: COLORS.secondaryWhite, ...FONTS.h6, fontWeight: '700' }}>Save Changes</Text>
                        </TouchableOpacity>
                    </View>

                </ScrollView>
            </View>

        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',

    },
    text: {
        color: COLORS.primaryRed,
        ...FONTS.title,
        marginTop: 20,
        alignSelf: 'center',

    },
    Profileimage: {
        width: 100,
        height: 100,
        borderRadius: 90,
        borderWidth: 3,
        //borderColor: COLORS.black,
        marginTop: 15,
        marginBottom: 20,
        alignSelf: 'center',


    },
    button1: {
        backgroundColor: 'white',
        width: 100,
        height: 50,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: COLORS.primaryRed,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 18,
        marginRight: 10

    },
    button2: {
        backgroundColor: 'white',
        width: 100,
        height: 50,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: COLORS.black,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 18,
        marginLeft: 10

    },
    button3: {
        backgroundColor: 'white',
        width: 150,
        height: 50,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: COLORS.black,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 18,
        marginLeft: 10

    },
    button4: {
        backgroundColor: COLORS.primaryRed,
        width: 150,
        height: 50,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: COLORS.primaryRed,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 18,
        marginLeft: 10

    },
    inputLabel: {
        color: '#CF0A0A',
        fontWeight: 'bold',
        marginTop: 4,
        marginBottom: 1,
    },
    datePickerIcon: {
        marginLeft: 10,
        marginRight: 10,
    },
    pickerContainer: {
        marginTop: 10,
        borderWidth: 1.5,
        borderColor: 'black',
        borderRadius: 10,
        overflow: 'hidden', // To hide the border overflow on Android
    },
    picker: {
        height: 53,
        marginBottom: 5,
        width: '100%',
        color: 'black',
        padding: 8,
        backgroundColor: "#f5f5f5",
    },
    phoneNumberContainer: {
        marginBottom: 10,
    },
    phoneInputContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    countryCodeInput: {
        borderWidth: 1.5,
        paddingHorizontal: 19,
        paddingVertical: 14,
        borderRadius: 10,
        fontSize: 16,
        backgroundColor: "#f5f5f5",
        width: 75,
        elevation: 8,
        shadowColor: "black",
        shadowOffset: { width: 2, height: 2 },
        shadowRadius: 2,
        shadowOpacity: 80,
        marginTop: 10,

    },
    phoneNumberInput: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 15,
        marginBottom: 6,
        marginLeft: 10,
        borderWidth: 1.5,
        paddingLeft: 25,
        paddingRight: 130,
        paddingVertical: 14,
        borderRadius: 12,
        fontSize: 16,
        fontStyle: "normal",
        elevation: 8,
        shadowColor: "black",
        shadowOffset: { width: 2, height: 2 },
        shadowRadius: 2,
        shadowOpacity: 10,
        backgroundColor: "#f5f5f5",
    },
    textInputContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 10,
        marginBottom: 10,
        borderWidth: 1.5,
        paddingLeft: 18,
        paddingRight: 170,
        paddingTop: 17,
        paddingBottom: 17,
        borderRadius: 8,
        elevation: 8,
        shadowColor: "black",
        shadowOffset: { width: 2, height: 2 },
        shadowRadius: 2,
        shadowOpacity: 10,
        backgroundColor: "#f5f5f5",
    },
    datePicker: {
        borderWidth: 1.5,
        borderColor: 'black',
        borderRadius: 10,
        overflow: 'hidden',
        backgroundColor: '#f5f5f5',
        padding: 10,
    },
    datePickerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
});

export default Settings;

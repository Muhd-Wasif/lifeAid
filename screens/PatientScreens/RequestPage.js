import { View, Text, SafeAreaView, TouchableOpacity, StyleSheet, ScrollView, Alert, BackHandler, TextInput, ActivityIndicator } from 'react-native';
import React, { useState, useEffect } from "react";
import OtherUserHeader from '../../components/OtherUserHeader';
import PatientBottomMenu from '../../components/PatientBottomMenu';
import CustomCheckbox from '../../components/CustomCheckbox';
import DropDown from '../../components/DropDown';
import Button from "../../components/Button";
import Input from "../../components/Input";
import { COLORS } from "../../constants/themes";
import { collection, addDoc, serverTimestamp, getDocs, query, where } from 'firebase/firestore';
import { auth, db } from '../../config';
import { getDatabase, ref, push, set } from 'firebase/database';

const bloodType = [
    { id: 1, name: 'A+' },
    { id: 2, name: 'A-' },
    { id: 3, name: 'B+' },
    { id: 4, name: 'B-' },
    { id: 5, name: 'AB+' },
    { id: 6, name: 'AB-' },
    { id: 7, name: 'O+' },
    { id: 8, name: 'O-' }
];

function RequestPage({ navigation }) {



    // For exiting the application on hardware back press
    useEffect(() => {
        const backAction = () => {
            Alert.alert(
                'Exit App',
                'Are you sure you want to exit?',
                [
                    {
                        text: 'Cancel',
                        onPress: () => null,
                        style: 'cancel',
                    },
                    { text: 'OK', onPress: () => BackHandler.exitApp() },
                ],
                { cancelable: false }
            );

            return true;
        };

        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            backAction
        );

        return () => backHandler.remove();
    }, []);

    const [isLoading, setIsLoading] = useState(false);
    const [requestFullName, setRequestFullName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState('');
    const [countryCode, setCountryCode] = useState('+92');
    const [selectedBloodType, setSelectedBloodType] = useState(null);
    const [selectedMedicalReason, setSelectedMedicalReason] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null);

    const onSelect = (item) => setSelectedItem(item);
    const isRequestFormComplete = (
        requestFullName.trim() &&
        countryCode.trim() &&
        phoneNumber.trim().length >= 10 &&
        selectedBloodType &&
        selectedItem?.name &&
        selectedMedicalReason
    );

    const handleChangePhoneNumber = (text) => {
        if (text.length <= 10) setPhoneNumber(text);
    };

    const handleChangeCountryCode = (text) => setCountryCode(text);

    // Get current user's information
    const currentUser = auth.currentUser;
    const currentUserFullName = currentUser?.displayName || "";

    const requestAddOn = async () => {
        if (!isRequestFormComplete) {
            Alert.alert('Missing Information', 'Please fill all fields before submitting blood request.');
            return;
        }

        setIsLoading(true);

        try {
            const requestCollection = collection(db, 'requests');
            const docRef = await addDoc(requestCollection, {
                fullName: requestFullName,
                phoneNumber: `${countryCode}${phoneNumber}`,
                bloodType: selectedBloodType,
                bloodGroup: selectedItem.name,
                medicalReason: selectedMedicalReason,
                currentUserName: currentUserFullName,
                patientUid: currentUser?.uid || null,
                patientEmail: currentUser?.email || null,
                status: 'open',
                createdAt: serverTimestamp(),
            });

            const requestId = docRef.id;
            console.log('Request added successfully with ID:', requestId);

            // Fetch all donors with matching blood group
            const donorsQuery = query(
                collection(db, 'users'),
                where('bloodGroup', '==', selectedItem.name),
                where('userType', '==', 'donor')
            );
            const donorsSnapshot = await getDocs(donorsQuery);

            // Send notification to each matching donor
            if (!donorsSnapshot.empty) {
                const database = getDatabase();
                const notificationsRef = ref(database, 'notifications');

                donorsSnapshot.forEach((donorDoc) => {
                    const donorData = donorDoc.data();
                    const notification = {
                        message: `Blood needed: ${selectedItem.name} for ${selectedMedicalReason || 'medical reason'}`,
                        timestamp: new Date().getTime(),
                        read: false,
                        requestId: requestId,
                        bloodGroup: selectedItem.name,
                        medicalReason: selectedMedicalReason,
                        patientName: requestFullName,
                        donorUid: donorData.uid || donorData.username || null
                    };

                    const newNotificationRef = push(notificationsRef);
                    set(newNotificationRef, notification);
                });
            }

            setIsLoading(false);
            setRequestFullName('');
            setPhoneNumber('');
            setCountryCode('+92');
            setSelectedBloodType(null);
            setSelectedMedicalReason(null);
            setSelectedItem(null);

            Alert.alert(
                "ALERT!",
                `Request Added Successfully. Notified ${donorsSnapshot.size} matching donors.`,
                [{ text: "OK" }]
            );
        } catch (error) {
            console.error('Error adding data:', error);
            setIsLoading(false);
            Alert.alert('Error', 'Failed to create request. Please try again.');
        }
    };
    return (
        <SafeAreaView style={styles.container}>
            <OtherUserHeader navigation={navigation} />

            <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
                <Text style={styles.title}>Fill out the form to make a blood request:</Text>

                <View style={{ marginHorizontal: 20, marginTop: 10 }}>
                    {/* Full Name */}
                    <Text style={styles.inputLabel}>Name</Text>
                    <Input
                        placeholder={"Full Name"}
                        value={requestFullName}
                        onChangeText={setRequestFullName}
                    />

                    {/* Phone Number */}
                    <Text style={styles.inputLabel}>Enter your phone number:</Text>
                    <View style={styles.phoneInputContainer}>
                        <TextInput
                            style={styles.countryCodeInput}
                            onChangeText={handleChangeCountryCode}
                            placeholder="Code"
                            keyboardType="phone-pad"
                            maxLength={3}
                            value={countryCode}
                        />
                        <TextInput
                            style={styles.phoneNumberInput}
                            onChangeText={handleChangePhoneNumber}
                            placeholder="Phone Number"
                            keyboardType="phone-pad"
                            maxLength={10}
                            value={phoneNumber}
                        />
                    </View>

                    {/* Blood Type */}
                    <Text style={styles.inputLabel}>Blood Type: </Text>
                    <View style={styles.checkboxRow}>
                        {["Whole Blood", "Platelets", "Plasma", "I Don't Know"].map((type) => (
                            <CustomCheckbox
                                key={type}
                                label={type}
                                isChecked={selectedBloodType === type}
                                onChange={() => setSelectedBloodType(type)}
                            />
                        ))}
                    </View>

                    {/* Blood Group */}
                    <Text style={styles.inputLabel}>Blood Group:</Text>
                    <DropDown
                        value={selectedItem}
                        data={bloodType}
                        onSelect={onSelect}
                    />

                    {/* Medical Reason */}
                    <Text style={styles.inputLabel}>Medical Reason:</Text>
                    <View style={styles.checkboxRow}>
                        {["Thalassemia", "Surgery", "Accident", "Cancer", "Pregnancy", "Other"].map((reason) => (
                            <CustomCheckbox
                                key={reason}
                                label={reason}
                                isChecked={selectedMedicalReason === reason}
                                onChange={() => setSelectedMedicalReason(reason)}
                            />
                        ))}
                    </View>
                </View>

                <View style={{ marginTop: 20, alignItems: 'center' }}>
                    {isLoading ? (
                        <ActivityIndicator size="large" color={COLORS.primaryRed} />
                    ) : (
                        <Button
                            title="Request Blood"
                            onPress={requestAddOn}
                            disabled={!isRequestFormComplete}
                        />
                    )}
                </View>
            </ScrollView>
            <PatientBottomMenu navigation={navigation} activeRoute="RequestPage" />
        </SafeAreaView >
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginVertical: 15,
        color: COLORS.primaryRed,
    },
    inputLabel: {
        color: '#CF0A0A',
        fontWeight: 'bold',
        marginTop: 10,
        marginBottom: 5,
    },
    phoneInputContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 15,
    },
    countryCodeInput: {
        borderWidth: 1.5,
        paddingHorizontal: 15,
        paddingVertical: 14,
        borderRadius: 10,
        fontSize: 16,
        backgroundColor: "#f5f5f5",
        width: 65,
        marginRight: 10,
        elevation: 3,
    },
    phoneNumberInput: {
        flex: 1,
        borderWidth: 1.5,
        paddingLeft: 15,
        paddingVertical: 14,
        borderRadius: 12,
        fontSize: 16,
        backgroundColor: "#f5f5f5",
        elevation: 3,
    },
    checkboxRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        marginVertical: 10,
    },
});

export default RequestPage;

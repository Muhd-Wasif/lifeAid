import { View, Text, SafeAreaView, StyleSheet, ScrollView, Alert, BackHandler, TextInput } from 'react-native'
import React, { useState, useEffect } from "react";
import PageContainer from '../../components/PageContainer';
import CustomCheckbox from '../../components/CustomCheckbox';
import DropDown from '../../components/DropDown';
import Button from "../../components/Button";
import Input from "../../components/Input";
import { ActivityIndicator } from 'react-native';
import { COLORS, FONTS } from "../../constants/themes";
import HeaderUsers from '../../components/HeaderUsers';
import { collection, addDoc, query, where, getDoc, doc } from 'firebase/firestore';
import { auth, db } from '../../config';
import OtherUserHeader from '../../components/OtherUserHeader';




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

    //For exiting the appliaction on hardware backPress
    useEffect(() => {
        const backAction = () => {
            Alert.alert(
                'Exit App',
                'Are you sure you want to exit?',
                [
                    {
                        text: 'Cancel',
                        onPress: () => null, // Do nothing when cancel is pressed
                        style: 'cancel',
                    },
                    { text: 'OK', onPress: () => BackHandler.exitApp() },
                ],
                { cancelable: false }
            );

            return true; // Prevent default behavior (exit the app)
        };

        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            backAction
        );

        return () => backHandler.remove();
    }, []);



    const [isLoading, setIsLoading] = useState(false);
    const [requestFullName, setRequestFullName] = useState("");
    const [currentUserName, setCurrentUserName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState('');
    const [countryCode, setCountryCode] = useState('+92');
    const [selectedBloodType, setSelectedBloodType] = useState(null);
    const [selectedMedicalReason, setSelectedMedicalReason] = useState(null);

    const [selectedItem, setSelectedItem] = useState(null);
    const onSelect = (item) => {
        setSelectedItem(item);
    };
    const handleChangePhoneNumber = (text) => {
        if (text.length <= 10) {
            setPhoneNumber(text);
        }
    };

    const handleChangeCountryCode = (text) => {
        setCountryCode(text);
    };

    // Get current user's information
    const currentUser = auth.currentUser;
    const currentUserFullName = currentUser.displayName;

    const requestAddOn = () => {
        setIsLoading(true); // Set loading state to true
        // Saving the request data to the Firestore Database
        const requestCollection = collection(db, 'requests');
        addDoc(requestCollection, {
            fullName: requestFullName,
            phoneNumber: `${countryCode}${phoneNumber}`,
            bloodType: selectedBloodType,
            bloodGroup: selectedItem?.name,
            medicalReason: selectedMedicalReason,
            currentUserName: currentUserFullName,
        })
            .then(() => {
                //Storing request on firestore
                console.log('Request added successfully.');
                setIsLoading(false); // Setting Loading to false when done
                setRequestFullName('');
                setPhoneNumber('');
                setCountryCode('+92');
                setSelectedBloodType(null);
                setSelectedMedicalReason(null);
                setSelectedItem(null);
                setCurrentUserName('');
                Alert.alert(
                    "ALERT!",
                    "Request Added Successfully.",
                    [
                        { text: "OK", onPress: () => console.log("OK Pressed") }
                    ]
                ); // Alert on screen for successful request
            })
            .catch((error) => {
                console.error('Error adding data:', error);
                setIsLoading(false); // Setting loading state to false in case of an error
            });
    };



    return (


        <View style={styles.container}>
            <OtherUserHeader navigation={navigation} />
            <ScrollView>
                <Text style={styles.title}>Fill out the form to make a blood request:</Text>
                <View style={{ marginLeft: 20, marginRight: 40, marginTop: 10, marginBottom: 10 }}>

                    <Text style={styles.inputLabel}>Name</Text>
                    <Input placeholder={"Full Name"}
                        value={requestFullName}
                        onChangeText={(text) => setRequestFullName(text)} />


                    <Text style={styles.inputLabel}>Enter your phone number:</Text>

                    <View style={styles.phoneInputContainer}>
                        <TextInput
                            style={styles.countryCodeInput}
                            onChangeText={handleChangeCountryCode}
                            placeholder="Country Code"
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

                    <Text style={styles.inputLabel}>Blood Type: </Text>

                    <View style={{ flexDirection: 'row', marginTop: 20, justifyContent: 'space-between', marginRight: 22 }}>

                        <CustomCheckbox
                            label="Whole Blood"
                            isChecked={selectedBloodType === "Whole Blood"}
                            onChange={() => setSelectedBloodType("Whole Blood")}
                        />
                        <CustomCheckbox
                            label="Platelets"
                            isChecked={selectedBloodType === "Platelets"}
                            onChange={() => setSelectedBloodType("Platelets")}
                        />
                    </View>
                    <View style={{ flexDirection: 'row', marginTop: 20, justifyContent: 'space-between', marginBottom: 20 }}>

                        <CustomCheckbox
                            label="Plasma"
                            isChecked={selectedBloodType === "Plasma"}
                            onChange={() => setSelectedBloodType("Plasma")}
                        />
                        <CustomCheckbox
                            label="I Don't Know"
                            isChecked={selectedBloodType === "I Don't Know"}
                            onChange={() => setSelectedBloodType("I Don't Know")}
                        />
                    </View>

                    <Text style={styles.inputLabel}>Blood Group:</Text>
                    <View style={{ marginBottom: 15 }}>
                        <DropDown
                            value={selectedItem}
                            data={bloodType}
                            onSelect={onSelect}
                        />
                    </View>

                    <Text style={styles.inputLabel}>Medical Reason: </Text>

                    <View style={{ flexDirection: 'row', marginTop: 20, justifyContent: 'space-between', marginRight: 22 }}>

                        <CustomCheckbox
                            label="Thalassemia"
                            isChecked={selectedMedicalReason === "Thalassemia"}
                            onChange={() => setSelectedMedicalReason("Thalassemia")}
                        />
                        <CustomCheckbox
                            label="Surgery"
                            isChecked={selectedMedicalReason === "Surgery"}
                            onChange={() => setSelectedMedicalReason("Surgery")}
                        />
                    </View>
                    <View style={{ flexDirection: 'row', marginTop: 20, justifyContent: 'space-between', marginRight: 26 }}>

                        <CustomCheckbox
                            label="Accident"
                            isChecked={selectedMedicalReason === "Accident"}
                            onChange={() => setSelectedMedicalReason("Accident")}
                        />
                        <CustomCheckbox
                            label="Cancer"
                            isChecked={selectedMedicalReason === "Cancer"}
                            onChange={() => setSelectedMedicalReason("Cancer")}
                        />
                    </View>
                    <View style={{ flexDirection: 'row', marginTop: 20, justifyContent: 'space-between', marginBottom: 20, marginRight: 35 }}>

                        <CustomCheckbox
                            label="Pregnancy"
                            isChecked={selectedMedicalReason === "Pregnancy"}
                            onChange={() => setSelectedMedicalReason("Pregnancy")}
                        />
                        <CustomCheckbox
                            label="Other"
                            isChecked={selectedMedicalReason === "Other"}
                            onChange={() => setSelectedMedicalReason("Other")}
                        />
                    </View>
                </View>
                <View>
                    {isLoading ? (
                        <ActivityIndicator size="large" color={COLORS.primaryRed} />
                    ) : (
                        <Button title="Request Blood" onPress={requestAddOn} />
                    )}
                </View>
            </ScrollView>



        </View>
    )
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',

    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        marginTop: 20,
        textAlign: 'center',
        color: COLORS.primaryRed,
        textAlign: 'left',
        marginLeft: 8
    },
    inputLabel: {
        color: '#CF0A0A',
        fontWeight: 'bold',
        marginTop: 10,
        marginBottom: 1,
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
        width: 65,
        elevation: 8,
        shadowColor: "black",
        shadowOffset: { width: 2, height: 2 },
        shadowRadius: 2,
        shadowOpacity: 80,

    },
    phoneNumberInput: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 5,
        marginBottom: 6,
        marginLeft: 10,
        borderWidth: 1.5,
        paddingLeft: 25,
        paddingRight: 125,
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


});
export default RequestPage;
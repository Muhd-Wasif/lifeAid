import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, BackHandler } from 'react-native';
import { getAuth, signOut } from 'firebase/auth';
import Button from "../../components/Button";
import { icons } from '../../constants';
import images from "../../constants/images";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator } from "react-native";
import { COLORS, FONTS, SIZES } from "../../constants/themes";
import { collection, doc, getDocs, onSnapshot, query, where } from 'firebase/firestore'; // Import onSnapshot
import { db } from '../../config';
import { useNavigation } from '@react-navigation/native';
import LoadingModal from '../../components/LoadingModel';


const Menu = () => {

    //Function to navigate back when hardware back button is pressed
    const navigation = useNavigation();
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
    //Other Code
    const [signingOut, setSigningOut] = useState(false);
    const [fullName, setFullName] = useState("");
    const [profilePicture, setProfilePicture] = useState(null);

    useEffect(() => {
        const fetchUserData = async () => {
            const auth = getAuth();
            const user = auth.currentUser;

            if (user) {
                // Query Firestore to get user data based on email
                const q = query(collection(db, 'users'), where('email', '==', user.email));
                const querySnapshot = await getDocs(q);

                if (!querySnapshot.empty) {
                    const docRef = doc(db, 'users', querySnapshot.docs[0].id);

                    // Use onSnapshot to listen for changes to the document
                    const unsubscribe = onSnapshot(docRef, (doc) => {
                        if (doc.exists()) {
                            const userData = doc.data();
                            setFullName(userData.fullName);
                            setProfilePicture(userData.profilePicture); // Set the profile picture from Firestore
                        }
                        setIsLoading(false); // Set loading to false when done
                    });

                    // Clean up the listener when the component unmounts
                    return () => unsubscribe();
                }
            }
        };

        fetchUserData();
    }, []);

    const handleSignOut = () => {
        setSigningOut(true); // Show activity indicator

        setTimeout(() => {
            const auth = getAuth();
            signOut(auth)
                .then(() => {
                    // Clear stored email and password
                    AsyncStorage.removeItem('email');
                    AsyncStorage.removeItem('password');


                    navigation.navigate("Signin"); // Navigate to the Sign In screen after sign out
                    console.log('Navigation complete.');
                    console.log('User signed out');

                })
                .catch((error) => {
                    console.error('Error signing out:', error);
                })
                .finally(() => {
                    setSigningOut(false); // Hide activity indicator
                });
        }, 3000); // 3-second delay before sign out
    };

    return (
        <View style={styles.container}>
            <LoadingModal visible={isLoading} />
            <View style={{ alignItems: "center", justifyContent: "center" }}>
                {/* Use the profilePicture state to display the profile picture */}
                <Image source={profilePicture ? { uri: profilePicture } : icons.profilePicWhite} style={{ marginTop: 60, borderRadius: 50, resizeMode: "cover", height: 95, width: 95, justifyContent: 'center' }} />
                <Text style={{ fontSize: 20, marginTop: 20 }}>{fullName}</Text>
            </View>
            <View style={{ marginLeft: 40, marginRight: 40, marginBottom: 10, marginTop: 70 }}>
                <TouchableOpacity style={styles.blocks} onPress={() => navigation.navigate("Settings")}>
                    <Text style={{ fontSize: 20 }}>
                        Personal Info
                    </Text>
                    <Image source={icons.rightArrowBlack} style={styles.icon} />
                </TouchableOpacity>
            </View>
            <View style={{ marginLeft: 40, marginRight: 40, marginBottom: 30, marginTop: 10 }}>
                <TouchableOpacity style={styles.blocks} onPress={() => navigation.navigate("About")}>
                    <Text style={{ fontSize: 20 }}>
                        About
                    </Text>
                    <Image source={icons.rightArrowBlack} style={styles.icon} />
                </TouchableOpacity>
            </View>
            <View>
                {signingOut ? (
                    <ActivityIndicator size="large" color={COLORS.primaryRed} /> // Show activity indicator while signing out
                ) : (
                    <Button title="Sign Out" onPress={handleSignOut} />
                )}
            </View>

            <View style={styles.bottomContainer}>
                <Image source={images.bottomDesign} style={styles.bottom} />
            </View>

        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'white',
    },
    bottomContainer: {
        flex: 1,
        alignItems: "flex-end",
        justifyContent: "flex-end",
    },
    bottom: {
        height: 150,
        width: 150,
        resizeMode: "contain",
        marginRight: -8,
    },
    blocks: {
        elevation: 10,
        shadowColor: 'black',
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 6,
        shadowOpacity: 0.3,
        padding: 15,
        borderRadius: 10,
        backgroundColor: 'white',
        marginTop: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline'
    },
    icon: {
        justifyContent: 'flex-end',
        height: 16,
        width: 10
    },
    circularImageContainer: {
        width: 100,
        height: 100,
        borderRadius: 50, // Half of the width and height to create a circle
        backgroundColor: COLORS.primaryRed, // You can set the background color to your desired color
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden", // Ensure the image stays within the circular container
    },
    circularImage: {
        width: "100%",
        height: "100%",
        resizeMode: "cover", // Adjust the image content as needed
    },
});

export default Menu;

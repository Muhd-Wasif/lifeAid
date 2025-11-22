import { View, Text, TouchableOpacity, Image, BackHandler, Alert, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons'
import { COLORS, FONTS, SIZES } from "../../constants/themes";
import { admins } from '../../constants/data';
import { useNavigation } from '@react-navigation/native'
import Button from '../../components/Button';
import { getAuth, signOut } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';


const AdminDashboard = () => {
    const navigation = useNavigation();
    const handleIconPress = (screenName) => {
        navigation.navigate(screenName);
    };
    const [signingOut, setSigningOut] = useState(false);
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


    function renderHeader() {
        return (
            <View
                style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginVertical: 12,
                }}
            >
                <TouchableOpacity onPress={() => console.log('Pressed')}>
                    <MaterialCommunityIcons
                        name="view-dashboard"
                        size={28}
                        color={COLORS.primaryRed}
                    />
                </TouchableOpacity>
                <View>
                    <View
                        style={{
                            height: 6,
                            width: 6,
                            backgroundColor: COLORS.primaryRed,
                            borderRadius: 3,
                            position: 'absolute',
                            right: 5,
                            top: 5,
                        }}
                    ></View>
                    <TouchableOpacity onPress={() => console.log('Pressed')}>
                        <Ionicons
                            name="notifications-outline"
                            size={28}
                            color={COLORS.black}
                        />
                    </TouchableOpacity>
                </View>
            </View>
        )
    }


    function renderFeatures() {
        return (
            <View
                style={{
                    marginVertical: SIZES.padding,
                    width: '100%',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                }}
            >

                {admins.map((category, index) => (
                    <TouchableOpacity
                        key={index}
                        style={{
                            height: 120,
                            width: 110,
                            borderColor: COLORS.secondaryWhite,
                            borderWidth: 2,
                            backgroundColor: COLORS.white,
                            borderRadius: 10,
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: 22,
                        }}
                        onPress={() => handleIconPress(category.screen)}
                    >
                        <Image
                            source={category.icon}
                            resizeMode="contain"
                            style={{
                                height: 40,
                                width: 40,
                                marginVertical: 12,
                            }}
                        />
                        <Text
                            style={{
                                ...FONTS.body3,
                                color: COLORS.black,
                            }}
                        >
                            {category.title}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        )
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
            <View style={{ marginHorizontal: 22 }}>
                {renderHeader()}
                {renderFeatures()}
                <View>
                    {signingOut ? (
                        <ActivityIndicator size="large" color={COLORS.primaryRed} /> // Show activity indicator while signing out
                    ) : (
                        <Button title="Sign Out" onPress={handleSignOut} />
                    )}
                </View>
            </View>
        </SafeAreaView>
    )
}

export default AdminDashboard;

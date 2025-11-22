// DonorDataScreen.js

import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, BackHandler } from 'react-native';
import { collection, query, where, getDocs } from 'firebase/firestore'; // Import the necessary Firebase modules
import { db } from '../../../config';
import { COLORS } from '../../../constants';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons'
import LoadingModal from '../../../components/LoadingModel';

const DonorNames = ({ route, navigation }) => {
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

    const { itemName } = route.params;
    const [donorData, setDonorData] = useState([]);
    // To show loading on the screen
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDonorData = async () => {
            const donorDataQuery = query(
                collection(db, 'inventory', itemName, 'donorData'),
            );
            const snapshot = await getDocs(donorDataQuery);
            const donorDataList = snapshot.docs.map(doc => doc.data());
            setDonorData(donorDataList);
            setIsLoading(false);// Set loading to false when done
        };

        fetchDonorData();
    }, [itemName]);

    const handleDonorPress = (donor) => {
        navigation.navigate('DonorDetails', { donor });
    };
    function renderHeader() {
        return (
            <View
                style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginVertical: 12,
                }}
            >
                <TouchableOpacity onPress={() => navigation.navigate("AdminDashboard")}>
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

    return (
        <View style={styles.container}>
            {renderHeader()}
            <LoadingModal visible={isLoading} />
            <Text style={styles.title}>Donor Data for {itemName}</Text>
            <FlatList
                data={donorData}
                keyExtractor={(item, index) => `${item.DonationId}-${index}`}
                renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => handleDonorPress(item)} style={styles.donorItem}>
                        <Text style={styles.donorName}>{item.Name}</Text>
                    </TouchableOpacity>
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: 'white',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 20,
        marginTop: 20,
        textAlign: 'center',
        color: COLORS.primaryRed
    },
    donorItem: {
        elevation: 5,
        shadowColor: 'black',
        shadowOffset: { width: 0, height: 1 },
        shadowRadius: 2,
        shadowOpacity: 0.3,
        padding: 16,
        borderRadius: 10,
        backgroundColor: 'white',
        marginBottom: 10,
        marginRight: 10,
        marginLeft: 5,
        marginTop: 5

    },
    donorName: {
        fontSize: 17
    }
});

export default DonorNames;

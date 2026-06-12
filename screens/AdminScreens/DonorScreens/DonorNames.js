// DonorDataScreen.js

import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, BackHandler } from 'react-native';
import { collection, query, where, getDocs } from 'firebase/firestore'; // Import the necessary Firebase modules
import { db } from '../../../config';
import { COLORS } from '../../../constants';
import LoadingModal from '../../../components/LoadingModel';
import AdminHeader from '../../../components/AdminHeader';

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
            try {
                const registeredDonorsQuery = query(
                    collection(db, 'users'),
                    where('userType', '==', 'donor'),
                    where('bloodGroup', '==', itemName)
                );
                const registeredDonorsSnapshot = await getDocs(registeredDonorsQuery);
                const registeredDonors = registeredDonorsSnapshot.docs.map((docSnap) => ({
                    id: docSnap.id,
                    source: 'users',
                    ...docSnap.data(),
                }));

                const donorDataQuery = query(collection(db, 'inventory', itemName, 'donorData'));
                const snapshot = await getDocs(donorDataQuery);
                const inventoryDonors = snapshot.docs.map((docSnap) => ({
                    id: docSnap.id,
                    source: 'inventory',
                    ...docSnap.data(),
                }));

                setDonorData([...registeredDonors, ...inventoryDonors]);
            } catch (error) {
                console.error('Error fetching donor data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDonorData();
    }, [itemName]);

    const handleDonorPress = (donor) => {
        navigation.navigate('DonorDetails', { donor });
    };
    return (
        <View style={styles.container}>
            <AdminHeader navigation={navigation} />
            <LoadingModal visible={isLoading} />
            <Text style={styles.title}>Donor Data for {itemName}</Text>
            <FlatList
                data={donorData}
                keyExtractor={(item, index) => item.id || `${item.DonationId || item.uid || item.email}-${index}`}
                ListEmptyComponent={!isLoading ? (
                    <Text style={styles.emptyText}>No donors found for {itemName}.</Text>
                ) : null}
                renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => handleDonorPress(item)} style={styles.donorItem}>
                        <Text style={styles.donorName}>{item.Name || item.fullName || `${item.firstName || ''} ${item.lastName || ''}`.trim() || 'Unnamed Donor'}</Text>
                        <Text style={styles.donorMeta}>{item.phoneNumber || item.email || item.Cnic || '-'}</Text>
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
        fontSize: 28,
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
    },
    donorMeta: {
        marginTop: 4,
        fontSize: 13,
        color: '#666',
    },
    emptyText: {
        marginTop: 30,
        textAlign: 'center',
        color: '#666',
        fontSize: 16,
    }
});

export default DonorNames;

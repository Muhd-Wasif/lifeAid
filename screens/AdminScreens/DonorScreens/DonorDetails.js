import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, BackHandler, TouchableOpacity } from 'react-native';
import { collection, query, where, getDocs } from 'firebase/firestore'; // Import the necessary Firebase modules
import { db } from '../../../config';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons'
import { COLORS } from '../../../constants';

const DonorDetails = ({ navigation, route }) => {
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

    const { donor } = route.params;

    // Format the donation date to DD/MM/YYYY
    const formattedDonationDate = new Date(donor.DonationDate.seconds * 1000).toLocaleDateString();
    // Format the expiry date to DD/MM/YYYY
    const formattedExpiryDate = new Date(donor.ExpiryDate).toLocaleDateString();


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
            <Text style={styles.title}>Donor Details</Text>

            <View style={styles.detialContainer}>

                <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Name: </Text>
                    <Text style={styles.detailValue}>{donor.Name}</Text>
                </View>

                <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Donation ID: </Text>
                    <Text style={styles.detailValue}>{donor.DonationId}</Text>
                </View>

                <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>CNIC: </Text>
                    <Text style={styles.detailValue}>{donor.Cnic}</Text>
                </View>

                <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Donation Date: </Text>
                    <Text style={styles.detailValue}>{formattedDonationDate}</Text>
                </View>

                <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Expiry Date: </Text>
                    <Text style={styles.detailValue}>{formattedExpiryDate}</Text>
                </View>

                <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Quantity: </Text>
                    <Text style={styles.detailValue}>{donor.Quantity}</Text>
                </View>

            </View>

        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        backgroundColor: 'white',
    },
    title: {
        fontSize: 36,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        marginTop: 40,
        color: COLORS.primaryRed
    },
    detialContainer: {
        elevation: 10,
        shadowColor: 'black',
        shadowOffset: { width: 1, height: 1 },
        shadowRadius: 2,
        shadowOpacity: 0.3,
        padding: 20,
        borderRadius: 10,
        backgroundColor: 'white',
        marginTop: 15,
        marginLeft: 5,
        marginRight: 5,
        marginBottom: 0
    },
    detailItem: {
        marginBottom: 20,
        flexDirection: 'row',
        marginTop: 10
    },
    detailLabel: {
        fontWeight: '700',
        fontSize: 18,
        width: 180
    },
    detailValue: {
        fontSize: 18,
        flex: 1

    },
});


export default DonorDetails;
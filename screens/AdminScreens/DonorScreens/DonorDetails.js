import React, { useEffect } from 'react';
import { View, Text, StyleSheet, BackHandler } from 'react-native';
import { COLORS } from '../../../constants';
import AdminHeader from '../../../components/AdminHeader';

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

    const getName = () => donor.Name || donor.fullName || `${donor.firstName || ''} ${donor.lastName || ''}`.trim() || '-';
    const formatDate = (value) => {
        if (!value) return '-';
        if (value?.seconds) return new Date(value.seconds * 1000).toLocaleDateString();
        if (value?.toDate) return value.toDate().toLocaleDateString();
        const date = new Date(value);
        return Number.isNaN(date.getTime()) ? '-' : date.toLocaleDateString();
    };


    return (
        <View style={styles.container}>
            <AdminHeader navigation={navigation} />
            <Text style={styles.title}>Donor Details</Text>

            <View style={styles.detialContainer}>

                <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Name: </Text>
                    <Text style={styles.detailValue}>{getName()}</Text>
                </View>

                <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Blood Group: </Text>
                    <Text style={styles.detailValue}>{donor.bloodGroup || donor.BloodGroup || '-'}</Text>
                </View>

                <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>CNIC: </Text>
                    <Text style={styles.detailValue}>{donor.Cnic || donor.cnic || '-'}</Text>
                </View>

                <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Phone: </Text>
                    <Text style={styles.detailValue}>{donor.phoneNumber || donor.PhoneNumber || '-'}</Text>
                </View>

                <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Email: </Text>
                    <Text style={styles.detailValue}>{donor.email || '-'}</Text>
                </View>

                <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Donation Date: </Text>
                    <Text style={styles.detailValue}>{formatDate(donor.DonationDate || donor.lastDonationDate)}</Text>
                </View>

                <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Expiry Date: </Text>
                    <Text style={styles.detailValue}>{formatDate(donor.ExpiryDate)}</Text>
                </View>

                <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Quantity: </Text>
                    <Text style={styles.detailValue}>{donor.Quantity || '-'}</Text>
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
        fontSize: 30,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        marginTop: 12,
        color: COLORS.primaryRed
    },
    detialContainer: {
        elevation: 10,
        shadowColor: 'black',
        shadowOffset: { width: 1, height: 1 },
        shadowRadius: 2,
        shadowOpacity: 0.3,
        padding: 16,
        borderRadius: 10,
        backgroundColor: 'white',
        marginTop: 15,
        marginLeft: 5,
        marginRight: 5,
        marginBottom: 0
    },
    detailItem: {
        marginBottom: 16,
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 8
    },
    detailLabel: {
        fontWeight: '700',
        fontSize: 16,
        minWidth: 130
    },
    detailValue: {
        fontSize: 16,
        flex: 1,
        minWidth: 120

    },
});


export default DonorDetails;

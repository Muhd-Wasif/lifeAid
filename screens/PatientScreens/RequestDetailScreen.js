import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert, TouchableOpacity, Linking } from 'react-native';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../config';
import { COLORS } from '../../constants/themes';
import BackArrow from '../../components/BackArrow';
import { Ionicons as Icon } from '@expo/vector-icons';

const RequestDetailScreen = ({ route, navigation }) => {
    const { requestId } = route.params;
    const [request, setRequest] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRequestDetail = async () => {
            try {
                const requestRef = doc(db, 'requests', requestId);
                const requestSnapshot = await getDoc(requestRef);

                if (requestSnapshot.exists()) {
                    setRequest({
                        id: requestSnapshot.id,
                        ...requestSnapshot.data()
                    });
                } else {
                    Alert.alert('Error', 'Request not found');
                    navigation.goBack();
                }
            } catch (error) {
                console.error('Error fetching request details:', error);
                Alert.alert('Error', 'Failed to load request details');
            } finally {
                setLoading(false);
            }
        };

        fetchRequestDetail();
    }, [requestId]);

    if (loading) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <ActivityIndicator size="large" color={COLORS.primaryRed} />
            </View>
        );
    }

    if (!request) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <Text style={styles.errorText}>Request not found</Text>
            </View>
        );
    }

    const formatDate = (timestamp) => {
        if (!timestamp) return 'N/A';
        const date = timestamp.toDate?.() || new Date(timestamp);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <View style={styles.container}>
            <BackArrow navigation={navigation} />
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.title}>Blood Request Details</Text>

                <View style={styles.detailCard}>
                    <View style={styles.detailRow}>
                        <Text style={styles.label}>Patient Name:</Text>
                        <Text style={styles.value}>{request.fullName}</Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Text style={styles.label}>Phone Number:</Text>
                        <Text style={styles.value}>{request.phoneNumber}</Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Text style={styles.label}>Blood Group:</Text>
                        <Text style={[styles.value, styles.bloodGroupHighlight]}>
                            {request.bloodGroup}
                        </Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Text style={styles.label}>Blood Type:</Text>
                        <Text style={styles.value}>{request.bloodType}</Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Text style={styles.label}>Medical Reason:</Text>
                        <Text style={styles.value}>{request.medicalReason}</Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Text style={styles.label}>Status:</Text>
                        <Text style={[
                            styles.value,
                            request.status === 'open' ? styles.statusOpen : styles.statusClosed
                        ]}>
                            {request.status?.toUpperCase()}
                        </Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Text style={styles.label}>Created By:</Text>
                        <Text style={styles.value}>{request.currentUserName}</Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Text style={styles.label}>Created At:</Text>
                        <Text style={styles.value}>{formatDate(request.createdAt)}</Text>
                    </View>
                </View>

                {/* Contact Buttons */}
                <View style={styles.contactSection}>
                    <Text style={styles.contactTitle}>Contact Patient</Text>
                    <View style={styles.buttonRow}>
                        <TouchableOpacity
                            style={styles.callButton}
                            onPress={() => {
                                const phoneNumber = request.phoneNumber?.replace(/\D/g, '');
                                if (phoneNumber) {
                                    Linking.openURL(`tel:${phoneNumber}`);
                                } else {
                                    Alert.alert('Error', 'Phone number not available');
                                }
                            }}
                        >
                            <Icon name="call" size={20} color="white" />
                            <Text style={styles.buttonText}>Call</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.messageButton}
                            onPress={() => {
                                const phoneNumber = request.phoneNumber?.replace(/\D/g, '');
                                if (phoneNumber) {
                                    Linking.openURL(`sms:${phoneNumber}`);
                                } else {
                                    Alert.alert('Error', 'Phone number not available');
                                }
                            }}
                        >
                            <Icon name="mail" size={20} color="white" />
                            <Text style={styles.buttonText}>Message</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        paddingHorizontal: 15,
        paddingTop: 10,
    },
    scrollContent: {
        paddingBottom: 30,
    },
    centerContent: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.primaryRed,
        marginVertical: 20,
        textAlign: 'center',
    },
    detailCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 20,
        elevation: 5,
        shadowColor: 'black',
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        shadowOpacity: 0.1,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        flex: 0.4,
    },
    value: {
        fontSize: 14,
        color: '#666',
        flex: 0.6,
        textAlign: 'right',
    },
    bloodGroupHighlight: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.primaryRed,
    },
    statusOpen: {
        color: 'green',
        fontWeight: 'bold',
    },
    statusClosed: {
        color: 'red',
        fontWeight: 'bold',
    },
    errorText: {
        fontSize: 16,
        color: COLORS.primaryRed,
        textAlign: 'center',
    },
    contactSection: {
        marginTop: 20,
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 20,
        elevation: 5,
        shadowColor: 'black',
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        shadowOpacity: 0.1,
    },
    contactTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.primaryRed,
        marginBottom: 15,
        textAlign: 'center',
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    callButton: {
        backgroundColor: COLORS.primaryRed,
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 25,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        elevation: 3,
        shadowColor: 'black',
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 3,
        shadowOpacity: 0.15,
    },
    messageButton: {
        backgroundColor: '#4CAF50',
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 25,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        elevation: 3,
        shadowColor: 'black',
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 3,
        shadowOpacity: 0.15,
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 14,
    },
});

export default RequestDetailScreen;

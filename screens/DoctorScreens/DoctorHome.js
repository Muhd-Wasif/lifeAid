import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    ImageBackground,
    Alert,
    SafeAreaView,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useNavigation } from '@react-navigation/native';
import { getAuth, signOut } from 'firebase/auth';
import { collection, doc, getDocs, onSnapshot, query, updateDoc, where } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { db } from '../../config';
import { COLORS } from '../../constants/themes';

export default function DoctorHome() {
    const navigation = useNavigation();
    const [appointments, setAppointments] = useState([]);
    const [doctorInfo, setDoctorInfo] = useState(null);
    const [selectedDate, setSelectedDate] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const isPendingAppointment = (item) => (item.visitStatus || 'pending') === 'pending';
    const isMarkedAppointment = (item) => !isPendingAppointment(item);
    const matchesSelectedDate = (item) => !selectedDate || item.date === selectedDate;
    const pendingAppointments = appointments.filter((item) => isPendingAppointment(item) && matchesSelectedDate(item));
    const markedAppointments = appointments.filter((item) => isMarkedAppointment(item) && matchesSelectedDate(item));
    const doctorName = doctorInfo?.fullName || doctorInfo?.name || 'Doctor';

    useEffect(() => {
        const loadDoctor = async () => {
            const auth = getAuth();
            const user = auth.currentUser;
            if (!user) {
                setIsLoading(false);
                return;
            }

            const usersRef = collection(db, 'users');
            const doctorQuery = query(usersRef, where('uid', '==', user.uid), where('userType', '==', 'doctor'));
            const snapshot = await getDocs(doctorQuery);
            if (!snapshot.empty) {
                setDoctorInfo({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() });
            }
            setIsLoading(false);
        };

        loadDoctor();
    }, []);

    useEffect(() => {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) return undefined;

        const appointmentsRef = collection(db, 'appointments');
        const appointmentQuery = query(appointmentsRef, where('doctorUid', '==', user.uid));

        const unsubscribe = onSnapshot(
            appointmentQuery,
            (snapshot) => {
                const fetched = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
                setAppointments(fetched);
            },
            (error) => {
                console.error('Error fetching doctor appointments:', error);
            }
        );

        return () => unsubscribe();
    }, []);

    const handleVisitUpdate = async (appointmentId, status) => {
        try {
            await updateDoc(doc(db, 'appointments', appointmentId), {
                visitStatus: status,
                doctorNotification: false,
            });
        } catch (error) {
            console.error('Error updating visit status:', error);
            Alert.alert('Error', 'Unable to update appointment status.');
        }
    };

    const handleSignOut = async () => {
        const auth = getAuth();
        try {
            await signOut(auth);
            await AsyncStorage.multiRemove(['email', 'password', 'user']);
            navigation.reset({ index: 0, routes: [{ name: 'Signin' }] });
        } catch (error) {
            console.error('Error signing out:', error);
            Alert.alert('Error', 'Unable to sign out. Please try again.');
        }
    };

    const renderAppointment = ({ item }) => {
        const visitStatus = item.visitStatus || 'pending';
        const isNew = item.status === 'booked' && visitStatus === 'pending';
        const showActions = visitStatus === 'pending';

        return (
            <View key={item.id} style={styles.card}>
                <View style={styles.rowTop}>
                    <Text style={styles.patientName}>{item.firstName} {item.lastName}</Text>
                    {isNew && <Text style={styles.newBadge}>New</Text>}
                </View>
                <Text style={styles.detail}>Patient CNIC: {item.cnic || '-'}</Text>
                <Text style={styles.detail}>Date: {item.date || '-'}</Text>
                <Text style={styles.detail}>Time: {item.time || '-'}</Text>
                <Text style={styles.detail}>Status: {item.status || 'booked'}</Text>
                <Text style={styles.detail}>Visit Status: {visitStatus}</Text>
                {showActions && (
                    <View style={styles.actionsRow}>
                        <TouchableOpacity
                            style={[styles.actionButton, styles.visitedButton]}
                            onPress={() => handleVisitUpdate(item.id, 'visited')}
                        >
                            <Text style={styles.actionText}>Mark Visited</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.actionButton, styles.missedButton]}
                            onPress={() => handleVisitUpdate(item.id, 'not visited')}
                        >
                            <Text style={styles.actionText}>Not Visited</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        );
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primaryRed} />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ImageBackground
                source={require('../../assets/home_background.jpg')}
                style={styles.background}
                resizeMode="cover"
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <View style={styles.header}>
                        <View style={styles.headerRow}>
                            <View style={styles.headerIdentity}>
                                <View style={styles.avatarCircle}>
                                    <Ionicons name="medical-outline" size={25} color={COLORS.primaryRed} />
                                </View>
                                <View style={styles.headerTextWrap}>
                                    <Text style={styles.headerTitle}>Doctor Portal</Text>
                                    <Text style={styles.headerName} numberOfLines={1}>{doctorName}</Text>
                                </View>
                            </View>
                            <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut} activeOpacity={0.85}>
                                <Ionicons name="log-out-outline" size={18} color="#fff" />
                                <Text style={styles.signOutText}>Sign Out</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.greeting}>
                        <View style={styles.redLine} />
                        <View style={styles.textContainer}>
                            <Text style={styles.hello}>Hello, <Text style={styles.name}>{doctorName}</Text></Text>
                            <Text style={styles.welcome}>Review patient visit and update appointment status.</Text>
                        </View>
                    </View>

                    <View style={styles.quoteCard}>
                        <Text style={styles.quoteTitle}>Today Overview</Text>
                        <Text style={styles.quoteText}>
                            {selectedDate ? `Showing appointments for ${selectedDate}.` : 'Select a date to focus the dashboard.'}
                        </Text>
                    </View>

                    <View style={styles.summaryRow}>
                        <TouchableOpacity
                            style={[styles.summaryCard, styles.summaryCardButton]}
                            onPress={() => navigation.navigate('DoctorAppointmentList', { filter: 'marked', selectedDate })}
                        >
                            <View style={styles.summaryIcon}>
                                <Ionicons name="checkmark-done-outline" size={22} color={COLORS.primaryRed} />
                            </View>
                            <Text style={styles.summaryLabel}>Appointments</Text>
                            <Text style={styles.summaryValue}>{markedAppointments.length}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.summaryCard, styles.summaryCardButton]}
                            onPress={() => navigation.navigate('DoctorAppointmentList', { filter: 'pending', selectedDate })}
                        >
                            <View style={styles.summaryIcon}>
                                <Ionicons name="time-outline" size={22} color={COLORS.primaryRed} />
                            </View>
                            <Text style={styles.summaryLabel}>Pending</Text>
                            <Text style={styles.summaryValue}>{pendingAppointments.length}</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.filterCard}>
                        <Text style={styles.filterTitle}>Filter by date</Text>
                        <Calendar
                            current={selectedDate || undefined}
                            onDayPress={(day) => setSelectedDate(day.dateString)}
                            markedDates={selectedDate ? { [selectedDate]: { selected: true, selectedColor: COLORS.primaryRed } } : {}}
                            theme={{ todayTextColor: COLORS.primaryRed, arrowColor: COLORS.primaryRed, selectedDayBackgroundColor: COLORS.primaryRed }}
                        />
                        {selectedDate ? (
                            <TouchableOpacity style={styles.clearButton} onPress={() => setSelectedDate('')}>
                                <Text style={styles.clearButtonText}>Clear date filter</Text>
                            </TouchableOpacity>
                        ) : null}
                    </View>

                    {appointments.length === 0 ? (
                        <Text style={styles.emptyText}>No appointments assigned yet.</Text>
                    ) : (
                        <View style={styles.sectionContainer}>
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>Pending / Not Visited</Text>
                                <Text style={styles.sectionCount}>{pendingAppointments.length}</Text>
                            </View>
                            {pendingAppointments.length === 0 ? (
                                <Text style={styles.emptyText}>No pending appointments found.</Text>
                            ) : (
                                pendingAppointments.map((item) => renderAppointment({ item }))
                            )}

                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>Marked</Text>
                                <Text style={styles.sectionCount}>{markedAppointments.length}</Text>
                            </View>
                            {markedAppointments.length === 0 ? (
                                <Text style={styles.emptyText}>No marked appointments found.</Text>
                            ) : (
                                markedAppointments.map((item) => renderAppointment({ item }))
                            )}
                        </View>
                    )}
                </ScrollView>
            </ImageBackground>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    background: {
        flex: 1,
    },
    header: {
        backgroundColor: COLORS.primaryRed,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        paddingHorizontal: 14,
        paddingTop: 14,
        paddingBottom: 16,
        marginHorizontal: -14,
        marginBottom: 12,
    },
    headerIdentity: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingRight: 8,
    },
    avatarCircle: {
        width: 46,
        height: 46,
        borderRadius: 23,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    headerTextWrap: {
        flex: 1,
    },
    headerTitle: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '600',
    },
    headerName: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
        marginBottom: 16,
    },
    summaryCard: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 16,
        elevation: 3,
    },
    summaryCardButton: {
        flex: 1,
    },
    summaryLabel: {
        color: '#555',
        fontSize: 14,
        marginTop: 8,
    },
    summaryValue: {
        marginTop: 8,
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.primaryRed,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    signOutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 9,
        backgroundColor: 'rgba(255,255,255,0.18)',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.35)',
    },
    signOutText: {
        color: '#fff',
        fontWeight: '700',
        marginLeft: 5,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 18,
        padding: 18,
        marginBottom: 12,
        elevation: 3,
    },
    rowTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    patientName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#222',
    },
    newBadge: {
        backgroundColor: COLORS.primaryRed,
        color: '#fff',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        fontSize: 12,
        fontWeight: 'bold',
    },
    detail: {
        fontSize: 14,
        color: '#444',
        marginBottom: 6,
    },
    actionsRow: {
        flexDirection: 'row',
        marginTop: 10,
    },
    actionButton: {
        flex: 1,
        borderRadius: 12,
        paddingVertical: 12,
        alignItems: 'center',
        marginHorizontal: 4,
    },
    visitedButton: {
        backgroundColor: '#2E8B57',
    },
    missedButton: {
        backgroundColor: '#B22222',
    },
    actionText: {
        color: '#fff',
        fontWeight: '700',
    },
    filterCard: {
        backgroundColor: 'rgba(255,255,255,0.95)',
        borderRadius: 18,
        padding: 16,
        marginBottom: 20,
        elevation: 2,
    },
    greeting: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: 16,
        backgroundColor: '#fff',
        borderRadius: 22,
        marginBottom: 12,
        elevation: 2,
    },
    redLine: {
        width: 4,
        height: 42,
        backgroundColor: COLORS.primaryRed,
        borderRadius: 2,
        marginRight: 10,
    },
    textContainer: {
        flex: 1,
    },
    hello: {
        fontSize: 19,
        fontWeight: '600',
        color: '#000',
    },
    name: {
        fontWeight: '800',
        color: '#000',
    },
    welcome: {
        marginTop: 4,
        fontSize: 13,
        color: '#666',
        lineHeight: 18,
    },
    quoteCard: {
        backgroundColor: '#e9e9e9ff',
        padding: 16,
        borderRadius: 14,
        elevation: 2,
        marginBottom: 12,
    },
    quoteTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.primaryRed,
        marginBottom: 6,
        textAlign: 'center',
    },
    quoteText: {
        fontSize: 14,
        color: COLORS.black,
        textAlign: 'center',
    },
    summaryIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f4eeee',
        alignItems: 'center',
        justifyContent: 'center',
    },
    filterTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 10,
        color: '#333',
    },
    clearButton: {
        marginTop: 12,
        alignSelf: 'flex-start',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 12,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: COLORS.primaryRed,
    },
    clearButtonText: {
        color: COLORS.primaryRed,
        fontWeight: '700',
    },
    scrollContent: {
        paddingHorizontal: 14,
        paddingTop: 0,
        paddingBottom: 40,
    },
    sectionContainer: {
        paddingBottom: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        marginTop: 10,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#333',
    },
    sectionCount: {
        fontSize: 16,
        color: COLORS.primaryRed,
        fontWeight: '700',
    },
    emptyText: {
        marginTop: 10,
        textAlign: 'center',
        color: '#666',
        fontSize: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

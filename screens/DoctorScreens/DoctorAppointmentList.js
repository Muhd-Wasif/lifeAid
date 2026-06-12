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
import { useNavigation, useRoute } from '@react-navigation/native';
import { getAuth, signOut } from 'firebase/auth';
import { collection, doc, getDocs, onSnapshot, query, updateDoc, where } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '../../config';
import { COLORS } from '../../constants/themes';
import BackArrow from '../../components/BackArrow';

export default function DoctorAppointmentList() {
    const navigation = useNavigation();
    const route = useRoute();
    const { filter = 'marked', selectedDate: initialSelectedDate = '' } = route.params || {};
    const [appointments, setAppointments] = useState([]);
    const [doctorInfo, setDoctorInfo] = useState(null);
    const [selectedDate, setSelectedDate] = useState(initialSelectedDate);
    const [isLoading, setIsLoading] = useState(true);

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
                Alert.alert('Error', 'Unable to load appointments.');
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

    const filteredAppointments = appointments.filter((item) => {
        const dateMatch = !selectedDate || item.date === selectedDate;
        if (filter === 'pending') {
            return dateMatch && (item.visitStatus || 'pending') === 'pending';
        }
        if (filter === 'marked') {
            return dateMatch && (item.visitStatus || 'pending') !== 'pending';
        }
        return dateMatch;
    });

    const title = filter === 'pending' ? 'Pending Appointments' : 'Marked Appointments';

    const renderAppointment = (item) => {
        const visitStatus = item.visitStatus || 'pending';
        const showActions = visitStatus === 'pending';

        return (
            <View key={item.id} style={styles.card}>
                <View style={styles.rowTop}>
                    <Text style={styles.patientName}>{item.firstName} {item.lastName}</Text>
                    {visitStatus === 'pending' && <Text style={styles.newBadge}>New</Text>}
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
                            <BackArrow navigation={navigation} />
                            <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
                                <Text style={styles.signOutText}>Sign Out</Text>
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.title}>{title}</Text>
                        {doctorInfo && (
                            <Text style={styles.subtitle}>{doctorInfo.fullName || doctorInfo.name}</Text>
                        )}
                    </View>

                    <View style={styles.filterCard}>
                        <Text style={styles.filterTitle}>Select date</Text>
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

                    {filteredAppointments.length === 0 ? (
                        <Text style={styles.emptyText}>No appointments found for this selection.</Text>
                    ) : (
                        filteredAppointments.map((item) => renderAppointment(item))
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
        marginTop: 40,
        marginBottom: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.primaryRed,
    },
    subtitle: {
        fontSize: 18,
        color: '#333',
        marginTop: 4,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    signOutButton: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        backgroundColor: COLORS.primaryRed,
        borderRadius: 10,
    },
    signOutText: {
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
    scrollContent: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 40,
    },
    summaryCardButton: {
        flex: 1,
    },
});

import React, { useEffect, useMemo, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    BackHandler,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { collection, onSnapshot } from 'firebase/firestore';
import { Picker } from '@react-native-picker/picker';
import { db } from '../../../config';
import AdminHeader from '../../../components/AdminHeader';
import LoadingModal from '../../../components/LoadingModel';
import { COLORS } from '../../../constants';

export default function ManageAppointments() {
    const navigation = useNavigation();
    const [appointments, setAppointments] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [selectedDoctorId, setSelectedDoctorId] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            navigation.goBack();
            return true;
        });

        return () => backHandler.remove();
    }, [navigation]);

    useEffect(() => {
        const appointmentsRef = collection(db, 'appointments');
        const unsubscribe = onSnapshot(
            appointmentsRef,
            (snapshot) => {
                const fetched = snapshot.docs.map((docSnap) => ({
                    id: docSnap.id,
                    ...docSnap.data(),
                }));
                setAppointments(fetched);
                setIsLoading(false);
            },
            (error) => {
                console.error('Error loading appointments:', error);
                setIsLoading(false);
            }
        );

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const doctorsRef = collection(db, 'doctors');
        const unsubscribe = onSnapshot(
            doctorsRef,
            (snapshot) => {
                const fetched = snapshot.docs.map((docSnap) => ({
                    id: docSnap.id,
                    ...docSnap.data(),
                }));
                setDoctors(fetched);
            },
            (error) => {
                console.error('Error loading doctors for appointments:', error);
            }
        );

        return () => unsubscribe();
    }, []);

    const filteredAppointments = useMemo(() => {
        if (!selectedDoctorId) return appointments;
        return appointments.filter((appointment) => (
            appointment.doctorId === selectedDoctorId ||
            appointment.doctorUid === selectedDoctorId ||
            appointment.doctorName === doctors.find((doctor) => doctor.id === selectedDoctorId)?.name
        ));
    }, [appointments, selectedDoctorId, doctors]);

    return (
        <View style={styles.container}>
            <AdminHeader navigation={navigation} />
            <LoadingModal visible={isLoading} />
            <Text style={styles.title}>Patient Appointments</Text>
            <View style={styles.pickerWrap}>
                <Picker
                    selectedValue={selectedDoctorId}
                    onValueChange={setSelectedDoctorId}
                >
                    <Picker.Item label="All Doctors" value="" />
                    {doctors.map((doctor) => (
                        <Picker.Item
                            key={doctor.id}
                            label={doctor.name || doctor.fullName || doctor.email || 'Doctor'}
                            value={doctor.id}
                        />
                    ))}
                </Picker>
            </View>
            {filteredAppointments.length === 0 ? (
                <Text style={styles.emptyText}>No appointment records found.</Text>
            ) : (
                <FlatList
                    data={filteredAppointments}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    renderItem={({ item }) => (
                        <View style={styles.card}>
                            <View style={styles.row}>
                                <Text style={styles.label}>Patient:</Text>
                                <Text style={styles.value}>{item.firstName} {item.lastName}</Text>
                            </View>
                            <View style={styles.row}>
                                <Text style={styles.label}>Doctor:</Text>
                                <Text style={styles.value}>{item.doctorName || item.doctor || '-'}</Text>
                            </View>
                            <View style={styles.row}>
                                <Text style={styles.label}>Date:</Text>
                                <Text style={styles.value}>{item.date || '-'}</Text>
                            </View>
                            <View style={styles.row}>
                                <Text style={styles.label}>Time:</Text>
                                <Text style={styles.value}>{item.time || '-'}</Text>
                            </View>
                            <View style={styles.row}>
                                <Text style={styles.label}>Status:</Text>
                                <Text style={styles.value}>{item.status || 'booked'}</Text>
                            </View>
                            <View style={styles.row}>
                                <Text style={styles.label}>Visit Status:</Text>
                                <Text style={styles.value}>{item.visitStatus || 'pending'}</Text>
                            </View>
                        </View>
                    )}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
        paddingHorizontal: 12,
    },
    title: {
        fontSize: 30,
        fontWeight: 'bold',
        color: COLORS.primaryRed,
        marginTop: 10,
        marginBottom: 16,
        textAlign: 'center',
    },
    emptyText: {
        color: '#666',
        textAlign: 'center',
        marginTop: 20,
        fontSize: 16,
    },
    pickerWrap: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
        marginBottom: 12,
        overflow: 'hidden',
        backgroundColor: '#fff',
    },
    card: {
        backgroundColor: '#fafafa',
        borderRadius: 14,
        padding: 16,
        marginBottom: 12,
        elevation: 2,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    label: {
        fontWeight: '600',
        color: '#444',
        flex: 1,
    },
    value: {
        flex: 1,
        textAlign: 'right',
        color: '#333',
    },
});

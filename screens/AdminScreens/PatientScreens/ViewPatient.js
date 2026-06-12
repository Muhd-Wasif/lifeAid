import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, BackHandler } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../../../constants';
import AdminHeader from '../../../components/AdminHeader';

const PatientDetails = ({ route }) => {
  const navigation = useNavigation();
  const { patientData } = route.params;

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        navigation.goBack();
        return true;
      }
    );
    return () => backHandler.remove();
  }, [navigation]);

  const handleEdit = () => {
    navigation.navigate('ModifyPatient', { patientData });
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <AdminHeader navigation={navigation} />

      <Text style={styles.title}>
        {patientData.firstName} {patientData.lastName}
      </Text>

      <View style={styles.infoItem}>
        <Text style={styles.infoLabel}>Patient ID</Text>
        <Text style={styles.infoValue}>{patientData.id}</Text>
      </View>

      <View style={styles.infoItem}>
        <Text style={styles.infoLabel}>Father Name</Text>
        <Text style={styles.infoValue}>{patientData.fatherName || '-'}</Text>
      </View>

      <View style={styles.infoItem}>
        <Text style={styles.infoLabel}>Phone Number</Text>
        <Text style={styles.infoValue}>{patientData.phoneNumber}</Text>
      </View>

      <View style={styles.infoItem}>
        <Text style={styles.infoLabel}>Email</Text>
        <Text style={styles.infoValue}>{patientData.email || '-'}</Text>
      </View>

      <View style={styles.infoItem}>
        <Text style={styles.infoLabel}>CNIC</Text>
        <Text style={styles.infoValue}>{patientData.cnic}</Text>
      </View>

      <View style={styles.infoItem}>
        <Text style={styles.infoLabel}>Address</Text>
        <Text style={styles.infoValue}>{patientData.address || '-'}</Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleEdit}>
        <Text style={styles.buttonText}>Edit</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleBack}>
        <Text style={styles.buttonText}>Back</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    backgroundColor: 'white'
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20
  },
  infoItem: {
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    marginVertical: 6
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#555'
  },
  infoValue: {
    fontSize: 16,
    marginTop: 4
  },
  button: {
    backgroundColor: COLORS.primaryRed,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 10,
    marginHorizontal: 0
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16
  }
});

export default PatientDetails;

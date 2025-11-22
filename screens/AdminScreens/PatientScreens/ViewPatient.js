import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, BackHandler } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../../../constants';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons'

const PatientDetails = ({ route }) => {
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

  const { patientData } = route.params;
  const navigation = useNavigation();

  const handleEdit = () => {


    // Navigate to the EditPatient screen with the patientData
    navigation.navigate('ModifyPatient', { patientData });
  };



  const handleBack = () => {
    // Navigate back to the PatientInfo screen
    navigation.navigate('PatientInfo');
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
      <Text style={styles.title}> {patientData.name}</Text>

      {/* First Row */}
      <View style={styles.row}>
        <View style={styles.column}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Patient ID:</Text>
            <Text style={styles.infoValue}>{patientData.patientID}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Age:</Text>
            <Text style={styles.infoValue}>{patientData.age}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Blood Group:</Text>
            <Text style={styles.infoValue}>{patientData.bloodGroup}</Text>
          </View>
        </View>

        {/* Second Row */}
        <View style={styles.column}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Registration:</Text>
            <Text style={styles.infoValue}>{patientData.registrationDate}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Previous Visit:</Text>
            <Text style={styles.infoValue}>{patientData.previousAppointment}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Upcoming Visit:</Text>
            <Text style={styles.infoValue}>{patientData.upcomingAppointment}</Text>
          </View>
        </View>
      </View>

      {/* Edit Button */}
      <TouchableOpacity style={styles.button} onPress={handleEdit}>
        <Text style={styles.buttonText}>Edit</Text>
      </TouchableOpacity>

      {/* Back Button */}
      <TouchableOpacity style={styles.button} onPress={handleBack}>
        <Text style={styles.buttonText}>Back</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal:16,
    paddingVertical:5,
    backgroundColor: 'white'
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 60,
    marginBottom: 20
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  column: {
    flex: 1,
  },
  infoItem: {
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
  infoLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
  },
  button: {
    backgroundColor: COLORS.primaryRed,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 15,
    marginLeft: 80,
    marginRight: 80
  },
  buttonText: {
    fontWeight: 'bold',
    color: 'white',
    fontSize: 17,
  },
});

export default PatientDetails;
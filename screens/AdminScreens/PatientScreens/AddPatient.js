import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, BackHandler } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { COLORS } from '../../../constants';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons'

const AddPatient = ({ route }) => {

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

  const navigation = useNavigation();

  const [patientName, setPatientName] = useState('');
  const { onAddPatient } = route.params;

  const handleAddPatient = () => {
    if (patientName) {
      // Generate a unique ID for the new patient (you can use a library or a server-generated ID)
      const SerialId = Math.random().toString(36).substr(2, 9);

      // Create a new patient object
      const newPatient = {
        id: SerialId,
        name: patientName,
      };

      // Pass the new patient data back to the PatientInfo screen
      onAddPatient(newPatient);

      // Navigate back to the PatientInfo screen
      navigation.goBack();
    }
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
      <View style={{
        marginLeft: 15,
        marginRight: 15
      }}>
        <Text style={styles.title}>Add New Patient</Text>
        <TextInput
          style={styles.input}
          placeholder="Patient Name"
          value={patientName}
          onChangeText={(text) => setPatientName(text)}
        />
        <TouchableOpacity style={styles.button} onPress={handleAddPatient}>
          <Text style={styles.buttonText}>Add Patient</Text>
        </TouchableOpacity>

      </View>
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
    color: COLORS.primaryRed,
    fontSize: 34,
    fontWeight: 'bold',
    marginBottom: 36,
    marginTop: 10,
    alignSelf: 'center'
  },
  input: {
    height: 55,
    borderColor: '#ccc',
    borderWidth: 2,
    borderRadius: 8,
    marginBottom: 56,
    paddingHorizontal: 10,
    fontSize: 16
  },
  button: {
    backgroundColor: COLORS.primaryRed,
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    marginLeft: 50,
    marginRight: 50
  },
  buttonText: {
    fontWeight: 'bold',
    color: 'white',
    fontSize: 18,
  },
});

export default AddPatient;
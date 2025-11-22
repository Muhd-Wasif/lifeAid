import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, BackHandler } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { icons, COLORS } from '../../../constants';
import { Picker } from '@react-native-picker/picker';
import { db } from '../../../config';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons'
import { collection, setDoc,doc } from 'firebase/firestore';

const ModifyPatient = () => {
  const [isAgeDatePickerVisible, setAgeDatePickerVisibility] = useState(false);
  const [isRegistrationDatePickerVisible, setRegistrationDatePickerVisibility] = useState(false);
  const [isPreviousAppointmentDatePickerVisible, setPreviousAppointmentDatePickerVisibility] = useState(false);
  const [isUpcomingAppointmentDatePickerVisible, setUpcomingAppointmentDatePickerVisibility] = useState(false);

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
  const route = useRoute();
  const { patientData } = route.params || {};

  const [editedData, setEditedData] = useState({
    patientID: patientData.patientID || '', // Use the generated patient ID
    age: patientData.age || '',
    registrationDate: patientData.registrationDate || '',
    previousAppointment: patientData.previousAppointment || '',
    upcomingAppointment: patientData.upcomingAppointment || '',
    bloodGroup: patientData.bloodGroup || '', // New state for blood group
  });

  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [dateField, setDateField] = useState('');

  const [selectedBloodGroup, setSelectedBloodGroup] = useState(editedData.bloodGroup); // State for selected blood group

  const showDatePicker = (field) => {
    switch (field) {
      case 'age':
        setAgeDatePickerVisibility(true);
        break;
      case 'registrationDate':
        setRegistrationDatePickerVisibility(true);
        break;
      case 'previousAppointment':
        setPreviousAppointmentDatePickerVisibility(true);
        break;
      case 'upcomingAppointment':
        setUpcomingAppointmentDatePickerVisibility(true);
        break;
      default:
        break;
    }
    setDateField(field);
  };

  const hideDatePicker = (field) => {
    switch (field) {
      case 'age':
        setAgeDatePickerVisibility(false);
        break;
      case 'registrationDate':
        setRegistrationDatePickerVisibility(false);
        break;
      case 'previousAppointment':
        setPreviousAppointmentDatePickerVisibility(false);
        break;
      case 'upcomingAppointment':
        setUpcomingAppointmentDatePickerVisibility(false);
        break;
      default:
        break;
    }
  };

  const handleDateConfirm = (selectedDate) => {
    hideDatePicker();
    if (dateField) {
      setEditedData({ ...editedData, [dateField]: selectedDate });
    }
    if (dateField) {
      if (dateField === 'age') {
        // Calculate age based on the selected date
        const birthDate = new Date(selectedDate);
        const currentDate = new Date();
        const age = currentDate.getFullYear() - birthDate.getFullYear();

        // Check if the birthdate for this year has occurred or not
        if (
          currentDate.getMonth() < birthDate.getMonth() ||
          (currentDate.getMonth() === birthDate.getMonth() &&
            currentDate.getDate() < birthDate.getDate())
        ) {
          // Subtract 1 if the birthdate for this year hasn't occurred yet
          setEditedData({ ...editedData, age: (age - 1).toString() });
        } else {
          setEditedData({ ...editedData, age: age.toString() });
        }
      } else {
        // Convert the selectedDate to an ISO date string
        const dateValue = selectedDate.toISOString().split('T')[0];
        setEditedData({ ...editedData, [dateField]: dateValue });
      }
    }
  };

  const handleSaveChanges = () => {
    // Implement logic to save changes to patient data
    // This is where you would update the patient data with the editedData

    const patientRef = doc(db, 'patients', patientData.id); // Replace 'id' with the actual field name that holds the patient's document ID

    // Create a new object for the updated patient data, including the selected blood group
    const updatedPatientData = {
      ...patientData, // Include the original data
      ...editedData, // Include the edited data
      name: patientData.name, // Keep the name unchanged
      patientID: editedData.patientID, // Include the updated patientID
      bloodGroup: selectedBloodGroup, // Include the selected blood group
    };

    setDoc(patientRef, updatedPatientData)
    .then(() => {
      console.log('Patient data updated in Firestore');
      // After Saving Changes, navigate back to the View Patient Screen
      navigation.navigate('ViewPatient', { patientData: updatedPatientData });
    })
    .catch((error) => {
      console.error('Error updating patient data in Firestore:', error);
    });
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
      <Text style={styles.title}>Edit Patient Details</Text>

      <TextInput
        style={styles.input}
        placeholder="Patient ID"
        value={editedData.patientID}
        keyboardType="numeric"
        onChangeText={(text) => setEditedData({ ...editedData, patientID: text })}
        maxLength={6}
      />
      {/* Age Picker */}
      <View style={styles.datePickerContainer}>
        <TextInput
          style={styles.dateInput}
          placeholder="Age"
          value={editedData.age.toString()}
          editable={false}
        />
        <TouchableOpacity onPress={() => showDatePicker('age')}>
          <Image style={{ marginLeft: 10, marginRight: 10 }} source={icons.datepicker1} />
        </TouchableOpacity>
      </View>
      <DateTimePickerModal
        isVisible={isAgeDatePickerVisible}
        mode="date"
        onConfirm={handleDateConfirm}
        onCancel={() => hideDatePicker('age')} // Pass the field name to hideDatePicker
      />

      {/* Registration Date Picker */}
      <View style={styles.datePickerContainer}>
        <TextInput
          style={styles.dateInput}
          placeholder="Registration Date"
          value={editedData.registrationDate.toString()}
          editable={false}
        />
        <TouchableOpacity onPress={() => showDatePicker('registrationDate')}>
          <Image style={{ marginLeft: 10, marginRight: 10 }} source={icons.datepicker1} />
        </TouchableOpacity>
      </View>
      <DateTimePickerModal
        isVisible={isRegistrationDatePickerVisible}
        mode="date"
        onConfirm={handleDateConfirm}
        onCancel={() => hideDatePicker('registrationDate')} // Pass the field name to hideDatePicker
      />

      {/* Previous Appointment Picker */}
      <View style={styles.datePickerContainer}>
        <TextInput
          style={styles.dateInput}
          placeholder="Previous Appointment"
          value={editedData.previousAppointment.toString()}
          editable={false}
        />
        <TouchableOpacity onPress={() => showDatePicker('previousAppointment')}>
          <Image style={{ marginLeft: 10, marginRight: 10 }} source={icons.datepicker1} />
        </TouchableOpacity>
      </View>
      <DateTimePickerModal
        isVisible={isPreviousAppointmentDatePickerVisible}
        mode="date"
        onConfirm={handleDateConfirm}
        onCancel={() => hideDatePicker('previousAppointment')} // Pass the field name to hideDatePicker
      />

      {/* Upcoming Appointment Picker */}
      <View style={styles.datePickerContainer}>
        <TextInput
          style={styles.dateInput}
          placeholder="Upcoming Appointment"
          value={editedData.upcomingAppointment.toString()}
          editable={false}
        />
        <TouchableOpacity onPress={() => showDatePicker('upcomingAppointment')}>
          <Image style={{ marginLeft: 10, marginRight: 10 }} source={icons.datepicker1} />
        </TouchableOpacity>
      </View>
      <DateTimePickerModal
        isVisible={isUpcomingAppointmentDatePickerVisible}
        mode="date"
        onConfirm={handleDateConfirm}
        onCancel={() => hideDatePicker('upcomingAppointment')} // Pass the field name to hideDatePicker
      />

      {/* Blood Group Picker */}
      <Text style={styles.pickerLabel}>Blood Group:</Text>
      <View style={styles.pickerContainer}>


        <Picker
          style={styles.picker}
          selectedValue={selectedBloodGroup}
          onValueChange={(itemValue) => setSelectedBloodGroup(itemValue)}
        >
          <Picker.Item label="Select Blood Group" value="" />
          <Picker.Item label="A+" value="A+" />
          <Picker.Item label="B+" value="B+" />
          <Picker.Item label="AB+" value="AB+" />
          <Picker.Item label="O+" value="O+" />
          <Picker.Item label="A-" value="A-" />
          <Picker.Item label="B-" value="B-" />
          <Picker.Item label="AB-" value="AB-" />
          <Picker.Item label="O-" value="O-" />
        </Picker>
      </View>

      {/* Save Changes Button */}
      <TouchableOpacity style={styles.saveButton} onPress={handleSaveChanges}>
        <Text style={styles.saveButtonText}>Save Changes</Text>
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
    color: COLORS.primaryRed,
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 50,
    marginTop: 10
  },
  datePickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  dateInput: {
    color: 'black',
    flex: 1,
    borderWidth: 2,
    borderRadius: 10,
    borderColor: '#ccc',
    padding: 10,
  },
  input: {
    height: 52,
    borderColor: '#ccc',
    borderWidth: 2,
    borderRadius: 10,
    marginRight: 68,
    marginBottom: 16,
    paddingHorizontal: 8,

  },
  saveButton: {
    backgroundColor: COLORS.primaryRed,
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    marginRight: 50,
    marginLeft: 50
  },
  saveButtonText: {
    fontWeight: 'bold',
    color: 'white',
    fontSize: 18,
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 50,
    borderColor: '#ccc',
    borderWidth: 2,
    borderRadius: 10,
    padding: 2
  },
  pickerLabel: {
    fontSize: 16,
    marginBottom: 10

  },
  picker: {
    flex: 2,


  },
});

export default ModifyPatient;
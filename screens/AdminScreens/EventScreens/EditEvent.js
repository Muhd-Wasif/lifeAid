import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, BackHandler, Alert } from 'react-native';
import { COLORS, icons } from '../../../constants';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { useNavigation } from '@react-navigation/native';
import { collection, getDocs, doc, addDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore'; // Added necessary imports for Firestore
import { db } from "../../../config";
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons'
import { getAuth } from 'firebase/auth';
import { ActivityIndicator } from 'react-native';


const EditEvent = ({ route, navigation }) => {
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

  const { event, updateEventData } = route.params; // Get the event details from props
  const [editedEvent, setEditedEvent] = useState(event);

  // Add state variables to manage the date picker visibility and selected dates:
  const [isStartDatePickerVisible, setStartDatePickerVisible] = useState(false);
  const [isEndDatePickerVisible, setEndDatePickerVisible] = useState(false);
  const [startDate, setStartDate] = useState(event.startDate ? new Date(event.startDate) : null);
  const [endDate, setEndDate] = useState(event.endDate ? new Date(event.endDate) : null);
  //To show actitivty indicator
  const [isSaving, setIsSaving] = useState(false);
  // Create functions to handle date picker visibility and selected dates:
  //Activity Indicator

  const [isLoading, setIsLoading] = useState(false);
  const [eventID, setEventID] = useState(event.eventID || ''); // Initialize with existing eventID or empty string
  const showStartDatePicker = () => {
    setStartDatePickerVisible(true);
  };

  const hideStartDatePicker = () => {
    setStartDatePickerVisible(false);
  };

  const handleStartDateConfirm = (date) => {
    setStartDate(date);
    hideStartDatePicker();
  };

  const showEndDatePicker = () => {
    setEndDatePickerVisible(true);
  };

  const hideEndDatePicker = () => {
    setEndDatePickerVisible(false);
  };

  const handleEndDateConfirm = (date) => {
    setEndDate(date);
    hideEndDatePicker();
  };

  const eventsRef = collection(db, 'events');
  const handleSaveChanges = async () => {
    setIsLoading(true); // Start showing the activity indicator
    // Implement logic to save the changes made to the event
    // ...

    // Add the event to Firestore
    try {
      const eventData = {
        title: editedEvent.title,
        location: editedEvent.location,
        startDate: startDate ? startDate.toISOString() : null,
        endDate: endDate ? endDate.toISOString() : null,
        eventID: eventID || doc(collection(db, 'events')).id, // Use existing or generate a new one
      };

      await addDoc(eventsRef, eventData);
      // Call the updateEventData callback to update the event data
      updateEventData({
        ...editedEvent,
        startDate: startDate ? startDate.toISOString() : null,
        endDate: endDate ? endDate.toISOString() : null,
        eventID: eventData.eventID,
      });

      // Navigate back to the ManageEvent screen
      navigation.goBack();
    } catch (error) {
      console.error('Error adding event to Firestore: ', error);
    } finally {
      setIsLoading(false); // Stop showing the activity indicator
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
      <Text style={styles.title}>Edit Event</Text>
      {/* Event Title Input */}
      <TextInput
        style={styles.input}
        placeholder="Event Title"
        value={editedEvent.title}
        onChangeText={(text) => setEditedEvent({ ...editedEvent, title: text })}
      />

      {/* Location Input */}
      <TextInput
        style={styles.input}
        placeholder="Location"
        value={editedEvent.location}
        onChangeText={(text) => setEditedEvent({ ...editedEvent, location: text })}
      />

      {/* Starting Date Picker */}
      <View style={styles.datePickerContainer}>
        <TextInput
          style={styles.dateInput}
          placeholder="Starting Date"
          value={startDate ? startDate.toLocaleDateString() : 'Not Selected'}
          editable={false} // Prevent editing the text input
        />
        <TouchableOpacity onPress={showStartDatePicker}>
          <Image style={{ marginLeft: 10, marginRight: 10 }} source={icons.datepicker1} />
        </TouchableOpacity>
      </View>
      <DateTimePickerModal
        isVisible={isStartDatePickerVisible}
        mode="date"
        onConfirm={handleStartDateConfirm}
        onCancel={hideStartDatePicker}
      />

      {/* Ending Date Picker */}
      <View style={styles.datePickerContainer}>
        <TextInput
          style={styles.dateInput}
          placeholder="Ending Date"
          value={endDate ? endDate.toLocaleDateString() : 'Not Selected'}
          editable={false} // Prevent editing the text input
        />
        <TouchableOpacity onPress={showEndDatePicker}>
          <Image style={{ marginLeft: 10, marginRight: 10 }} source={icons.datepicker1} />
        </TouchableOpacity>
      </View>
      <DateTimePickerModal
        isVisible={isEndDatePickerVisible}
        mode="date"
        onConfirm={handleEndDateConfirm}
        onCancel={hideEndDatePicker}
      />

      {/* Save Button */}
      <TouchableOpacity style={styles.saveButton} onPress={handleSaveChanges}>
        {isLoading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.saveButtonText}>Save Changes</Text>
        )}
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
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    marginBottom: 16,
    borderRadius: 8,
  },
  saveButton: {
    backgroundColor: COLORS.primaryRed,
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18,
  },
  datePickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  dateInput: {
    color: COLORS.black,
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
  },

  selectedDateText: {
    fontSize: 16,
    marginBottom: 16,
  },
  title: {
    color: COLORS.primaryRed,
    fontWeight: 'bold',
    fontSize: 32,
    marginBottom: 25,
    alignSelf: 'center'
  },
});

export default EditEvent;

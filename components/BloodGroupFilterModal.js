import React, { useState, useEffect } from 'react';
import { View, Modal, Text, TouchableOpacity, StyleSheet, BackHandler } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { COLORS } from '../constants';
import { useNavigation } from '@react-navigation/native';
const BloodGroupFilterModal = ({ isVisible, onApplyFilter, onClose, }) => {
  const [selectedBloodGroup, setSelectedBloodGroup] = useState('');
  const navigation = useNavigation();
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

  return (
    <Modal visible={isVisible} animationType="slide">
      <View style={styles.Container}>
        <Text style={styles.modalTitle}>Filter</Text></View>
      <View style={styles.modalContainer}>
        <View style={styles.contentContainer}>
          <Text style={styles.text}>Blood Group</Text>
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
      </View>
      <View >
        <TouchableOpacity style={styles.applyButton}
          onPress={() => {
            onApplyFilter(selectedBloodGroup);
            onClose();
          }}
        >
          <Text style={styles.applyButtonText}>Apply Filter</Text>
        </TouchableOpacity>
      </View>
      <View>
        <TouchableOpacity style={styles.backButton}
          onPress={() => {
            onClose();
          }}
        >
          <Text style={styles.applyButtonText}>Back</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  Container: {
    alignItems: 'center', // Align content to the left
    marginTop: 25, // Adjust top margin as needed
  },
  modalContainer: {
    flex: 1,
    alignItems: 'flex-start', // Align content to the left
    marginLeft: 20, // Add left margin for spacing
    marginTop: 25, // Adjust top margin as needed
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    alignItems: 'center',
  },
  contentContainer: {
    flexDirection: 'row', // Arrange text and picker in a row
    alignItems: 'center', // Vertically center the content
  },
  text: {
    fontSize: 16,

    fontWeight: 'bold',
    marginRight: 10, // Add right margin for spacing
  },
  picker: {
    borderWidth: 1,
    borderColor: COLORS.black,
    width: 200,
  },
  applyButton: {
    backgroundColor: COLORS.primaryRed,
    padding: 12,
    marginHorizontal: 120,
    marginLeft: 120,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 20, // Adjust top margin as needed
    marginBottom: 20
  },
  backButton: {
    backgroundColor: COLORS.primaryRed,
    padding: 12,
    marginHorizontal: 120,
    marginLeft: 120,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 20, // Adjust top margin as needed
    marginBottom: 250
  },
  applyButtonText: {
    fontWeight: 'bold',
    color: 'white',
    fontSize: 16,
  },
});

export default BloodGroupFilterModal;

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { icons, COLORS } from '../constants';

const CustomDatePicker = ({ selectedDate, onDateChange }) => {
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleDateConfirm = (date) => {
    hideDatePicker();
    onDateChange(date);
  };

  return (
    <View>
      <TouchableOpacity style={styles.datePickerContainer} onPress={showDatePicker}>
        <Text style={styles.textInputContainer}>
          {selectedDate ? selectedDate.toDateString() : 'Select Date'}
        </Text>
        <Image source={icons.datepicker1} style={styles.datePickerIcon} />
      </TouchableOpacity>
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleDateConfirm}
        onCancel={hideDatePicker}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  label: {
    color: COLORS.primaryRed,
    fontWeight: 'bold',
    marginTop: 10,
  },
  datePickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  datePickerIcon: {
    marginLeft: 12,
    marginRight: 10,
  },
  textInputContainer: {
    flexDirection: "row",
    fontSize: 16,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 10,
    borderWidth: 1.5,
    paddingLeft: 18,
    paddingRight: 190,
    paddingTop: 17,
    paddingBottom: 17,
    borderRadius: 8,
    elevation: 8,
    shadowColor: "black",
    shadowOffset: { width: 2, height: 2 },
    shadowRadius: 2,
    shadowOpacity: 10,
    backgroundColor: COLORS.secondaryWhite,
  },
  textInput: {
    fontSize: 15,
    color: "black",
  },


});

export default CustomDatePicker;

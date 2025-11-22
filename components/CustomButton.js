import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../constants';

const CustomButton = ({ title, onPress, disabled, buttonColor }) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: COLORS.primaryRed },
        disabled && styles.disabled,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    marginTop:10,
    borderRadius: 10,
    marginHorizontal: 20,
    padding: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight:'bold'
  },
  disabled: {
    backgroundColor: 'gray', // Change the color for disabled state
  },
});

export default CustomButton;

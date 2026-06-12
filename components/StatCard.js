import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS } from "../constants/themes";

const StatCard = ({ title, subtitle }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.number}>{title}</Text>
      <Text style={styles.text}>{subtitle}</Text>
    </View>
  );
};

export default StatCard;

const styles = StyleSheet.create({
  card: {
    width: "30%",
    alignItems: "center",
  },
  number: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.primaryRed,
  },
  text: {
    textAlign: "center",
    fontSize: 12,
    marginTop: 5,
  },
});

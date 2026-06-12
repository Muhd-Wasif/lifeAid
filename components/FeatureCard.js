import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { COLORS } from "../constants/themes";

const FeatureCard = ({ title, subtitle, onPress, icon }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.iconBox}>
        {icon && <Image source={icon} style={styles.icon} />}
      </View>

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>

      <Text style={styles.action}>View ›</Text>
    </TouchableOpacity>
  );
};

export default FeatureCard;

const styles = StyleSheet.create({
  card: {
    width: "45%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 15,
    elevation: 6,
  },
  iconBox: {
    width: 45,
    height: 45,
    borderRadius: 22,
    backgroundColor: "#FDECEC",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  icon: {
    width: 24,
    height: 24,
    tintColor: COLORS.primaryRed,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 13,
    color: "#666",
    marginVertical: 5,
  },
  action: {
    marginTop: 10,
    color: COLORS.primaryRed,
    fontWeight: "bold",
    alignSelf: "flex-end",
  },
});

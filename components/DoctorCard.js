import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { COLORS } from "../constants/themes";

export default function DoctorCard({
  image,
  name,
  degree,
  timing,
  onPress,
}) {
  const imageSource = typeof image === "string" ? { uri: image } : image;

  return (
    <View style={styles.card}>
      <Image source={imageSource} style={styles.image} />

      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.degree}>{degree}</Text>
        <Text style={styles.timing}>{timing}</Text>

        <TouchableOpacity style={styles.button} onPress={onPress}>
          <Text style={styles.buttonText}>Book Appointment</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#f0d7d7",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  image: {
    width: 78,
    height: 78,
    borderRadius: 16,
    marginRight: 14,
    backgroundColor: "#f2f2f2",
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
  },
  degree: {
    fontSize: 13,
    color: "#666",
  },
  timing: {
    fontSize: 12,
    marginVertical: 5,
    color: "#444",
  },
  button: {
    backgroundColor: COLORS.primaryRed,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 5,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
});

import React, { useRef } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons as Icon } from "@expo/vector-icons";
import { COLORS } from "../constants/themes";

const BackArrow = ({ navigation, style, fallbackRoute }) => {
  const isNavigatingRef = useRef(false);

  const handlePress = () => {
    if (isNavigatingRef.current) return;
    isNavigatingRef.current = true;
    setTimeout(() => {
      isNavigatingRef.current = false;
    }, 600);

    if (navigation?.canGoBack?.()) {
      navigation.goBack();
      return;
    }

    if (fallbackRoute) {
      navigation?.navigate?.(fallbackRoute);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.backArrow, style]}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel="Go back"
    >
      <Icon name="arrow-back-outline" size={28} color={COLORS.primaryRed} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  backArrow: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default BackArrow;

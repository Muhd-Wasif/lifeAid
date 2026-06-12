import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { COLORS } from "../constants/themes";
import NotificationBell from "./NotificationBell";

const HeaderUsers = ({ navigation }) => {
  return (
    <View style={styles.header}>
      <View style={styles.left}>
        <Image
          source={require("../assets/images/background.png")}
          style={styles.avatar}
        />
        <Text style={styles.title}>Home</Text>
      </View>

      <NotificationBell navigation={navigation} style={styles.bell} />
    </View>
  );
};

export default HeaderUsers;

const styles = StyleSheet.create({
  header: {
    height: 70,
    backgroundColor: COLORS.primaryRed,
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  title: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
  },
  bell: {
    width: 40,
    height: 40,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
});

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
} from "react-native";
import { Ionicons as Icon } from "@expo/vector-icons";
import { COLORS } from "../../constants/themes";
import { getAuth } from "firebase/auth";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../../config";

export default function MyAppointmentsScreen({ route, navigation }) {
  const { appointments = {} } = route.params || {};
  const [myAppointments, setMyAppointments] = useState([]);

  const localAppointments = Object.keys(appointments).flatMap((doc) =>
    appointments[doc].map((a) => ({ ...a, doctor: doc }))
  );

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      setMyAppointments(localAppointments);
      return undefined;
    }

    const appointmentsQuery = query(
      collection(db, "appointments"),
      where("patientUid", "==", user.uid)
    );

    const unsubscribe = onSnapshot(
      appointmentsQuery,
      (snapshot) => {
        const fetchedAppointments = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));
        setMyAppointments(fetchedAppointments);
      },
      (error) => {
        console.error("Error fetching appointments:", error);
        setMyAppointments(localAppointments);
      }
    );

    return () => unsubscribe();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <ImageBackground
        source={require("../../assets/appointment_form_screen_bg.jpg")}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.container}>
          <TouchableOpacity
            style={styles.backArrow}
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Icon name="arrow-back-outline" size={28} color={COLORS.primaryRed} />
          </TouchableOpacity>

          <Text style={styles.title}>My Appointments</Text>

          {myAppointments.length > 0 ? (
            <FlatList
              data={myAppointments}
              keyExtractor={(item, index) => item.id || index.toString()}
              contentContainerStyle={{ paddingBottom: 20 }}
              renderItem={({ item }) => (
                <View style={styles.card}>
                  {/* Red Left Line */}
                  <View style={styles.redLine} />

                  <Text style={styles.name}>
                    {item.firstName} {item.lastName} - {item.doctorName || item.doctor}
                  </Text>
                  <Text style={styles.details}>CNIC: {item.cnic}</Text>
                  <Text style={styles.details}>
                    {item.date} at {item.time}
                  </Text>
                </View>
              )}
            />
          ) : (
            <Text style={styles.noAppointments}>
              No appointments booked yet.
            </Text>
          )}
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },

  container: {
    flex: 1,
    padding: 20,
  },

  backArrow: {
    marginBottom: 16,
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#000",
  },

  card: {
    padding: 16,
    paddingLeft: 22, // space for red line
    marginBottom: 15,
    borderRadius: 14,

    backgroundColor: "#FFFFFF", // ✅ solid card

    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },

    position: "relative",
  },

  redLine: {
    position: "absolute",
    left: 0,
    top: 12,
    bottom: 12,
    width: 5,
    backgroundColor: COLORS.primaryRed,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },

  name: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },

  details: {
    fontSize: 14,
    color: "#555",
    marginTop: 4,
  },

  noAppointments: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
    marginTop: 50,
  },
});

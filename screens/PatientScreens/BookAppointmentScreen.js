import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  StatusBar,
} from "react-native";
import { Ionicons as Icon } from "@expo/vector-icons";
import DoctorCard from "../../components/DoctorCard";
import { COLORS } from "../../constants/themes";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../config";

export default function BookAppointmentScreen({ route, navigation }) {
  const { appointments = {} } = route.params || {};
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    const doctorsRef = collection(db, "doctors");
    const unsubscribe = onSnapshot(
      doctorsRef,
      (snapshot) => {
        const fetchedDoctors = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));
        setDoctors(fetchedDoctors);
      },
      (error) => {
        console.error("Error loading doctors:", error);
      }
    );

    return () => unsubscribe();
  }, []);

  const doctorList = doctors;

  const resolveDoctorImage = (doctor) => {
    const image = doctor.image || doctor.imageUrl || doctor.profilePicture;
    if (image) {
      return typeof image === 'string' ? { uri: image } : image;
    }
    return require("../../assets/images/Dr_akramullah_image.jpg");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      <ImageBackground
        source={require("../../assets/appointment_form_screen_bg.jpg")}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.overlay} />
        <ScrollView
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity
            style={styles.backArrow}
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Icon name="arrow-back-outline" size={28} color={COLORS.primaryRed} />
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.title}>Book Appointment</Text>
            <Text style={styles.subtitle}>
              Choose the best doctor for your appointment and view available timings.
            </Text>
          </View>

          {doctorList.length === 0 ? (
            <Text style={styles.emptyText}>
              No doctors are available right now. Please contact admin.
            </Text>
          ) : (
            <View style={styles.listContainer}>
              {doctorList.map((doc) => (
                <DoctorCard
                  key={doc.id || doc.name}
                  image={resolveDoctorImage(doc)}
                  name={doc.name}
                  degree={doc.degree}
                  timing={doc.timing}
                  onPress={() =>
                    navigation.navigate("AppointmentFormScreen", {
                      doctor: doc,
                      doctorImage: resolveDoctorImage(doc),
                      appointments,
                    })
                  }
                />
              ))}
            </View>
          )}
        </ScrollView>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.24)",
  },
  contentContainer: {
    paddingHorizontal: 18,
    paddingBottom: 34,
    paddingTop: 22,
  },
  backArrow: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.85)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  header: {
    marginBottom: 16,
    backgroundColor: "rgba(255,255,255,0.84)",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(207,10,10,0.12)",
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: COLORS.primaryRed,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#444",
    lineHeight: 22,
  },
  listContainer: {
    paddingTop: 6,
  },
  emptyText: {
    color: '#444',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 60,
    lineHeight: 22,
  },
});

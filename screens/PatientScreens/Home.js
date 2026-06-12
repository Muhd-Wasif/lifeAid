import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  ImageBackground,
} from "react-native";

import { Ionicons as Icon } from "@expo/vector-icons";
import { icons } from '../../constants';
import NotificationBell from '../../components/NotificationBell';
import PatientBottomMenu from '../../components/PatientBottomMenu';

import { COLORS } from "../../constants/themes";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useFocusEffect } from "@react-navigation/native";
import {
  collection,
  getDocs,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { db } from "../../config";

export default function HomeScreen({ navigation }) {
  const [appointments, setAppointments] = useState({
    "Dr Akramullah": [],
    "Dr Hammad Ahmed": [],
    "Dr Majnasir": [],
  });
  const [stats, setStats] = useState({
    urgentRequests: 0,
    activeDonors: 0,
    patientsHelped: 0,
  });
  const [userName, setUserName] = useState("User");

  useFocusEffect(
    React.useCallback(() => {
      StatusBar.setTranslucent(false);
      StatusBar.setBackgroundColor(COLORS.primaryRed);
      StatusBar.setBarStyle("light-content");
    }, [])
  );

  // Load appointments from AsyncStorage
  useEffect(() => {
    const loadAppointments = async () => {
      try {
        const stored = await AsyncStorage.getItem("appointments");
        if (stored) setAppointments(JSON.parse(stored));
      } catch (e) {
        console.log(e);
      }
    };
    loadAppointments();
  }, []);

  // Fetch user data for dynamic name
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return;

      try {
        const usersRef = collection(db, 'users');
        let userSnapshot = await getDocs(query(usersRef, where('uid', '==', user.uid)));

        if (userSnapshot.empty && user.email) {
          userSnapshot = await getDocs(query(usersRef, where('email', '==', user.email)));
        }

        if (userSnapshot.empty && user.displayName) {
          setUserName(user.displayName);
          return;
        }

        if (!userSnapshot.empty) {
          const userDoc = userSnapshot.docs[0];
          const userData = userDoc.data();
          setUserName(userData.fullName || user.displayName || "User");
        } else {
          setUserName(user.displayName || "User");
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setUserName(user.displayName || "User");
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) return undefined;

    const appointmentsQuery = query(
      collection(db, "appointments"),
      where("patientUid", "==", user.uid)
    );

    const unsubscribe = onSnapshot(
      appointmentsQuery,
      (snapshot) => {
        const groupedAppointments = {
          "Dr Akramullah": [],
          "Dr Hammad Ahmed": [],
          "Dr Majnasir": [],
        };

        snapshot.forEach((docSnap) => {
          const appointment = { id: docSnap.id, ...docSnap.data() };
          const doctorName = appointment.doctorName || appointment.doctor;
          groupedAppointments[doctorName] = [
            ...(groupedAppointments[doctorName] || []),
            appointment,
          ];
        });

        setAppointments(groupedAppointments);
      },
      (error) => {
        console.error("Error loading appointments:", error);
      }
    );

    return () => unsubscribe();
  }, []);

  // Save appointments whenever they change
  useEffect(() => {
    const saveAppointments = async () => {
      try {
        await AsyncStorage.setItem(
          "appointments",
          JSON.stringify(appointments)
        );
      } catch (e) {
        console.log(e);
      }
    };
    saveAppointments();
  }, [appointments]);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const requestsSnapshot = await getDocs(collection(db, "requests"));
        const donorsSnapshot = await getDocs(
          query(collection(db, "users"), where("userType", "==", "donor"))
        );
        const patientsSnapshot = await getDocs(
          query(collection(db, "users"), where("userType", "==", "patient"))
        );

        setStats({
          urgentRequests: requestsSnapshot.size,
          activeDonors: donorsSnapshot.size,
          patientsHelped: patientsSnapshot.size,
        });
      } catch (error) {
        console.error("Error loading dashboard stats:", error);
      }
    };

    loadStats();
  }, []);

  // Navigation helper for PatientStack
  const goToPatientScreen = (screenName, params = {}) => {
    navigation.navigate("Patient", {
      screen: screenName,
      params: params,
    });
  };

  return (
    <View style={{ flex: 1 }}>
      {/* BACKGROUND IMAGE */}
      <ImageBackground
        source={require("../../assets/home_background.jpg")}
        style={styles.background}
        resizeMode="cover"
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Image
              source={require("../../assets/avatar.jpg")}
              style={styles.avatar}
            />
            <TouchableOpacity
              onPress={() => goToPatientScreen("Menu")} // 👈 change "Menu" if your screen name is different
            >
              <Text style={styles.headerTitle}>Home</Text>
            </TouchableOpacity>
          </View>

          <NotificationBell navigation={navigation} style={styles.bell} />

        </View>

        {/* Banner */}
        {/* <View style={styles.bannerWrapper}>
          <View style={styles.bannerBackground} />
          <Image
            source={require("../../assets/banner.jpg")}
            style={styles.banner}
          />
        </View> */}

        <View style={styles.bannerWrapper}>
          <View style={styles.bannerBackground} />

          <ImageBackground
            source={require("../../assets/banner.jpg")} // background image
            style={styles.banner}
            imageStyle={{ borderTopLeftRadius: 35, borderTopRightRadius: 35 }}
          >
            {/* Overlay image (logo + text) */}
            <View style={styles.overlayContainer}>
              <Image
                source={require("../../assets/JSF_logo_full.png")} // your overlay image
                style={styles.overlayLogo}
                resizeMode="contain"
              />
            </View>
          </ImageBackground>
        </View>

        {/* Greeting */}
        <View style={styles.greeting}>
          <View style={styles.redLine} />
          <View style={styles.textContainer}>
            <View style={styles.nameRow}>
              <Text style={styles.hello}>Hello</Text>
              <Text style={styles.name}> {userName}</Text>
            </View>
            <Text style={styles.welcome}>Welcome to your smart app</Text>
          </View>
        </View>

        {/* Quote Card */}
        <View style={styles.quoteCard}>
          <Text style={styles.quoteTitle}>Quote of the Day</Text>
          <Text style={styles.quoteText}>
            “A single donation can save up to three lives.”
          </Text>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <View style={styles.statTopRow}>
              <Image source={icons.urgentrequestIcon} style={{ height: 30, width: 25 }} />
              {/* <Icon name="alert-circle-outline" size={22} color={COLORS.primaryRed} /> */}
              <Text style={styles.statNumber}>{stats.urgentRequests}</Text>
            </View>
            <Text style={styles.statLabel}>Urgent Requests</Text>
          </View>

          <View style={styles.statItem}>
            <View style={styles.statTopRow}>
              <Image source={icons.activeDonorIcon} style={{ height: 30, width: 25 }} />
              {/* <Icon name="people-outline" size={22} color={COLORS.primaryRed} /> */}
              <Text style={styles.statNumber}>{stats.activeDonors}</Text>
            </View>
            <Text style={styles.statLabel}>Active Donors</Text>
          </View>

          <View style={styles.statItem}>
            <View style={styles.statTopRow}>
              <Image source={icons.patientrequestIcon} style={{ height: 30, width: 25 }} />
              {/* <Icon name="heart-outline" size={22} color={COLORS.primaryRed} /> */}
              <Text style={styles.statNumber}>{stats.patientsHelped}</Text>
            </View>
            <Text style={styles.statLabel}>Patients Helped</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.actionCard}
            // onPress={() =>  goToPatientScreen("PatientTabs", { screen: "RequestPage" })}
            onPress={() => goToPatientScreen("RequestPage")}

          >
            <View style={styles.row1}>
              <Image source={icons.requestIconRed} style={{ height: 30, width: 30 }} />
              {/* <Icon name="water-outline" size={28} color={COLORS.primaryRed} /> */}
              <Text style={styles.actionText}>Create Blood Request</Text>
            </View>
            <Text style={styles.descriptionText}>
              Need Blood Urgently?
              {/* {"\n"}Create a Request now. */}
            </Text>
            <View style={styles.row3}>
              <Text style={styles.row3Text}>Request</Text>
              <Icon name="chevron-forward-outline" size={12} color={COLORS.primaryRed} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => goToPatientScreen("EventPage")}
          >
            <View style={styles.row1}>
              <Image source={icons.bloodcampIcon} style={{ height: 30, width: 30 }} />
              <Text style={styles.actionText}>Blood Camps</Text>
            </View>
            <Text style={styles.descriptionText}>
              See upcoming blood donation camp
            </Text>
            <View style={styles.row3}>
              <Text style={styles.row3Text}>Events</Text>
              <Icon name="chevron-forward-outline" size={12} color={COLORS.primaryRed} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => goToPatientScreen("ViewReports")}
          >
            <View style={styles.row1}>
              <Image source={icons.viewreportsIcon} style={{ height: 30, width: 30 }} />
              <Text style={styles.actionText}>View Reports</Text>
            </View>
            <Text style={styles.descriptionText}>View Your Medical Report</Text>
            <View style={styles.row3}>
              <Text style={styles.row3Text}>View</Text>
              <Icon name="chevron-forward-outline" size={12} color={COLORS.primaryRed} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() =>
              goToPatientScreen("BookAppointment", { appointments })
            }
          >
            <View style={styles.row1}>
              <Image source={icons.bookappointmentIcon} style={{ height: 30, width: 30 }} />
              <Text style={styles.actionText}>Book Appointment</Text>
            </View>
            <Text style={styles.descriptionText}>Book Your appointment now</Text>
            <View style={styles.row3}>
              <Text style={styles.row3Text}>Book</Text>
              <Icon name="chevron-forward-outline" size={12} color={COLORS.primaryRed} />
            </View>
          </TouchableOpacity>
        </View>

        {/* My Appointments */}
        <TouchableOpacity
          style={[styles.button, { backgroundColor: "#D60000" }]}
          onPress={() =>
            goToPatientScreen("MyAppointments", { appointments })
          }
        >
          <Text style={styles.buttonText}>My Appointments</Text>
        </TouchableOpacity>

        <View style={{ height: 10 }} />

      </ScrollView>
      <PatientBottomMenu navigation={navigation} activeRoute="Home" />
    </View>
  );
}

// Styles (same as your original, preserved)
const styles = StyleSheet.create({
  background: { position: "absolute", width: "100%", height: "100%" },
  scrollContent: { paddingBottom: 20 },
  header: {
    backgroundColor: COLORS.primaryRed,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  headerLeft: { flexDirection: "row", alignItems: "center" },
  avatar: { width: 42, height: 40, borderRadius: 21, marginRight: 10 },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  // bannerWrapper: { position: "relative", width: "100%", height: 180 },
  bannerBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.primaryRed,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
  // banner: {
  //   width: "100%",
  //   height: "100%",
  //   resizeMode: "cover",
  //   borderTopLeftRadius: 35,
  //   borderTopRightRadius: 35,
  // },

  bannerWrapper: {
    position: "relative",
    width: "100%",
    height: 180,
    // marginTop: 10, 
  },
  banner: {
    width: "100%",
    height: "100%",    // center overlay horizontally
  },
  overlayContainer: {
    position: "absolute",
    bottom: 5,   // distance from bottom of banner
    left: 24,     // distance from left
    right: 16,    // optional if you want it to stretch
    alignItems: "flex-start", // aligns overlay image to left
  },
  overlayLogo: {
    width: "82%",
    maxWidth: 300,
    height: 100,
    resizeMode: "contain",
  },
  greeting: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 26,
    marginHorizontal: 16,
    marginTop: 10,
  },
  redLine: { width: 4, height: 40, backgroundColor: "red", borderRadius: 2, marginRight: 10 },
  textContainer: { flex: 1 },
  nameRow: { flexDirection: "row", alignItems: "center" },
  hello: { fontSize: 20, fontWeight: "600", color: "#000" },
  name: { fontSize: 20, fontWeight: "700", color: "#000" },
  welcome: { marginTop: 4, fontSize: 14, color: "#666" },
  quoteCard: { backgroundColor: "#e9e9e9ff", marginHorizontal: 16, padding: 16, borderRadius: 14, elevation: 3 },
  quoteTitle: { fontSize: 16, fontWeight: "bold", color: COLORS.primaryRed, marginBottom: 6, textAlign: "center" },
  quoteText: { fontSize: 14, color: COLORS.black, textAlign: "center" },
  statsRow: { flexDirection: "row", justifyContent: "space-between", marginHorizontal: 14, marginVertical: 12 },
  statItem: { width: "32%", alignItems: "center" },
  statTopRow: { flexDirection: "row", alignItems: "center" },
  statNumber: { fontSize: 18, fontWeight: "bold", color: COLORS.black, marginLeft: 6 },
  statLabel: { marginTop: 4, fontSize: 12, textAlign: "center", color: COLORS.gray },
  actionsRow: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", marginTop: 5, paddingHorizontal: 16 },
  actionCard: { width: "48%", minHeight: 148, padding: 14, backgroundColor: "#fff", borderRadius: 15, marginBottom: 14, elevation: 2 },
  row1: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  actionText: { flex: 1, fontSize: 14, fontWeight: "bold", marginLeft: 8 },
  descriptionText: { fontSize: 12, color: "#2b2b2bff", lineHeight: 18 },

  // actionCard: {
  //   width: "42%",
  //   padding: 16,
  //   backgroundColor: "#fff",
  //   borderRadius: 15,
  //   marginBottom: 16,
  //   marginHorizontal: "4%",
  //   elevation: 2,

  //   minHeight: 190,   // ⭐ REQUIRED
  //   flexDirection: "column",
  // },
  row3: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: "auto",   // ⭐ pushes it down
  },

  button: { padding: 14, borderRadius: 10, alignItems: "center", marginHorizontal: 16 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  // row3: { flexDirection: "row", alignItems: "center", justifyContent: "flex-end", marginTop: 8 },
  row3Text: { marginRight: 4, fontSize: 14, color: COLORS.primaryRed, fontWeight: "bold" },
  bell: {
    width: 40,
    height: 40,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
});

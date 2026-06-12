import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Image, Alert, BackHandler, ImageBackground, StatusBar } from 'react-native';
import { icons } from '../../constants';
import { COLORS } from "../../constants/themes";
import { useFocusEffect, useNavigation } from '@react-navigation/native';

import { Ionicons as Icon } from "@expo/vector-icons";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../config";
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getDatabase, ref as Sref, onValue } from 'firebase/database';
import NotificationBell from '../../components/NotificationBell';
import DonorBottomMenu from '../../components/DonorBottomMenu';

const Home = () => {
  const navigation = useNavigation();
  const [stats, setStats] = useState({
    urgentRequests: 0,
    activeDonors: 0,
    patientsHelped: 0,
  });
  const [userName, setUserName] = useState("User");
  const [notifications, setNotifications] = useState([]);
  const [userBloodGroup, setUserBloodGroup] = useState(null);

  useFocusEffect(
    React.useCallback(() => {
      StatusBar.setTranslucent(false);
      StatusBar.setBackgroundColor(COLORS.primaryRed);
      StatusBar.setBarStyle("light-content");
    }, [])
  );

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
        console.error("Error loading donor dashboard stats:", error);
      }
    };

    loadStats();
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

        if (userSnapshot.empty) {
          setUserName(user.displayName || "User");
          return;
        }

        const userDoc = userSnapshot.docs[0];
        const userData = userDoc.data();
        setUserName(userData.fullName || user.displayName || "User");
        setUserBloodGroup(userData.bloodGroup || null);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setUserName(user.displayName || "User");
      }
    });

    return () => unsubscribe();
  }, []);

  // Fetch notifications from Realtime Database
  useEffect(() => {
    if (userBloodGroup === null) return;

    try {
      const RealtimeDatabase = getDatabase();
      const notificationsRef = Sref(RealtimeDatabase, 'notifications');

      const unsubscribe = onValue(notificationsRef, (snapshot) => {
        const notificationData = [];

        if (snapshot.exists()) {
          const allNotifications = snapshot.val();

          for (const key in allNotifications) {
            const notification = allNotifications[key];
            if (notification.message && notification.message.trim() !== '') {
              // Show only request notifications with matching blood group
              const shouldShow = notification.requestId &&
                (!notification.bloodGroup || notification.bloodGroup === userBloodGroup);

              if (shouldShow) {
                notificationData.push({ id: key, ...notification });
              }
            }
          }

          // Sort by timestamp (newest first) and limit to last 3
          notificationData.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
          setNotifications(notificationData.slice(0, 3));
        }
      });

      return () => unsubscribe();
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  }, [userBloodGroup]);

  useEffect(() => {
    const backAction = () => {
      Alert.alert(
        'Exit App',
        'Are you sure you want to exit?',
        [
          {
            text: 'Cancel',
            onPress: () => null, // Do nothing when cancel is pressed
            style: 'cancel',
          },
          { text: 'OK', onPress: () => BackHandler.exitApp() },
        ],
        { cancelable: false }
      );

      return true; // Prevent default behavior (exit the app)
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, []);


  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <View style={styles.container}>
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
                  onPress={() => navigation.navigate("Menu")} // 👈 change "Menu" if your screen name is different
                >
                  <Text style={styles.headerTitle}>Home</Text>
                </TouchableOpacity>
              </View>
              <NotificationBell navigation={navigation} style={styles.bell} />



            </View>

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
            <View style={styles.quoteCard}>
              <Text style={styles.quoteTitle}>Quote of the Day</Text>
              <Text style={styles.quoteText}>Saving lives brings inner peace.</Text>
            </View>

            {/* Recent Blood Requests Notifications */}
            {notifications.length > 0 && (
              <View style={styles.notificationsSection}>
                <View style={styles.notificationsHeader}>
                  <Text style={styles.notificationsTitle}>Recent Blood Requests</Text>
                  <TouchableOpacity onPress={() => navigation.navigate('NotificationScreen')}>
                    <Text style={styles.viewAllLink}>View All</Text>
                  </TouchableOpacity>
                </View>

                {notifications.map((notification) => (
                  <TouchableOpacity
                    key={notification.id}
                    style={styles.notificationItem}
                    onPress={() => {
                      if (notification.requestId) {
                        navigation.navigate('RequestDetailScreen', { requestId: notification.requestId });
                      }
                    }}
                  >
                    <View style={styles.notificationIcon}>
                      <Icon name="water" size={20} color={COLORS.primaryRed} />
                    </View>
                    <View style={styles.notificationContent}>
                      <Text style={styles.notificationBloodGroup}>{notification.bloodGroup} Blood Needed</Text>
                      <Text style={styles.notificationReason} numberOfLines={1}>
                        {notification.medicalReason} - {notification.patientName}
                      </Text>
                    </View>
                    <Icon name="chevron-forward" size={16} color="#ccc" />
                  </TouchableOpacity>
                ))}
              </View>
            )}


            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <View style={styles.statTopRow}>
                  <Image source={icons.urgentrequestIcon} style={{ height: 30, width: 25 }} />
                  <Text style={styles.statNumber}>{stats.urgentRequests}</Text>
                </View>
                <Text style={styles.statLabel}>Urgent Requests</Text>
              </View>

              <View style={styles.statItem}>
                <View style={styles.statTopRow}>
                  <Image source={icons.activeDonorIcon} style={{ height: 30, width: 25 }} />
                  <Text style={styles.statNumber}>{stats.activeDonors}</Text>
                </View>
                <Text style={styles.statLabel}>Active Donors</Text>
              </View>

              <View style={styles.statItem}>
                <View style={styles.statTopRow}>
                  <Image source={icons.patientrequestIcon} style={{ height: 30, width: 25 }} />
                  <Text style={styles.statNumber}>{stats.patientsHelped}</Text>
                </View>
                <Text style={styles.statLabel}>Patients Helped</Text>
              </View>
            </View>
            <View style={styles.actionsRow}>

              <TouchableOpacity style={styles.actionCard}
                onPress={() => navigation.navigate("DonorPage")}>
                <View style={styles.row1}>
                  <Image source={icons.requestIconRed} style={{ height: 30, width: 30 }} />
                  <Text style={styles.actionText}>Become a Donor</Text>
                </View>
                <Text style={styles.descriptionText}>Donate now to Safe Lives</Text>
                <View style={styles.row3}>
                  <Text style={styles.row3Text}>Donar</Text>
                  <Icon name="chevron-forward-outline" size={12} color={COLORS.primaryRed} />
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionCard}
                onPress={() => navigation.navigate("EventPage")}
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
                onPress={() => navigation.getParent()?.navigate("ViewReports", { mode: "certificates" })}
              >
                <View style={styles.row1}>
                  <Image source={icons.viewreportsIcon} style={{ height: 30, width: 30 }} />
                  <Text style={styles.actionText}>View Certificates</Text>
                </View>
                <Text style={styles.descriptionText}>View Your Rewards</Text>
                <View style={styles.row3}>
                  <Text style={styles.row3Text}>View</Text>
                  <Icon name="chevron-forward-outline" size={12} color={COLORS.primaryRed} />
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionCard}
                onPress={() => navigation.navigate("Invite")}>
                <View style={styles.row1}>
                  <Image source={icons.shareIcon} style={{ height: 30, width: 30 }} />
                  <Text style={styles.actionText}>Invite a   Friends</Text>
                </View>
                <Text style={styles.descriptionText}>Invite others and grow the donor network</Text>
                <View style={styles.row3}>
                  <Text style={styles.row3Text}>Invite</Text>
                  <Icon name="chevron-forward-outline" size={12} color={COLORS.primaryRed} />
                </View>
              </TouchableOpacity>
            </View>

            {/* My Appointments */}
            <TouchableOpacity
              style={[styles.button, { backgroundColor: "#D60000" }]}
              onPress={() =>
                navigation.navigate("DonationHistory")
              }
            >
              <Text style={styles.buttonText}>View Donation History</Text>
            </TouchableOpacity>

            <View style={{ height: 10 }} />

            {/* Bottom Menu */}

          </ScrollView>
          <DonorBottomMenu navigation={navigation} activeRoute="Home" />

        </View>
      </View>
    </SafeAreaView>
  );
}

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
  actionsRow: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", marginTop: 5, paddingHorizontal: 16 },
  actionCard: { width: "48%", minHeight: 148, padding: 14, backgroundColor: "#fff", borderRadius: 15, marginBottom: 14, elevation: 2 },
  row1: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  actionText: { flex: 1, fontSize: 14, fontWeight: "bold", marginLeft: 8 },
  descriptionText: { fontSize: 12, color: "#2b2b2bff", lineHeight: 18 },
  row3: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: "auto",   // ⭐ pushes it down
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
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'white',
  },
  blocks: {
    elevation: 10,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    shadowOpacity: 0.3,
    padding: 20,
    borderRadius: 10,
    backgroundColor: 'white',
    marginTop: 15,

  },

  image: {
    width: 100,
    height: 100,
  },
  text: {
    fontSize: 30,
    fontWeight: 'bold',
    color: COLORS.primaryRed,
    textAlign: 'center',
    paddingBottom: 15
  },
  text2: {
    fontSize: 23,
    fontWeight: 'bold',
    color: COLORS.primaryRed,
    paddingBottom: 3,
    marginLeft: 15
  },
  text3: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.black,
    paddingBottom: 19,
    marginLeft: 51
  },
  quote: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.black,
    textAlign: 'center'
  },
  button: { padding: 14, borderRadius: 10, alignItems: "center", marginHorizontal: 16 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  row3Text: { marginRight: 4, fontSize: 14, color: COLORS.primaryRed, fontWeight: "bold" },
  bell: {
    width: 40,
    height: 40,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  notificationsSection: {
    marginHorizontal: 16,
    marginVertical: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    elevation: 2,
  },
  notificationsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  notificationsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primaryRed,
  },
  viewAllLink: {
    fontSize: 12,
    color: COLORS.primaryRed,
    fontWeight: '600',
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffe0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationBloodGroup: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  notificationReason: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },

});

export default Home;

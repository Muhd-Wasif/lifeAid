import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { getAuth, signOut } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

import { COLORS, icons } from '../../constants';
import { admins } from '../../constants/data';
import { db } from '../../config';
import NotificationBell from '../../components/NotificationBell';

const featureDescriptions = {
  MassRequest: 'Send urgent alerts to matching donors.',
  ManageRequest: 'Review blood requests from patients.',
  RegisteredUsers: 'View donor and patient registrations.',
  ManageEvents: 'Create and manage blood camps.',
  PatientInfo: 'Add, view, and update patients.',
  ManageDoctors: 'Add, view, and remove doctors.',
  ManageAppointments: 'View all patient appointments by doctor and time.',
  BloodTypeList: 'Browse donor records by blood group.',
  Inventory: 'Track available blood inventory.',
  UploadReports: 'Upload patient and donor reports.',
};

const AdminDashboard = () => {
  const navigation = useNavigation();
  const [signingOut, setSigningOut] = useState(false);
  const [stats, setStats] = useState({
    urgentRequests: 0,
    activeDonors: 0,
    patients: 0,
  });

  useEffect(() => {
    const backAction = () => {
      Alert.alert(
        'Exit App',
        'Are you sure you want to exit?',
        [
          { text: 'Cancel', onPress: () => null, style: 'cancel' },
          { text: 'OK', onPress: () => BackHandler.exitApp() },
        ],
        { cancelable: false }
      );

      return true;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, []);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [requestsSnapshot, donorsSnapshot, patientsSnapshot] = await Promise.all([
          getDocs(collection(db, 'requests')),
          getDocs(query(collection(db, 'users'), where('userType', '==', 'donor'))),
          getDocs(query(collection(db, 'users'), where('userType', '==', 'patient'))),
        ]);

        setStats({
          urgentRequests: requestsSnapshot.size,
          activeDonors: donorsSnapshot.size,
          patients: patientsSnapshot.size,
        });
      } catch (error) {
        console.error('Error loading admin dashboard stats:', error);
      }
    };

    loadStats();
  }, []);

  const handleIconPress = (screenName) => {
    navigation.navigate(screenName);
  };

  const handleSignOut = () => {
    setSigningOut(true);

    setTimeout(() => {
      const auth = getAuth();
      signOut(auth)
        .then(() => {
          AsyncStorage.multiRemove(['email', 'password', 'user']);
          navigation.navigate('Signin');
        })
        .catch((error) => {
          console.error('Error signing out:', error);
        })
        .finally(() => {
          setSigningOut(false);
        });
    }, 1200);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ImageBackground
        source={require('../../assets/home_background.jpg')}
        style={styles.background}
        resizeMode="cover"
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Image source={require('../../assets/avatar.jpg')} style={styles.avatar} />
            <View>
              <Text style={styles.headerTitle}>Admin Panel</Text>
              <Text style={styles.headerSubtitle}>LifeAid control center</Text>
            </View>
          </View>

          <NotificationBell navigation={navigation} isAdmin style={styles.bell} iconSize={23} />
        </View>

        <View style={styles.bannerWrapper}>
          <View style={styles.bannerBackground} />
          <ImageBackground
            source={require('../../assets/banner.jpg')}
            style={styles.banner}
            imageStyle={styles.bannerImage}
          >
            <View style={styles.overlayContainer}>
              <Image
                source={require('../../assets/JSF_logo_full.png')}
                style={styles.overlayLogo}
                resizeMode="contain"
              />
            </View>
          </ImageBackground>
        </View>

        <View style={styles.greeting}>
          <View style={styles.redLine} />
          <View style={styles.textContainer}>
            <Text style={styles.hello}>Hello Admin</Text>
            <Text style={styles.welcome}>Manage requests, donors, patients, events, and inventory.</Text>
          </View>
        </View>

        <View style={styles.quoteCard}>
          <Text style={styles.quoteTitle}>Today's Focus</Text>
          <Text style={styles.quoteText}>Fast response and clean records help every patient reach care sooner.</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <View style={styles.statTopRow}>
              <Image source={icons.urgentrequestIcon} style={styles.statIcon} />
              <Text style={styles.statNumber}>{stats.urgentRequests}</Text>
            </View>
            <Text style={styles.statLabel}>Urgent Requests</Text>
          </View>

          <View style={styles.statItem}>
            <View style={styles.statTopRow}>
              <Image source={icons.activeDonorIcon} style={styles.statIcon} />
              <Text style={styles.statNumber}>{stats.activeDonors}</Text>
            </View>
            <Text style={styles.statLabel}>Active Donors</Text>
          </View>

          <View style={styles.statItem}>
            <View style={styles.statTopRow}>
              <Image source={icons.patientrequestIcon} style={styles.statIcon} />
              <Text style={styles.statNumber}>{stats.patients}</Text>
            </View>
            <Text style={styles.statLabel}>Patients</Text>
          </View>
        </View>

        <View style={styles.actionsRow}>
          {admins.map((item) => (
            <TouchableOpacity
              key={item.screen}
              style={styles.actionCard}
              onPress={() => handleIconPress(item.screen)}
              activeOpacity={0.85}
            >
              <View style={styles.row1}>
                <Image source={item.icon} style={styles.actionIcon} />
                <Text style={styles.actionText} numberOfLines={2}>{item.title}</Text>
              </View>
              <Text style={styles.descriptionText} numberOfLines={2}>
                {featureDescriptions[item.screen] || 'Open admin module.'}
              </Text>
              <View style={styles.row3}>
                <Text style={styles.row3Text}>Open</Text>
                <Ionicons name="chevron-forward-outline" size={13} color={COLORS.primaryRed} />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.signOutWrap}>
          {signingOut ? (
            <ActivityIndicator size="large" color={COLORS.primaryRed} />
          ) : (
            <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
              <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'white',
  },
  background: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  scrollContent: {
    paddingBottom: 24,
  },
  header: {
    backgroundColor: COLORS.primaryRed,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 12,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    marginRight: 10,
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.86)',
    fontSize: 12,
    marginTop: 2,
  },
  bell: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerWrapper: {
    position: 'relative',
    width: '100%',
    height: 178,
  },
  bannerBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.primaryRed,
  },
  banner: {
    width: '100%',
    height: '100%',
  },
  bannerImage: {
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
  },
  overlayContainer: {
    position: 'absolute',
    left: 28,
    right: 20,
    bottom: 8,
    alignItems: 'flex-start',
  },
  overlayLogo: {
    width: '82%',
    maxWidth: 310,
    height: 96,
  },
  greeting: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 24,
    marginHorizontal: 16,
    marginTop: 10,
  },
  redLine: {
    width: 4,
    height: 42,
    backgroundColor: COLORS.primaryRed,
    borderRadius: 2,
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
  },
  hello: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.black,
  },
  welcome: {
    marginTop: 4,
    fontSize: 14,
    color: '#666',
    lineHeight: 19,
  },
  quoteCard: {
    backgroundColor: '#e9e9e9',
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    borderRadius: 14,
    elevation: 3,
  },
  quoteTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primaryRed,
    marginBottom: 6,
    textAlign: 'center',
  },
  quoteText: {
    fontSize: 14,
    color: COLORS.black,
    textAlign: 'center',
    lineHeight: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 14,
    marginVertical: 12,
  },
  statItem: {
    width: '32%',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 4,
    elevation: 2,
    minHeight: 84,
  },
  statTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIcon: {
    height: 28,
    width: 25,
    resizeMode: 'contain',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
    marginLeft: 6,
  },
  statLabel: {
    marginTop: 5,
    fontSize: 11,
    textAlign: 'center',
    color: COLORS.gray,
    lineHeight: 15,
  },
  actionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 4,
    paddingHorizontal: 16,
  },
  actionCard: {
    width: '48%',
    minHeight: 142,
    padding: 14,
    backgroundColor: 'white',
    borderRadius: 15,
    marginBottom: 14,
    elevation: 2,
  },
  row1: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    minHeight: 38,
  },
  actionIcon: {
    height: 30,
    width: 30,
    resizeMode: 'contain',
  },
  actionText: {
    flex: 1,
    fontSize: 15,
    fontWeight: 'bold',
    marginLeft: 10,
    color: COLORS.black,
  },
  descriptionText: {
    fontSize: 12,
    color: '#2b2b2b',
    lineHeight: 18,
  },
  row3: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 'auto',
  },
  row3Text: {
    marginRight: 4,
    fontSize: 13,
    color: COLORS.primaryRed,
    fontWeight: 'bold',
  },
  signOutWrap: {
    minHeight: 56,
    justifyContent: 'center',
    paddingHorizontal: 16,
    marginTop: 4,
  },
  signOutButton: {
    backgroundColor: COLORS.primaryRed,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  signOutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AdminDashboard;

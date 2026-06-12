import React, { useState, useEffect, useRef } from 'react';
import { Platform, Text, View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { COLORS } from "../../constants/themes";
import * as Location from 'expo-location';
import CurrentLocationButton from '../../components/CurrentLocationButton';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '../../config';
import icons from '../../constants/icons';
import OtherUserHeader from '../../components/OtherUserHeader';
import PatientBottomMenu from '../../components/PatientBottomMenu';

const MapComponents = Platform.OS === 'web' ? {} : require('react-native-maps');
const MapView = MapComponents.default;
const Marker = MapComponents.Marker;
const Callout = MapComponents.Callout;

const bloodGroupColors = {
  'A+': '#008000',
  'B+': '#00FFFF',
  'O+': '#0000FF',
  'AB+': '#800080',
  'A-': '#FFFF00',
  'B-': '#00FF00',
  'O-': '#FF0275',
  'AB-': '#745508',
};

const MapPage = ({ navigation }) => {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const mapViewRef = useRef(null);
  const [nearbyUsers, setNearbyUsers] = useState([]);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }
      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
    })();
  }, []);

  const fetchNearbyUsers = async () => {
    if (!location) return;

    const usersRef = collection(db, 'users');
    const q = query(usersRef);

    try {
      const querySnapshot = await getDocs(q);
      const nearbyUsersData = [];

      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        if (userData.location?.latitude && userData.location?.longitude) {
          const distance = calculateDistance(
            location.coords.latitude,
            location.coords.longitude,
            userData.location.latitude,
            userData.location.longitude
          );

          const maxDistance = 1000000;
          if (distance <= maxDistance) {
            nearbyUsersData.push(userData);
          }
        }
      });

      setNearbyUsers(nearbyUsersData);
    } catch (error) {
      console.error('Error fetching nearby users:', error);
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = degToRad(lat2 - lat1);
    const dLon = degToRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(degToRad(lat1)) *
      Math.cos(degToRad(lat2)) *
      Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c * 100000;
  };

  const degToRad = (degrees) => degrees * (Math.PI / 180);

  useEffect(() => {
    fetchNearbyUsers();
  }, [location]);

  const handleBackToCurrentLocation = () => {
    if (mapViewRef.current && location) {
      mapViewRef.current.animateToRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
    }
  };

  const handleReloadMap = async () => {
    setLocation(null);
    setNearbyUsers([]);

    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setErrorMsg('Permission to access location was denied');
      return;
    }

    let currentLocation = await Location.getCurrentPositionAsync({});
    setLocation(currentLocation);
  };

  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <OtherUserHeader navigation={navigation} />
        <View style={styles.webFallback}>
          <Text style={styles.webFallbackText}>Map is available on mobile devices.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>

      <OtherUserHeader navigation={navigation} />

      {errorMsg ? (
        <Text>{errorMsg}</Text>
      ) : location ? (
        <MapView
          ref={mapViewRef}
          style={styles.map}
          initialRegion={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
        >
          <Marker
            coordinate={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
            title="Your Location"
            pinColor="#17202A"
          >
            <Callout>
              <Text>Your Location</Text>
            </Callout>
          </Marker>

          {nearbyUsers.map((user, index) => (
            <Marker
              key={index}
              coordinate={{
                latitude: user.location.latitude,
                longitude: user.location.longitude,
              }}
              pinColor={bloodGroupColors[user.bloodGroup] || '#808080'}
            >
              <Callout>
                <View>
                  <Text>Blood Group: {user.bloodGroup}</Text>
                  <Text>Name: {user.fullName}</Text>
                  <Text>Contact: {user.phoneNumber}</Text>
                </View>
              </Callout>
            </Marker>
          ))}
        </MapView>
      ) : (
        <Text>Loading location...</Text>
      )}

      <CurrentLocationButton onPress={handleBackToCurrentLocation} />

      <TouchableOpacity style={styles.reloadButton} onPress={handleReloadMap}>
        <Image style={styles.refreshIcon} source={icons.refreshIcon} />
      </TouchableOpacity>

      <View style={styles.bottomMenuWrapper}>
        <PatientBottomMenu navigation={navigation} activeRoute="MapPage" />
      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  reloadButton: { position: 'absolute', top: 10, right: 10, padding: 10 },
  refreshIcon: { height: 30, width: 30 },
  bottomMenuWrapper: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
  },
  webFallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  webFallbackText: {
    color: COLORS.primaryRed,
    fontWeight: "600",
    textAlign: "center",
  },
});

export default MapPage;

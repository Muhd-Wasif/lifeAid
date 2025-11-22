import React, { useState, useEffect, useRef } from 'react';
import { Text, View, StyleSheet, Dimensions, TouchableOpacity, Image } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import * as Location from 'expo-location';
import CurrentLocationButton from '../../components/CurrentLocationButton';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../config'; // Import your Firebase config
import icons from '../../constants/icons';
import OtherUserHeader from '../../components/OtherUserHeader';

const bloodGroupColors = {
  'A+': '#008000', //dark green
  'B+': '#00FFFF', //aqua
  'O+': '#0000FF', //blue
  'AB+': '#800080', //purple
  'A-': '#FFFF00',  //yellow
  'B-': '#00FF00',  //lime
  'O-': '#FF0275',  //pink
  'AB-': '#745508', //Brown
};

const MapPage = () => {
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

  // Fetch nearby user data from Firestore
  const fetchNearbyUsers = async () => {
    if (!location) return;

    const usersRef = collection(db, 'users');
    const q = query(
      usersRef,
    );

    try {
      const querySnapshot = await getDocs(q);
      const nearbyUsersData = [];

      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        // Check if the user data contains the 'location' property
        if (userData.location && userData.location.latitude && userData.location.longitude) {
          // Calculate distance between current user and fetched user
          const distance = calculateDistance(
            location.coords.latitude,
            location.coords.longitude,
            userData.location.latitude,
            userData.location.longitude
          );

          // Define a maximum allowable distance (in meters)
          const maxDistance = 1000000; // Adjust as needed

          // If the user is within the allowable distance, add them to the list
          if (distance <= maxDistance) {
            nearbyUsersData.push(userData);
          }
        }
      });
      console.log('Fetched nearby users:', nearbyUsersData); // Log the fetched data
      setNearbyUsers(nearbyUsersData);
      setNearbyUsers(nearbyUsersData);
    } catch (error) {
      console.error('Error fetching nearby users:', error);
    }
  };


  // Function to calculate distance between two coordinates using Haversine formula
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = degToRad(lat2 - lat1);
    const dLon = degToRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(degToRad(lat1)) * Math.cos(degToRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c * 100000; // Convert to meters
    return distance;
  };

  // Function to convert degrees to radians
  const degToRad = (degrees) => {
    return degrees * (Math.PI / 180);
  };

  useEffect(() => {
    fetchNearbyUsers(); // Call the fetchNearbyUsers function here
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
    console.log('Back to Current Location button pressed');
  };
  const handleReloadMap = () => {
    // Trigger the logic to reload the map here
    // Fetch location and nearby users, then update the state
    console.log('Reload Map button pressed');

    // Clear the existing location and nearbyUsers
    setLocation(null);
    setNearbyUsers([]);

    // Fetch the location and nearby users again
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);

      // Call the function to fetch nearby users again
      fetchNearbyUsers();
    })();
  };


  return (
    <View style={styles.container}>

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
            showsUserLocation
            title="Your Location"
            pinColor="#17202A"
          >
            <Callout>
              <View>
                <Text>Your Location</Text>
              </View>
            </Callout>
          </Marker>

          {nearbyUsers.map((user, index) => (
            <Marker
              key={index}
              coordinate={{
                latitude: user.location.latitude, // Assuming your user data has location information
                longitude: user.location.longitude,
              }}
              title={`Blood Group: ${user.bloodGroup}`}
              pinColor={bloodGroupColors[user.bloodGroup] || '#808080'}
            >
              <Callout>
                <View>
                  <Text>Blood Group: {user.bloodGroup}</Text>
                  <Text>Name: {user.fullName}</Text>
                  <Text>Contact No.: {user.phoneNumber}</Text>
                </View>
              </Callout>
            </Marker>
          ))}
        </MapView>
      ) : (
        <Text>Loading location...</Text>
      )}
      {/* Add the CurrentLocationButton */}
      <CurrentLocationButton onPress={handleBackToCurrentLocation} />

      <TouchableOpacity style={styles.reloadButton} onPress={handleReloadMap}>
        <Image style={styles.refreshIcon} source={icons.refreshIcon} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  reloadButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 10,
  },
  refreshIcon: {
    height: 30,
    width: 30,
    position: 'absolute',
    right: 6,
    top: 5
  }
});

export default MapPage;

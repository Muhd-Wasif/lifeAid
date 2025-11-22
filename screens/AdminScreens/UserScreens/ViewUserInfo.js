import React, { useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, BackHandler, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../../../constants';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons'

const ViewUserInfo = ({ route }) => {
  const { donor } = route.params;
  const navigation = useNavigation();
  //Function to navigate back when hardware back button is pressed
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        navigation.goBack();
        return true; // Prevent default behavior (exit the app)
      }
    );

    return () => backHandler.remove();
  }, [navigation]);


  const handleBack = () => {
    // Navigate back to the Donor screen
    navigation.navigate('RegisteredUsers');
  };

  function renderHeader() {
    return (
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginVertical: 12,
        }}
      >
        <TouchableOpacity onPress={() => navigation.navigate("AdminDashboard")}>
          <MaterialCommunityIcons
            name="view-dashboard"
            size={28}
            color={COLORS.primaryRed}
          />
        </TouchableOpacity>
        <View>
          <View
            style={{
              height: 6,
              width: 6,
              backgroundColor: COLORS.primaryRed,
              borderRadius: 3,
              position: 'absolute',
              right: 5,
              top: 5,
            }}
          ></View>
          <TouchableOpacity onPress={() => console.log('Pressed')}>
            <Ionicons
              name="notifications-outline"
              size={28}
              color={COLORS.black}
            />
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      <Text style={styles.title}>User Information</Text>

      {/* First Row */}
      <View style={styles.row}>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Full Name:</Text>
          <Text style={styles.infoValue}>{donor.fullName}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Email:</Text>
          <Text style={styles.infoValue}>{donor.email}</Text>
        </View>
      </View>

      {/* Second Row */}
      <View style={styles.row}>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Blood Group:</Text>
          <Text style={styles.infoValue}>{donor.bloodGroup}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Date of Birth:</Text>
          <Text style={styles.infoValue}>
            {donor.dateOfBirth ? donor.dateOfBirth.toDate().toDateString() : 'N/A'}
          </Text>
        </View>
      </View>

      {/* Third Row */}
      <View style={styles.row}>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Phone Number:</Text>
          <Text style={styles.infoValue}>{donor.phoneNumber}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Address:</Text>
          <Text style={styles.infoValue}>{donor.address}</Text>
        </View>
      </View>


      {/* Back Button */}
      <TouchableOpacity style={styles.button} onPress={handleBack}>
        <Text style={styles.buttonText}>Back</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: COLORS.primaryRed,
    textAlign: 'center',
    marginTop: 30,
    marginBottom: 10,

  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  infoItem: {
    flex: 1,
    elevation: 12,
    shadowColor: 'black',
    shadowOffset: { width: 1, height: 1 },
    shadowRadius: 2,
    shadowOpacity: 0.3,
    padding: 15,
    borderRadius: 10,
    backgroundColor: 'white',
    marginTop: 10,
    marginLeft: 5,
    marginRight: 5,
    marginBottom: 0
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  infoValue: {
    marginTop: 5,
    fontSize: 16,
  },
  button: {
    backgroundColor: COLORS.primaryRed,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 15,
    marginRight: 60,
    marginLeft: 60
  },
  buttonText: {
    fontWeight: 'bold',
    color: 'white',
    fontSize: 18,
  },
});

export default ViewUserInfo;

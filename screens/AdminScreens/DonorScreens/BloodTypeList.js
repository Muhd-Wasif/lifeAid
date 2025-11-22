// NewScreen.js

import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, BackHandler, Image } from 'react-native';
import { collection, query, where, getDocs } from 'firebase/firestore'; // Import the necessary Firebase modules
import { db } from '../../../config';
import { COLORS } from '../../../constants';
import { icons } from '../../../constants';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons'
import LoadingModal from '../../../components/LoadingModel';

const BloodTypeList = ({ navigation }) => {
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

  const [bloodTypes, setBloodTypes] = useState([]);
  // To show loading on the screen
  const [isLoading, setIsLoading] = useState(true);
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

  useEffect(() => {
    const fetchBloodTypes = async () => {
      const bloodTypesQuery = query(collection(db, 'inventory'));
      const snapshot = await getDocs(bloodTypesQuery);
      const bloodTypesData = snapshot.docs.map(doc => doc.id);
      setBloodTypes(bloodTypesData);
      setIsLoading(false);// Set loading to false when done
    };


    fetchBloodTypes();
  }, []);

  const handleBloodTypePress = (itemName) => {
    navigation.navigate('DonorNames', { itemName });
  };

  return (
    <View style={styles.container}>
      {renderHeader()}
      <LoadingModal visible={isLoading} />
      <Text style={styles.title}>Select a specific blood type to display details:</Text>
      <FlatList
        data={bloodTypes}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleBloodTypePress(item)} style={styles.block} >
            <Text style={styles.bloodTypeText}>{item}</Text>
            <Image source={icons.rightArrowBlack} style={styles.icon} />
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: "white",
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 20,
    textAlign: 'center',
    color: COLORS.primaryRed,
    textAlign: 'left',
    marginLeft: 8
  },
  block: {
    elevation: 5,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    shadowOpacity: 0.3,
    padding: 16,
    borderRadius: 10,
    backgroundColor: 'white',
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginRight: 15,
    marginLeft: 5,
    marginBottom: 10,


  },
  bloodTypeText: {
    fontSize: 17,
    fontWeight: 'bold',
  },
  icon: {
    justifyContent: 'flex-end',
    height: 16,
    width: 10
  },
});

export default BloodTypeList;

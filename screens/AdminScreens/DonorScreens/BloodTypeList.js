// NewScreen.js

import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, BackHandler, Image } from 'react-native';
import { collection, query, where, getDocs } from 'firebase/firestore'; // Import the necessary Firebase modules
import { db } from '../../../config';
import { COLORS } from '../../../constants';
import { icons } from '../../../constants';
import LoadingModal from '../../../components/LoadingModel';
import AdminHeader from '../../../components/AdminHeader';

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
  useEffect(() => {
    const fetchBloodTypes = async () => {
      try {
        const donorSnapshot = await getDocs(
          query(collection(db, 'users'), where('userType', '==', 'donor'))
        );
        const donorBloodTypes = donorSnapshot.docs
          .map((docSnap) => docSnap.data().bloodGroup)
          .filter(Boolean);

        const inventorySnapshot = await getDocs(query(collection(db, 'inventory')));
        const inventoryBloodTypes = inventorySnapshot.docs.map((docSnap) => docSnap.id);

        const bloodTypesData = [...new Set([...donorBloodTypes, ...inventoryBloodTypes])].sort();
        setBloodTypes(bloodTypesData);
      } catch (error) {
        console.error('Error fetching blood types:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBloodTypes();
  }, []);

  const handleBloodTypePress = (itemName) => {
    navigation.navigate('DonorNames', { itemName });
  };

  return (
    <View style={styles.container}>
      <AdminHeader navigation={navigation} />
      <LoadingModal visible={isLoading} />
      <View style={styles.introCard}>
        <View style={styles.redLine} />
        <View style={styles.introTextWrap}>
          <Text style={styles.title}>Donor Information</Text>
          <Text style={styles.subtitle}>Select a blood group to view donor records.</Text>
        </View>
      </View>
      <FlatList
        data={bloodTypes}
        keyExtractor={(item) => item}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={!isLoading ? (
          <Text style={styles.emptyText}>No donor blood groups found.</Text>
        ) : null}
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
    paddingHorizontal: 16,
    paddingVertical: 5,
    backgroundColor: "white",
  },
  introCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 14,
    marginBottom: 12,
  },
  redLine: {
    width: 4,
    height: 42,
    backgroundColor: COLORS.primaryRed,
    borderRadius: 2,
    marginRight: 10,
  },
  introTextWrap: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primaryRed,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 14,
    color: '#666',
    lineHeight: 19,
  },
  listContent: {
    paddingBottom: 18,
  },
  block: {
    elevation: 3,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    shadowOpacity: 0.18,
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'white',
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
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
  emptyText: {
    marginTop: 30,
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
  },
});

export default BloodTypeList;

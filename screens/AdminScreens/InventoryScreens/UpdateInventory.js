import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, BackHandler } from 'react-native';
import { COLORS } from '../../../constants';
import { collection, doc, setDoc, addDoc, getDoc, onSnapshot } from 'firebase/firestore'; // Import the necessary Firebase modules
import { db } from '../../../config';
import LoadingModal from "../../../components/LoadingModel";


const UpdateInventory = ({ route, navigation }) => {
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


  // To show loading on the screen
  const [isLoading, setIsLoading] = useState(true);
  const { item, onUpdate } = route.params;

  const navigateToAddQuantity = () => {
    navigation.navigate('AddQuantityForm', { item, onUpdate });
  };

  const navigateToSubtractQuantity = () => {
    navigation.navigate('SubtractQuantityForm', { item, onUpdate });
  };
  const [totalQuantity, setTotalQuantity] = useState(0); // Initialize totalQuantity state

  useEffect(() => {
    // Set up a listener for the TotalUnitQuantity document
    const totalUnitQuantityRef = doc(collection(db, 'inventory', item.itemName, 'TotalQuantity'), 'TotalUnitQuantity');

    const unsubscribe = onSnapshot(totalUnitQuantityRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const totalUnitQuantity = docSnapshot.data().Quantity || 0;
        setTotalQuantity(totalUnitQuantity);
      }
      setIsLoading(false); // Set loading to false when done
    });

    // Clean up the listener when the component unmounts
    return () => unsubscribe();
  }, [item.itemName]);


  return (
    <View style={styles.container}>
      <LoadingModal visible={isLoading} />
      <View style={{}}>
        <Text style={styles.title}>Add or Subtract blood units from inventory.</Text>
      </View>
      <View style={styles.metricContainer}>
        <View style={styles.metricBox}>
          <Text style={styles.metricValue}>{item.itemName}</Text>
          <Text style={styles.metricLabel}>Blood Group</Text>
        </View><View style={styles.metricBox}>
          <Text style={styles.metricValue}>{totalQuantity}</Text>
          <Text style={styles.metricLabel}>Blood Unit Quantity</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.addButton} onPress={navigateToAddQuantity}>
        <Text style={styles.buttonText}>Add Quantity</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.subtractButton} onPress={navigateToSubtractQuantity}>
        <Text style={styles.buttonText}>Subtract Quantity</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: 'white'
  },
  title: {
    color: COLORS.black,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 40,
    marginTop: 20,
    marginLeft: 10
  },
  itemName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 5,
    marginBottom: 10,
  },
  quantityLabel: {
    fontSize: 16,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.black,
    padding: 8,
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: COLORS.primaryRed,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 20,
    marginLeft: 50,
    marginRight: 50
  },
  subtractButton: {
    backgroundColor: 'orange', // Change the color as needed
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
    marginLeft: 50,
    marginRight: 50
  },
  buttonText: {
    fontWeight: 'bold',
    color: 'white',
    fontSize: 19,
  },
  metricContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  metricBox: {
    flex: 1,
    marginLeft: 10,
    marginRight: 10,
    backgroundColor: '#EFEFEF',
    padding: 20,
    marginTop: 10,
    justifyContent: 'space-between',
    borderColor: 'lightgrey',
    borderWidth: 1,
    borderRadius: 10,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  metricLabel: {
    fontSize: 16,
    marginTop: 5,
  },
});

export default UpdateInventory;

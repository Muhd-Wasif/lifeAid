import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, BackHandler, ActivityIndicator } from 'react-native';
import { COLORS } from '../../../constants';
import CustomDatePicker from '../../../components/CustomDatePicker';
import { collection, doc, setDoc, addDoc, getDoc } from 'firebase/firestore'; // Import the necessary Firebase modules
import { db } from '../../../config';
import { ScrollView } from 'react-native';

const AddQuantityForm = ({ route, navigation }) => {
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

  const { item, onUpdate } = route.params;
  const [donationId, setDonationId] = useState('');
  const [cnic, setCnic] = useState('');
  const [donorName, setDonorName] = useState('');
  const [donationDate, setDonationDate] = useState(null); // State for the selected donation date
  const [expiryDate, setExpiryDate] = useState('');
  const [quantityChange, setQuantityChange] = useState('');
  //To add activity indicator
  const [isLoading, setIsLoading] = useState(false);

  // Function to format CNIC input as the user types
  const formatCnicInput = (text) => {
    // Remove any non-numeric characters
    const numericText = text.replace(/[^\d]/g, '');

    // Format the CNIC with "-" after the 5th and 12th digits
    if (numericText.length >= 5 && numericText.length < 12) {
      return `${numericText.slice(0, 5)}-${numericText.slice(5)}`;
    } else if (numericText.length >= 12) {
      return `${numericText.slice(0, 5)}-${numericText.slice(5, 12)}-${numericText.slice(12)}`;
    }

    return numericText; // Return the formatted CNIC
  };

  // Function to calculate the expiry date by adding 35 days to the donation date
  const calculateExpiryDate = (selectedDate) => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + 35);
    return date.toISOString().split('T')[0];
  };

  const handleAdd = async () => {
    const quantityToAdd = parseInt(quantityChange);

    if (isNaN(quantityToAdd) || quantityToAdd <= 0) {
      alert('Please enter a valid quantity to add.');
      return;
    }
    setIsLoading(true); // Set loading to true before starting the operation
    try {
      const inventoryCollectionRef = collection(db, 'inventory');
      const bloodTypeDocRef = doc(inventoryCollectionRef, item.itemName);
      const donorsCollectionRef = collection(bloodTypeDocRef, 'donorData');

      await addDoc(donorsCollectionRef, {
        DonationId: donationId,
        Cnic: cnic,
        Name: donorName,
        DonationDate: donationDate,
        ExpiryDate: expiryDate,
        Quantity: quantityToAdd,
      });

      // Update Total Quantity

      const totalQuantityRef = collection(bloodTypeDocRef, 'TotalQuantity');
      const totalUnitQuantityDocRef = doc(totalQuantityRef, 'TotalUnitQuantity');
      const totalQuantitySnapshot = await getDoc(totalUnitQuantityDocRef);
      const currentTotalQuantity = totalQuantitySnapshot.exists()
        ? totalQuantitySnapshot.data().Quantity || 0
        : 0;

      await setDoc(totalUnitQuantityDocRef, { Quantity: currentTotalQuantity + quantityToAdd });
      alert('Donor information added successfully!');
      navigation.goBack(); // Navigate back after successful operation
    } catch (error) {
      console.error('Error adding donor information:', error);
    } finally {
      setIsLoading(false); // Set loading back to false after the operation
    }
  };

  return (
    <View style={styles.container}>
      <View style={{ alignItems: 'flex-start', margin: 20, }}>
        <ScrollView>
          <Text style={styles.title}>Fill out the form to add blood units.</Text>

          <TextInput
            placeholder="Donation ID"
            value={donationId}
            onChangeText={(text) => setDonationId(text)}
            keyboardType="numeric"
            style={styles.input}
            maxLength={6} // Enforce exactly 6 digits
          />

          <TextInput
            placeholder="CNIC (e.g., 00000-0000000-0)"
            value={formatCnicInput(cnic)} // Format CNIC input
            onChangeText={(text) => setCnic(text)}
            keyboardType="numeric"
            style={styles.input}
            maxLength={15} // Enforce exactly 13 digits with "-" characters
          />
          <TextInput
            placeholder="Donor Name"
            value={donorName}
            onChangeText={(text) => setDonorName(text)}
            style={styles.input}
          />
          <TextInput
            value={item.itemName}
            editable={false} // Set to false to make it uneditable
            style={styles.input}
          />

          {/* Display the selected donation date */}
          <CustomDatePicker
            selectedDate={donationDate}
            onDateChange={(date) => {
              setDonationDate(date);
              setExpiryDate(calculateExpiryDate(date)); // Calculate and set the expiry date
            }}
          />

          <TextInput
            placeholder="Date of Expiry"
            value={expiryDate}
            onChangeText={(text) => setExpiryDate(text)}
            style={styles.input}
          />
          <TextInput
            placeholder="Units i.e (1 Unit =525mL)"
            value={quantityChange}
            onChangeText={(text) => setQuantityChange(text)}
            style={styles.input}
            keyboardType="numeric"
          />
          <View style={{ justifyContent: 'center', alignItems: 'center', alignSelf: 'center', marginTop: 20 }}>
            {isLoading ? (
              <ActivityIndicator size="large" color={COLORS.primaryRed} />
            ) : (
              <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
                <Text style={styles.buttonText}>Add</Text>
              </TouchableOpacity>
            )}

          </View>
        </ScrollView>
      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {

    flex: 1,

    backgroundColor: 'white'
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '80%',
    borderWidth: 1,
    borderColor: COLORS.black,
    padding: 10,
    marginBottom: 16,
    borderRadius: 5,
    fontSize: 16,
    borderWidth: 1.5,
    padding: 14,
    borderRadius: 8,
    elevation: 8,
    shadowColor: "black",
    shadowRadius: 2,
    shadowOpacity: 10,
    backgroundColor: COLORS.secondaryWhite,
  },
  addButton: {
    marginTop: 20,
    backgroundColor: COLORS.primaryRed,
    width: 130,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    alignSelf: 'center'
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    alignSelf: 'center'
  },
});

export default AddQuantityForm;

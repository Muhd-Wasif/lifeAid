import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, BackHandler, ActivityIndicator } from 'react-native';
import { COLORS } from '../../../constants';
import CustomDatePicker from '../../../components/CustomDatePicker';
import { collection, doc, setDoc, addDoc, getDoc } from 'firebase/firestore'; // Import the necessary Firebase modules
import { db } from '../../../config';


const SubtractQuantityForm = ({ route, navigation }) => {
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
  const [patientName, setpatientName] = useState('');
  const [donationDate, setDonationDate] = useState(null); // State for the selected donation date
  const [quantityChange, setQuantityChange] = useState('');
  //To add activity indicator
  const [isLoading, setIsLoading] = useState(false);


  const handleSubtract = async () => {
    // Validate and subtract quantity from the item
    const quantityToSubtract = parseInt(quantityChange);

    if (isNaN(quantityToSubtract) || quantityToSubtract <= 0) {
      // Handle invalid quantity
      alert('Please enter a valid quantity to subtract.');
      return;
    }
    setIsLoading(true); // Set loading to true before starting the operation
    try {
      const inventoryCollectionRef = collection(db, 'inventory');
      const bloodTypeDocRef = doc(inventoryCollectionRef, item.itemName);
      const patientsCollectionRef = collection(bloodTypeDocRef, 'PatientData'); // Change the collection reference
      //Subtract Quantity and add Data
      await addDoc(patientsCollectionRef, {
        DonationId: donationId,
        Name: patientName,
        DonationDate: donationDate,
        Quantity: quantityToSubtract,
      });

      // Update Total Quantity
      const totalQuantityRef = doc(bloodTypeDocRef, 'TotalQuantity', 'TotalUnitQuantity');
      const totalQuantitySnapshot = await getDoc(totalQuantityRef);
      const currentTotalQuantity = totalQuantitySnapshot.exists()
        ? totalQuantitySnapshot.data().Quantity || 0
        : 0;

      await setDoc(totalQuantityRef, { Quantity: currentTotalQuantity - quantityToSubtract });


      alert('Patient Details added successfully!');
    } catch (error) {
      console.error('Error adding patient information:', error);
    } finally {
      setIsLoading(false); // Set loading back to false after the operation
    }

    const updatedQuantity = item.quantity - quantityToSubtract;

    // Call onUpdate with the updated quantity
    onUpdate(item.id, updatedQuantity);

    navigation.navigate('Inventory', { onUpdate });
  };


  return (
    <View style={styles.container}>
      <View style={{
        margin: 20,
        flex: 1,
        alignItems: 'flex-start',
      }}>
        <Text style={styles.title}>Fill out the details of the patient to whom the blood will be transfused.</Text>

        <TextInput
          placeholder="Donation ID"
          value={donationId}
          onChangeText={(text) => setDonationId(text)}
          keyboardType="numeric"
          style={styles.input}
          maxLength={6} // Enforce exactly 6 digits
        />

        <TextInput
          placeholder="Patient Name"
          value={patientName}
          onChangeText={(text) => setpatientName(text)}
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
            <TouchableOpacity style={styles.subtractButton} onPress={handleSubtract}>
              <Text style={styles.buttonText}>Utilize</Text>
            </TouchableOpacity>
          )}
        </View>
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
  subtractButton: {
    marginTop: 20,
    backgroundColor: COLORS.primaryRed,
    width: 130,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 10,
    alignSelf: 'center',
    alignContent: 'center'
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    alignSelf: 'center'
  },
});

export default SubtractQuantityForm;

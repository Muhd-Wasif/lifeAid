import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, BackHandler } from 'react-native';
import { useNavigation, use } from "@react-navigation/native";
import { COLORS, images } from '../../../constants';
import AddPatient from './AddPatient';
import { db } from '../../../config';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons'
import { doc, collection, getDocs,deleteDoc, onSnapshot } from 'firebase/firestore';
import LoadingModal from '../../../components/LoadingModel';

const PatientInfo = () => {
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

  const [patients, setPatients] = useState([]); // State to store patient list
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  // To show loading on the screen
  const [isLoading, setIsLoading] = useState(true);


  const handleAddNewPatient = (newPatient) => {
    // Update the patient list with the new patient
    setPatients([...patients, newPatient]);
  };

  const handleSearch = () => {
    if (searchQuery.trim() === '') {
      setSearchResults([]);
    } else {
      const filteredPatients = patients.filter((patient) =>
        patient.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(filteredPatients);
    }
  };

  useEffect(() => {
    handleSearch(); // Call handleSearch when the component mounts
  }, [searchQuery]); // Re-run this effect whenever searchQuery changes


  const handleAdd = () => {
    navigation.navigate("AddPatient", { onAddPatient: handleAddNewPatient });
  };

  const handleView = (item) => {
    navigation.navigate('ViewPatient', { patientData: item }); // Pass the item as patientData
  };

  const handleDelete = async (patientId) => {
    try {
      // Create a reference to the patient document in Firestore
      const patientRef = doc(db, 'patients', patientId);

      // Delete the patient document
      await deleteDoc(patientRef);

      // Remove the deleted patient from the state
      setPatients((prevPatients) => prevPatients.filter((patient) => patient.id !== patientId));
    } catch (error) {
      console.error('Error deleting patient:', error);
    }
  };

  useEffect(() => {
    // Create a reference to the patients collection
    const patientsCollectionRef = collection(db, 'patients');

    // Subscribe to changes in the collection
    const unsubscribe = onSnapshot(patientsCollectionRef, (querySnapshot) => {
      const fetchedPatients = [];
      querySnapshot.forEach((doc) => {
        const patientData = doc.data();
        fetchedPatients.push({ id: doc.id, ...patientData });
      });
      setIsLoading(false); // Set loading to false when done
      setPatients(fetchedPatients);
    });

    // Unsubscribe from the snapshot listener when the component is unmounted
    return () => unsubscribe();
  }, []); // Empty dependency array to run this effect only once on mount

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
    <View style={styles.container}>
    {renderHeader()}
      <LoadingModal visible={isLoading} />
      <Text style={styles.title}>Patient List</Text>
      <View style={{
        flex: 1,
        padding: 1,
        marginLeft: 10,
        marginRight: 10,
      }}>
        {/* Search Bar */}
        <TextInput
          placeholder="Search Patients"
          value={searchQuery}
          onChangeText={(text) => setSearchQuery(text)}
          style={styles.searchInput}
        />

        {/* List of Patients */}
        <FlatList
          style={styles.Flatlist}
          data={searchResults.length > 0 ? searchResults : patients}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.listItem}>
              <Text style={styles.patientItem}>{item.name}</Text>

              {/* View Button */}
              <TouchableOpacity style={styles.Flatlist_button} onPress={() => handleView(item)}>
                <Text style={styles.Flatlist_buttonText}>View</Text>
              </TouchableOpacity>
              <TouchableOpacity
              style={styles.Flatlist_button}
              onPress={() => handleDelete(item.id)}
            >
              <Text style={styles.Flatlist_buttonText}>Delete</Text>
            </TouchableOpacity>
            </View>
          )}
        />

      </View>

      <TouchableOpacity style={styles.button} onPress={handleAdd}>
        <Text style={styles.buttonText}>Add New Patient</Text>
      </TouchableOpacity>
    </View>

  );
};



const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal:12,
    paddingVertical:5,
    backgroundColor: 'white',
  },
  Flatlist: {
    marginBottom: 15,
    borderColor: COLORS.black,
  },
  title: {
    color: COLORS.primaryRed,
    fontWeight: 'bold',
    fontSize: 36,
    marginBottom: 20,
    marginTop: 10,
    alignSelf: 'center'
  },
  searchInput: {
    width: 350,
    borderWidth: 1,
    borderColor: COLORS.black,
    borderRadius: 10,
    padding: 10,
    marginBottom: 16,
    justifyContent: 'center',
    alignSelf: 'center'
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 8,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    shadowOpacity: 0.3,
    padding: 10,
    borderRadius: 10,
    backgroundColor: 'white',
    marginBottom: 20,
    marginRight: 5,
    marginLeft: 5,
    marginTop: 2

  },
  patientItem: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
    alignItems: 'center',
  },
  Flatlist_button: {
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    elevation: 5,
    marginLeft: 8,
    backgroundColor: COLORS.primaryRed,
  },
  button: {
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 5,
    paddingVertical: 15,
    borderRadius: 10,
    elevation: 10,
    marginBottom: 20,
    backgroundColor: COLORS.primaryRed,
    marginLeft: 75,
    marginRight: 75
  },
  Flatlist_buttonText: {
    color: 'white',
    fontSize: 14,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default PatientInfo;
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  BackHandler
} from 'react-native';
import { useNavigation } from "@react-navigation/native";
import { COLORS } from '../../../constants';
import { db } from '../../../config';
import { doc, collection, deleteDoc, onSnapshot } from 'firebase/firestore';
import LoadingModal from '../../../components/LoadingModel';
import AdminHeader from '../../../components/AdminHeader';

const PatientInfo = () => {
  const navigation = useNavigation();

  const [patients, setPatients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        navigation.goBack();
        return true;
      }
    );
    return () => backHandler.remove();
  }, [navigation]);

  useEffect(() => {
    const patientsCollectionRef = collection(db, 'patients');

    const unsubscribe = onSnapshot(patientsCollectionRef, (querySnapshot) => {
      const patientMap = new Map();
      querySnapshot.forEach((docSnap) => {
        const patientData = {
          id: docSnap.id,
          ...docSnap.data(),
        };
        const key = patientData.cnic || patientData.phoneNumber || patientData.id;
        if (!patientMap.has(key)) {
          patientMap.set(key, patientData);
        }
      });
      setPatients(Array.from(patientMap.values()));
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults([]);
      return;
    }

    const filtered = patients.filter((patient) =>
      (`${patient.firstName} ${patient.lastName}`)
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );
    setSearchResults(filtered);
  }, [searchQuery, patients]);

  const handleAdd = () => {
    navigation.navigate("AddPatient");
  };

  const handleView = (item) => {
    navigation.navigate('ViewPatient', { patientData: item });
  };

  const handleDelete = async (patientId) => {
    //const docRef = doc(db, 'patients', patientId);

    try {
      await deleteDoc(doc(db, 'patients', patientId));
      console.log('Delete successful ');
      console.log('Patient deleted:', patientId);
    } catch (error) {
      console.log('Delete failed:', error.message);
      alert('Delete failed. Check Firestore rules.');
    }
    finally {
      console.log('Delete finally failed');
    }
  };


  return (
    <View style={styles.container}>
      <AdminHeader navigation={navigation} />
      <LoadingModal visible={isLoading} />

      <Text style={styles.title}>Patient List</Text>

      <TextInput
        placeholder="Search patient by name"
        value={searchQuery}
        onChangeText={setSearchQuery}
        style={styles.searchInput}
      />

      <FlatList
        data={searchResults.length > 0 ? searchResults : patients}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <Text style={styles.patientItem}>
              {item.firstName} {item.lastName}
            </Text>

            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => handleView(item)}
            >
              <Text style={styles.actionText}>View</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => handleDelete(item.id)}
            >
              <Text style={styles.actionText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      <TouchableOpacity style={styles.button} onPress={handleAdd}>
        <Text style={styles.buttonText}>Add New Patient</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 12,
    backgroundColor: 'white'
  },
  title: {
    color: COLORS.primaryRed,
    fontWeight: 'bold',
    fontSize: 30,
    textAlign: 'center',
    marginBottom: 15
  },
  searchInput: {
    borderWidth: 1,
    borderColor: COLORS.black,
    borderRadius: 10,
    padding: 10,
    marginBottom: 15
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 6,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12
  },
  patientItem: {
    flex: 1,
    fontSize: 15
  },
  actionBtn: {
    backgroundColor: COLORS.primaryRed,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 6
  },
  actionText: {
    color: 'white',
    fontSize: 13
  },
  button: {
    backgroundColor: COLORS.primaryRed,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 15,
    marginHorizontal: 0
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold'
  }
});

export default PatientInfo;

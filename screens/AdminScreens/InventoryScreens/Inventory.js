import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, BackHandler, ActivityIndicator, Image } from 'react-native';
import { useNavigation } from "@react-navigation/native";
import { COLORS } from '../../../constants';
import { icons } from '../../../constants';
import { collection, doc, setDoc, addDoc, getDoc, onSnapshot } from 'firebase/firestore'; // Import the necessary Firebase modules
import { db } from '../../../config';
import LoadingModal from '../../../components/LoadingModel';

const initialInventoryItems = [
  { id: 1, itemName: 'A+', totalUnitQuantity: 0 },
  { id: 2, itemName: 'A-', totalUnitQuantity: 0 },
  { id: 3, itemName: 'B+', totalUnitQuantity: 0 },
  { id: 4, itemName: 'B-', totalUnitQuantity: 0 },
  { id: 5, itemName: 'AB+', totalUnitQuantity: 0 },
  { id: 6, itemName: 'AB-', totalUnitQuantity: 0 },
  { id: 7, itemName: 'O+', totalUnitQuantity: 0 },
  { id: 8, itemName: 'O-', totalUnitQuantity: 0 },
];

const Inventory = () => {
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

  const [inventoryItems, setInventoryItems] = useState(initialInventoryItems);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedBloodGroup, setSelectedBloodGroup] = useState('');
  // To show loading on the screen
  const [isLoading, setIsLoading] = useState(true);

  const calculateTotalDonations = () => {
    return inventoryItems.reduce((total, item) => total + item.totalUnitQuantity, 0);
  };

  const [totalBloodDonations, setTotalBloodDonations] = useState(calculateTotalDonations());

  useEffect(() => {
    setTotalBloodDonations(calculateTotalDonations());
  }, [inventoryItems]);

  const handleUpdate = (item) => {
    navigation.navigate('UpdateInventory', { item, onUpdate: onUpdateQuantity });
  };

  const onUpdateQuantity = (itemId, newQuantity) => {
    const updatedItems = inventoryItems.map((item) => {
      if (item.id === itemId) {
        return { ...item, quantity: newQuantity };
      }
      return item;
    });

    setInventoryItems(updatedItems);
  };


  const handleSearch = () => {
    const filteredItems = inventoryItems.filter((item) =>
      item.itemName.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setSearchResults(filteredItems);
  };

  const formatQuantity = (quantity) => {
    return quantity < 10 ? `0${quantity}` : `${quantity}`;
  };


  //To fetch total quantity from the database
  useEffect(() => {
    const fetchTotalUnitQuantity = async () => {
      try {
        const updatedItems = [...inventoryItems]; // Make a copy of inventoryItems

        for (let i = 0; i < updatedItems.length; i++) {
          const item = updatedItems[i];
          const bloodTypeDocRef = doc(collection(db, 'inventory'), item.itemName);
          const totalUnitQuantityRef = doc(collection(bloodTypeDocRef, 'TotalQuantity'), 'TotalUnitQuantity');
          const docSnapshot = await getDoc(totalUnitQuantityRef);

          if (docSnapshot.exists()) {
            const totalUnitQuantity = docSnapshot.data().Quantity;
            item.totalUnitQuantity = totalUnitQuantity;
          }
        }

        setInventoryItems(updatedItems); // Update state with the modified items
      } catch (error) {
        console.error('Error fetching total unit quantity:', error);
      } finally {
        setIsLoading(false); // Set loading to false when done
      }
    };

    fetchTotalUnitQuantity();
  }, []);
  // ...

  const fetchTotalUnitQuantity = async () => {
    setIsLoading(true);

    try {
      const updatedItems = [...inventoryItems];

      for (let i = 0; i < updatedItems.length; i++) {
        const item = updatedItems[i];
        const bloodTypeDocRef = doc(collection(db, 'inventory'), item.itemName);
        const totalUnitQuantityRef = doc(collection(bloodTypeDocRef, 'TotalQuantity'), 'TotalUnitQuantity');
        const docSnapshot = await getDoc(totalUnitQuantityRef);

        if (docSnapshot.exists()) {
          const totalUnitQuantity = docSnapshot.data().Quantity;
          item.totalUnitQuantity = totalUnitQuantity;
        }
      }

      setInventoryItems(updatedItems);
      setTotalBloodDonations(calculateTotalDonations());
    } catch (error) {
      console.error('Error fetching total unit quantity:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>


      <View style={styles.metricContainer}>
        <View style={styles.metricBox}>
          <Text style={styles.metricValue}>{totalBloodDonations}</Text>
          <Text style={styles.metricLabel}>Total Blood Donations</Text>
        </View>
      </View>

      <LoadingModal visible={isLoading} />

      <TextInput
        placeholder="Search Inventory Items"
        value={searchQuery}
        onChangeText={(text) => setSearchQuery(text)}
        style={styles.searchInput}
      />

      <TouchableOpacity style={styles.button} onPress={handleSearch}>
        <Text style={styles.buttonText}>Search</Text>
      </TouchableOpacity>
      <View>

      </View>
      <TouchableOpacity style={styles.refreshButton} onPress={fetchTotalUnitQuantity}>
        <Image source={icons.refreshIcon} style={styles.refreshIcon} />
        <Text style={{ marginTop: 5 }}>Refresh</Text>
      </TouchableOpacity>

      <FlatList
        style={styles.Flatlist}
        data={searchResults.length > 0 ? searchResults : inventoryItems}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleUpdate(item)} style={styles.listItem}>

            <Text style={styles.inventoryItem}>{item.itemName}</Text>
            <Text style={styles.quantity}>
              Units Available: {item.totalUnitQuantity}
            </Text>

          </TouchableOpacity>
        )}
      />


    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    flex: 1,
    padding: 7,
    backgroundColor: 'white'
  },
  refreshButton: {
    position: 'absolute',
    top: 248,
    right: 28,
    flexDirection: 'row'
  },
  refreshIcon: {
    height: 30,
    width: 30,
  },
  Flatlist: {
    padding: 15,
    marginBottom: 15,
    borderColor: COLORS.black,
  },
  title: {
    alignItems: 'center',
    color: COLORS.primaryRed,
    fontWeight: 'bold',
    fontSize: 28,
    marginBottom: 10,
  },

  searchInput: {

    marginLeft: 20,
    marginRight: 20,
    borderWidth: 1,
    borderColor: COLORS.black,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
    marginBottom: 18,
    elevation: 4
  },
  listItem: {
    flexDirection: 'row',
    borderColor: COLORS.black,
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    padding: 15,
    borderRadius: 8,
    backgroundColor: 'white',
    elevation: 5,
    marginLeft: 2,
    marginRight: 2,
    marginTop: 2
  },
  inventoryItem: {
    flex: 1,
    fontWeight: 'bold',
    fontSize: 17
  },
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    alignItems: 'center',
    marginLeft: 130,
    marginRight: 130,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
    elevation: 10,
    marginBottom: 20,
    backgroundColor: COLORS.primaryRed,
  },
  buttonText: {
    fontWeight: 'bold',
    color: 'white',
    fontSize: 16,
  },
  quantity: {
    fontWeight: 'bold',
    marginRight: 10,
    fontSize: 17
  },
  metricContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  metricBox: {
    flex: 1,
    backgroundColor: '#EFEFEF',
    padding: 20,
    marginTop: 10,
    marginLeft: 90,
    marginRight: 90,
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

export default Inventory;

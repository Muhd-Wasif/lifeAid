import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet, Image, BackHandler, SafeAreaView } from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../config';
import { COLORS, icons } from '../../../constants';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons'
import BloodGroupFilterModal from '../../../components/BloodGroupFilterModal';
import LoadingModal from '../../../components/LoadingModel';

const RegisteredUsers = ({ navigation }) => {
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


  const [donors, setDonors] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBloodGroup, setSelectedBloodGroup] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  // To show loading on the screen
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [selectedBloodGroup]);

  const fetchData = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const donorData = [];
      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        // Apply the blood group filter
        if (!selectedBloodGroup || userData.bloodGroup === selectedBloodGroup) {
          donorData.push({ id: doc.id, ...userData });
        }
        setIsLoading(false); // Set loading to false when done
      });
      setDonors(donorData);
    } catch (error) {
      console.error('Error fetching donors:', error);
    }
  };

  const filteredDonors = donors.filter((donor) => {
    // Check if donor.fullName is defined
    if (donor.fullName) {
      return donor.fullName.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return false; // If fullName is undefined, exclude this donor
  });


  const applyBloodGroupFilter = (bloodGroup) => {
    setSelectedBloodGroup(bloodGroup);
    setIsModalVisible(false); // Close the modal
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={{
        elevation: 7,
        shadowColor: 'black',
        shadowOffset: { width: 0, height: 1 },
        shadowRadius: 2,
        shadowOpacity: 0.3,
        padding: 16,
        borderRadius: 10,
        marginRight: 10,
        marginLeft: 1,
        marginTop: 3,
        marginBottom: 7,
        backgroundColor: 'white',
        flexDirection: 'row',
        justifyContent: 'space-between',
      }}
      onPress={() => {
        navigation.navigate('ViewUserInfo', { donor: item });
      }}
    >
      <Text>{item.fullName}</Text>
    </TouchableOpacity>
  );
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
      <LoadingModal visible={isLoading} />
      <Text style={styles.title}>Registered Users</Text>
      <View style={styles.row}>
        <TextInput
          style={styles.searchQuery}
          placeholder="Search by name..."
          value={searchQuery}
          onChangeText={(text) => setSearchQuery(text)}
        />
        <TouchableOpacity
          style={styles.filterIconContainer}
          onPress={() => setIsModalVisible(true)}
        >
          <Image style={styles.filterIcon} source={icons.filterIcon} />
        </TouchableOpacity>
      </View>
      <FlatList
        data={filteredDonors}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />
      <BloodGroupFilterModal
        isVisible={isModalVisible}
        onApplyFilter={applyBloodGroupFilter}
        onClose={() => setIsModalVisible(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    backgroundColor: 'white'
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: COLORS.primaryRed,
    textAlign: 'center',
    marginTop: 20,
  },
  filterIcon: {
    width: 20,
    height: 20,
  },
  searchQuery: {
    flex: 1,
    borderWidth: 2,
    borderColor: 'lightgray',
    margin: 16,
    padding: 8,
    borderRadius: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center', // Align items vertically in the center
  },
  filterIconContainer: {
    marginLeft: 10, // Add some spacing between searchQuery and filterIcon
  },
});

export default RegisteredUsers;

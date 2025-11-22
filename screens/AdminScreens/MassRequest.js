import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet, Image, SafeAreaView, BackHandler, Alert, ActivityIndicator } from 'react-native';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../../config';
import { COLORS, icons } from '../../constants';
import CustomButton from '../../components/CustomButton';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons'
import BloodGroupFilterModal from '../../components/BloodGroupFilterModal';
import LoadingModal from '../../components/LoadingModel';
import { getDatabase, ref, set, push, update } from "firebase/database";


const MassRequest = ({ navigation }) => {
  const [donors, setDonors] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBloodGroup, setSelectedBloodGroup] = useState(''); // State for selected blood group
  const [selectedDonors, setSelectedDonors] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectAll, setSelectAll] = useState(false);
  const [buttonColor, setButtonColor] = useState(COLORS.primaryRed); // State for button color
  // To show loading on the screen
  const [isLoading, setIsLoading] = useState(true);
  //To show sending on the button
  const [isSending, setSending] = useState(false);
  // Initialize Realtime Firebase Database
  const database = getDatabase();
  //Setting a custom Notification Message
  const [customMessage, setCustomMessage] = useState('JSF needs your help.');

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
      });
      setDonors(donorData);
      setIsLoading(false); // Set loading to false when done
    } catch (error) {
      console.error('Error fetching donors:', error);
    }
  };

  const filteredDonors = donors.filter((donor) => {
    // Case-insensitive search by fullName
    return donor.fullName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const applyBloodGroupFilter = (bloodGroup) => {
    setSelectedBloodGroup(bloodGroup); // Update the selected blood group state
    setIsModalVisible(false); // Close the modal
  };

  const toggleSelection = (donor) => {
    const isSelected = selectedDonors.find((selected) => selected.id === donor.id);
    if (isSelected) {
      setSelectedDonors(selectedDonors.filter((selected) => selected.id !== donor.id));
    } else {
      setSelectedDonors([...selectedDonors, donor]);
    }
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedDonors([]); // Deselect all users
    } else {
      setSelectedDonors([...filteredDonors]); // Select all users
    }
    setSelectAll(!selectAll); // Toggle the "Select All" state
  };

  const sendRequests = async () => {
    setSending(true);
    if (selectedDonors.length === 0) {
      return; // If no donor is selected
    }

    try {
      const notificationsRef = ref(database, 'notifications');
      const notificationId = push(notificationsRef).key;
      const uniqueNotifications = [{
        notificationId: notificationId,
        message: customMessage,
        timestamp: new Date().getTime(),
        read: false // This sets the notification as unread by default
      }];

      uniqueNotifications.forEach((notification) => {
        const newNotificationRef = push(ref(database, 'notifications'));
        set(newNotificationRef, notification);
      });

      //Custom Alert message based on the selection
      let alertMessage;
      if (selectedDonors.length === 1) {
        alertMessage = `Request sent to ${selectedDonors[0].fullName}.`;
      } else {
        alertMessage = `Requests sent to ${selectedDonors.length} ${selectedBloodGroup} donors.`;
      }

      // Show an alert after sending the notifications
      Alert.alert(
        'Request Sent',
        alertMessage,
        [{ text: 'OK', onPress: () => console.log('OK Pressed') }]
      );
      setSending(false);
      // Clear the selection after sending notifications
      setSelectedDonors([]);
      setSelectAll(false); // Deselect all after sending notifications

    } catch (error) {
      console.error('Error sending notifications:', error);
    }
  };

  const saveCustomMessage = async () => {
    try {
      const notificationsRef = ref(database, 'notifications');

      const newNotificationRef = push(notificationsRef);
      const uniqueId = newNotificationRef.key;

      if (uniqueId) {
        const updates = {};
        updates[`${uniqueId}/customMessage`] = customMessage;
        await update(notificationsRef, updates);

        Alert.alert('Message Saved', 'Custom message has been saved.');
      } else {
        console.error('Error generating unique ID');
      }
    } catch (error) {
      console.error('Error saving custom message:', error);
    }
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
        backgroundColor: selectedDonors.find((selected) => selected.id === item.id)
          ? 'lightgreen'
          : 'white',
      }}
      onPress={() => toggleSelection(item)}
    >
      <Text>{item.fullName}</Text>
    </TouchableOpacity>
  );



  return (
    <SafeAreaView style={styles.container}>
      <LoadingModal visible={isLoading} />
      {renderHeader()}
      <Text style={styles.title}>Mass Request</Text>
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

      <View style={styles.row}>
        <TextInput
          style={styles.customMessageInput}
          placeholder="Enter custom message..."
          value={customMessage}
          onChangeText={(text) => setCustomMessage(text)}
        />
        <TouchableOpacity
          style={styles.saveButton}
          onPress={saveCustomMessage}
        >
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>

      <View style={{ alignContent: 'center' }}>
        <TouchableOpacity
          style={[
            styles.selectAll,
            { backgroundColor: selectAll ? 'green' : COLORS.primaryRed },
            // Center the text within the button
            { justifyContent: 'center', alignItems: 'center' },
          ]}
          onPress={toggleSelectAll}
        >
          <Text style={styles.selectAllText}>
            {selectAll ? 'Deselect All' : 'Select All'}
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredDonors}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        style={styles.list}
      />

      <BloodGroupFilterModal
        isVisible={isModalVisible}
        onApplyFilter={applyBloodGroupFilter}
        onClose={() => setIsModalVisible(false)}
      />
      <View style={{ borderRadius: 30, marginHorizontal: 20 }}>
        {isSending ? (
          <ActivityIndicator size="large" color={COLORS.primaryRed} />
        ) : (
          <CustomButton
            title={`Send Requests to ${selectedDonors.length} ${selectedBloodGroup} Donors`}
            onPress={sendRequests}
            disabled={selectedDonors.length === 0}
            color={buttonColor}
          />
        )}

      </View>
    </SafeAreaView>

  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: 'white'
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 5,
    color: COLORS.primaryRed
  },
  filterIcon: {
    width: 20,
    height: 20,
  },
  searchQuery: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'lightgray',
    margin: 16,
    padding: 8,
    borderRadius: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterIconContainer: {
    marginLeft: 10,
  },
  selectAll: {
    paddingVertical: 4,
    marginRight: 290,
    marginBottom: 8,
    width: 85,
    backgroundColor: COLORS.primaryRed,
    borderRadius: 5,
  },
  selectAllText: {
    padding: 2,
    color: 'white',
  },
  customMessageInput: {
    borderWidth: 1,
    borderColor: 'lightgray',
    padding: 8,
    borderRadius: 8,
    marginTop: 1,
    marginBottom: 15,
    marginLeft: 18,
    marginRight: 15,
    width: 280
  },
  saveButton: {
    paddingVertical: 4,
    marginRight: 290,
    marginBottom: 8,
    width: 60,
    backgroundColor: COLORS.primaryRed,
    borderRadius: 5,
  },
  saveButtonText: {
    padding: 2,
    color: 'white',
    alignSelf: 'center'
  },
  list: {
    marginBottom: 5
  }
});

export default MassRequest;
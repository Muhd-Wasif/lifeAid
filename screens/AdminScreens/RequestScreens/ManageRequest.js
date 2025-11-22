import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, BackHandler, Linking, TouchableOpacity, SafeAreaView } from 'react-native';
import { COLORS } from '../../../constants';
import { collection, getDocs } from 'firebase/firestore';
import { db } from "../../../config";
import LoadingModal from '../../../components/LoadingModel';
import CustomButton from '../../../components/CustomButton';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons'
import { doc, deleteDoc } from 'firebase/firestore';


const ManageRequest = ({ navigation }) => {
  const [selectedRequestId, setSelectedRequestId] = useState(null);

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

  // To show loading on the screen
  const [isLoading, setIsLoading] = useState(true);
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const requestCollection = collection(db, 'requests');
        const snapshot = await getDocs(requestCollection);
        const requestData = snapshot.docs.map(doc => ({
          id: doc.id,
          fullName: doc.data().fullName,
          phoneNumber: doc.data().phoneNumber,
          currentUserName: doc.data().currentUserName,
          ...doc.data()
        }));
        setRequests(requestData);
        setIsLoading(false); // Set loading to false when done
      } catch (error) {
        console.error('Error fetching requests: ', error);
      }
    };

    fetchData();
  }, []);

  const handleContactRequest = (phoneNumber) => {
    // Construct the tel: URL to initiate a call
    const phoneNumberUrl = `tel:${phoneNumber}`;

    // Open the phone app to initiate the call
    Linking.openURL(phoneNumberUrl);
  };

  const handleDeleteRequest = async (requestId) => {
    try {
      // Remove the request from the screen
      setRequests((prevRequests) => prevRequests.filter((request) => request.id !== requestId));

      // Remove the request from Firestore collection
      await deleteDoc(doc(db, 'requests', requestId));
    } catch (error) {
      console.error('Error deleting request: ', error);
    }
  };


  const handleRespondToRequest = (requestId) => {
    // When button is pressed
    navigation.navigate("MassRequest");
  };

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      <LoadingModal visible={isLoading} />
      <Text style={styles.title}>Manage Requests</Text>
      <FlatList
        data={requests}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.requestItem}>
            <View style={{ flexDirection: 'row' }}>
              <Text style={styles.requestHeading}>Full Name:</Text>
              <Text style={styles.requestValue}> {item.fullName}</Text>
            </View>

            <View style={{ flexDirection: 'row' }}>
              <Text style={styles.requestHeading}>Phone Number:</Text>
              <Text style={styles.requestValue}> {item.phoneNumber}</Text>
            </View>
            <View style={{ flexDirection: 'row' }}>
              <Text style={styles.requestHeading}>Blood Type:</Text>
              <Text style={styles.requestValue}> {item.bloodType}</Text>
            </View>

            <View style={{ flexDirection: 'row' }}>
              <Text style={styles.requestHeading}>Blood Group:</Text>
              <Text style={styles.requestValue}> {item.bloodGroup}</Text>

            </View>
            <View style={{ flexDirection: 'row' }}>
              <Text style={styles.requestHeading}>Medical Reason:</Text>
              <Text style={styles.requestValue}> {item.medicalReason}</Text>

            </View>
            <View >
              <View style={{ flexDirection: 'row', justifyContent: 'space-evenly', marginHorizontal: 20 }
              }>
                <TouchableOpacity style={styles.button}
                  onPress={() => handleDeleteRequest(item.id)}>
                  <Text style={styles.buttonText}>Delete</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button}
                  onPress={() => handleRespondToRequest(item.id)}>
                  <Text style={styles.buttonText}>Respond</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button}
                  onPress={() => handleContactRequest(item.phoneNumber)}>
                  <Text style={styles.buttonText}>Contact</Text>
                </TouchableOpacity>
              </View>
            </View>
            <Text style={styles.sentBy}>Request Sent By: {item.currentUserName}  </Text>
          </View>
        )}
      />

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
    color: COLORS.primaryRed,
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 30,
    alignSelf: 'center'
  },
  requestItem: {
    elevation: 10,
    shadowColor: 'black',
    shadowOffset: { width: 1, height: 1 },
    shadowRadius: 2,
    shadowOpacity: 0.3,
    padding: 20,
    borderRadius: 10,
    backgroundColor: 'white',
    marginTop: 15,
    marginLeft: 5,
    marginRight: 5,
    marginBottom: 20
  },
  requestHeading: {
    fontSize: 18,
    marginBottom: 4,
    fontWeight: 'bold',
  },
  requestValue: {
    fontSize: 18,
    marginBottom: 4,
  },
  button: {
    marginTop: 10,
    borderRadius: 10,
    marginHorizontal: 20,
    padding: 10,
    width: 96,
    paddingHorizontal: 16,
    alignItems: 'center',
    backgroundColor: COLORS.primaryRed
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold'
  },
  sentBy: {
    alignSelf: 'flex-end',
    fontSize: 12,
    color: 'grey',
    marginBottom: -5,
    marginTop: 10
  },
});

export default ManageRequest;

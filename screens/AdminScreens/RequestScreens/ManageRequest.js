import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, BackHandler, Linking, TouchableOpacity, SafeAreaView } from 'react-native';
import { COLORS } from '../../../constants';
import { collection, getDocs } from 'firebase/firestore';
import { db } from "../../../config";
import LoadingModal from '../../../components/LoadingModel';
import CustomButton from '../../../components/CustomButton';
import { doc, deleteDoc } from 'firebase/firestore';
import AdminHeader from '../../../components/AdminHeader';


const ManageRequest = ({ navigation }) => {
  const [selectedRequestId, setSelectedRequestId] = useState(null);

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
      <AdminHeader navigation={navigation} />
      <LoadingModal visible={isLoading} />
      <Text style={styles.title}>Manage Requests</Text>
      <FlatList
        data={requests}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.requestItem}>
            <View style={styles.detailRow}>
              <Text style={styles.requestHeading}>Full Name:</Text>
              <Text style={styles.requestValue}> {item.fullName}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.requestHeading}>Phone Number:</Text>
              <Text style={styles.requestValue}> {item.phoneNumber}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.requestHeading}>Blood Type:</Text>
              <Text style={styles.requestValue}> {item.bloodType}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.requestHeading}>Blood Group:</Text>
              <Text style={styles.requestValue}> {item.bloodGroup}</Text>

            </View>
            <View style={styles.detailRow}>
              <Text style={styles.requestHeading}>Medical Reason:</Text>
              <Text style={styles.requestValue}> {item.medicalReason}</Text>

            </View>
            <View style={styles.actionsRow}>
              <TouchableOpacity style={styles.button}
                onPress={() => handleDeleteRequest(item.id)}>
                <Text style={styles.buttonText} numberOfLines={1}>Delete</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button}
                onPress={() => handleRespondToRequest(item.id)}>
                <Text style={styles.buttonText} numberOfLines={1}>Respond</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button}
                onPress={() => handleContactRequest(item.phoneNumber)}>
                <Text style={styles.buttonText} numberOfLines={1}>Contact</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 5,
    backgroundColor: 'white'
  },
  title: {
    color: COLORS.primaryRed,
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 18,
    textAlign: 'center'
  },
  listContent: {
    paddingBottom: 18,
  },
  requestItem: {
    elevation: 5,
    shadowColor: 'black',
    shadowOffset: { width: 1, height: 1 },
    shadowRadius: 2,
    shadowOpacity: 0.18,
    padding: 16,
    borderRadius: 10,
    backgroundColor: 'white',
    marginHorizontal: 2,
    marginBottom: 16
  },
  detailRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  requestHeading: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  requestValue: {
    flexShrink: 1,
    fontSize: 16,
    lineHeight: 22,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  button: {
    flex: 1,
    minWidth: 0,
    borderRadius: 10,
    paddingVertical: 11,
    paddingHorizontal: 6,
    alignItems: 'center',
    backgroundColor: COLORS.primaryRed
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold'
  },
});

export default ManageRequest;

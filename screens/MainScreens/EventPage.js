import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, BackHandler } from 'react-native';
import { COLORS } from '../../constants';
import { collection, getDocs, doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from "../../config";
import { getAuth } from 'firebase/auth';
import LoadingModal from '../../components/LoadingModel';
import OtherUserHeader from '../../components/OtherUserHeader';

const EventPage = ({navigation}) => {

    //For exiting the appliaction on hardware backPress
    useEffect(() => {
        const backAction = () => {
            Alert.alert(
                'Exit App',
                'Are you sure you want to exit?',
                [
                    {
                        text: 'Cancel',
                        onPress: () => null, // Do nothing when cancel is pressed
                        style: 'cancel',
                    },
                    { text: 'OK', onPress: () => BackHandler.exitApp() },
                ],
                { cancelable: false }
            );

            return true; // Prevent default behavior (exit the app)
        };

        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            backAction
        );

        return () => backHandler.remove();
    }, []);

    // To show loading on the screen
    const [isLoading, setIsLoading] = useState(true);
    const [events, setEvents] = useState([]);
    const [interestStatus, setInterestStatus] = useState({});

    useEffect(() => {
        const fetchData = async () => {
            try {
                const eventsCollection = collection(db, 'events');
                const snapshot = await getDocs(eventsCollection);
                const eventData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setEvents(eventData);
                // Initialize interestStatus for each event
                const initialStatus = eventData.reduce((acc, event) => {
                    acc[event.id] = { going: false, notInterested: false };
                    return acc;
                }, {});
                setInterestStatus(initialStatus);
                setIsLoading(false); // Set loading to false when done
            } catch (error) {
                console.error('Error fetching events: ', error);
            }
        };

        fetchData();
    }, []);

    const toggleInterest = async (eventId, isGoing) => {
        const auth = getAuth(); // Get the authentication object

        if (auth.currentUser) {
            const uid = auth.currentUser.uid;

            try {
                const eventRef = doc(db, 'events', eventId);
                await updateDoc(eventRef, {
                    interestedUsers: isGoing ? arrayUnion(uid) : arrayRemove(uid)
                });
                // Update the interestStatus state after the Firestore update
                setInterestStatus(prevStatus => ({
                    ...prevStatus,
                    [eventId]: {
                        going: isGoing,
                        notInterested: !isGoing
                    }
                }));
            } catch (error) {
                console.error('Error toggling interest:', error);
            }
        } else {
            console.error('No authenticated user found');
        }
    };
    //Formatting the date to DD/MM/YYYY
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-indexed
        const year = date.getFullYear();

        return `${day}/${month}/${year}`;
    };

    return (
        <View style={styles.container}>
        <OtherUserHeader navigation={navigation}/>
        <View style={styles.secondarycontainer}>
            <LoadingModal visible={isLoading} />
            <FlatList
                data={events}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.eventItem}>
                        <Text style={styles.eventTitle}>{item.title}</Text>
                        <Text style={styles.eventLocation}>Location: {item.location}</Text>
                        <Text style={styles.eventDates}>
                            Start Date: {formatDate(item.startDate)}
                        </Text>
                        <Text style={styles.eventDates}>
                            End Date:   {formatDate(item.endDate)}
                        </Text>

                        <View style={styles.buttonContainer}>
                            <TouchableOpacity
                                onPress={() => toggleInterest(item.id, true)}
                                style={[styles.button, interestStatus[item.id] && interestStatus[item.id].going && styles.interested]}
                            >
                                <Text style={styles.buttonText}>
                                    {interestStatus[item.id] && interestStatus[item.id].going ? '✔ Going' : 'Going'}
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => toggleInterest(item.id, false)}
                                style={[styles.button, interestStatus[item.id] && interestStatus[item.id].notInterested && styles.notInterested]}
                            >
                                <Text style={styles.buttonText}>
                                    {interestStatus[item.id] && interestStatus[item.id].notInterested ? '✖ Not Interested' : 'Not Interested'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            />
        </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    secondarycontainer: {
        flex: 1,
        padding: 16,
        backgroundColor: COLORS.secondaryWhite
    },
    title: {
        color: COLORS.primaryRed,
        fontSize: 36,
        fontWeight: 'bold',
        marginBottom: 30,
        alignSelf: 'center'
    },
    eventItem: {
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
        marginBottom: 5
    },
    eventTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    eventLocation: {
        fontSize: 16,
        marginBottom: 4,
    },
    eventDates: {
        fontSize: 16,
        marginBottom: 4,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    button: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: 'center',
        backgroundColor: 'grey', // Default button color
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
    },
    interested: {
        backgroundColor: 'green',
    },
    notInterested: {
        backgroundColor: 'red',
    },
});

export default EventPage;

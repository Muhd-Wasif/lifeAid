import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { doc, collection, getDocs, deleteDoc, onSnapshot, query, where } from 'firebase/firestore';
import { COLORS, icons } from '../constants';
import { Ionicons } from '@expo/vector-icons'
import { getAuth } from 'firebase/auth';
import { db } from '../config';
import { getDatabase, ref, onValue, update, get } from "firebase/database";

const HeaderUsers = (props) => {
  const { navigation } = props;
  const [profilePicture, setProfilePicture] = useState(null);
  const [fullName, setFullName] = useState("");

  // Initialize Realtime Firebase Database
  const RealtimeDatabase = getDatabase();
  //Function to display notification badge
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const notificationsRef = ref(RealtimeDatabase, 'notifications');

    // Set up a listener for real-time updates
    const unsubscribe = onValue(notificationsRef, (snapshot) => {
      const notificationData = [];

      if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
          const notification = childSnapshot.val();
          if (!notification.read && notification.message) {
            notificationData.push(notification);
          }
        });
      }

      setUnreadCount(notificationData.length);
    });

    return () => {
      // Clean up the listener when the component is unmounted
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      const auth = getAuth();
      const user = auth.currentUser;

      if (user) {
        // Query Firestore to get user data based on email
        const q = query(collection(db, 'users'), where('email', '==', user.email));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const docRef = doc(db, 'users', querySnapshot.docs[0].id);

          // Use onSnapshot to listen for changes to the document
          const unsubscribe = onSnapshot(docRef, (doc) => {
            if (doc.exists()) {
              const userData = doc.data();
              setFullName(userData.fullName); // Set the fullname from Firestore
            }
          });

          // Clean up the listener when the component unmounts
          return () => unsubscribe();
        }
      }
    };

    fetchUserData();
  }, []);


  useEffect(() => {
    const fetchUserData = async () => {
      const auth = getAuth();
      const user = auth.currentUser;

      if (user) {
        // Query Firestore to get user data based on email
        const q = query(collection(db, 'users'), where('email', '==', user.email));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const docRef = doc(db, 'users', querySnapshot.docs[0].id);

          // Use onSnapshot to listen for changes to the document
          const unsubscribe = onSnapshot(docRef, (doc) => {
            if (doc.exists()) {
              const userData = doc.data();
              setProfilePicture(userData.profilePicture); // Set the profile picture from Firestore
            }
          });

          // Clean up the listener when the component unmounts
          return () => unsubscribe();
        }
      }
    };

    fetchUserData();
  }, []);
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#CF0A0A',
        marginHorizontal: 0.5,
        marginTop: 30,
        height: 80,
        elevation: 20,
        paddingVertical: 20,
        shadowColor: 'black',
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 6,
        shadowOpacity: 0.3,
        borderBottomRightRadius: 10,
        borderBottomLeftRadius: 10,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity onPress={() => navigation.navigate('Menu')}>
          {profilePicture ? (
            <Image
              source={{ uri: profilePicture }}
              style={{ width: 50, height: 50, borderRadius: 50, marginLeft: 15 }}
            />
          ) : (
            <Image
              source={icons.profilePicWhite}
              style={{ width: 50, height: 50, marginLeft: 10 }}
            />
          )}
        </TouchableOpacity>
        <Text style={{ fontSize: 20, color: 'white', fontWeight: '600', marginLeft: 10 }}>{fullName}</Text>
      </View>
      <View>
        <TouchableOpacity onPress={() => {
          navigation.navigate('NotificationScreen');
        }}>
          <Ionicons style={{
            position: 'absolute',
            right: 20,
            top: -14,

          }}
            name="notifications-outline"
            size={30}
            color='white'
          />

          {unreadCount > 0 && (
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>{unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  )
}
const styles = StyleSheet.create({
  notificationBadge: {
    position: 'absolute',
    top: 0,
    right: 12,
    backgroundColor: 'white',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText: {
    color: 'red',
    fontSize: 12,
  },
});

export default HeaderUsers;
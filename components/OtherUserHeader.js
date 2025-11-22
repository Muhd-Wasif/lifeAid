import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { COLORS, } from '../constants';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons'
import { getDatabase, ref, onValue, update, get } from "firebase/database";

const OtherUserHeader = (props) => {
  const { navigation } = props;
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
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#CF0A0A',
        marginHorizontal: 0.5,
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
      <TouchableOpacity style={{ marginLeft: 15 }}
        onPress={() => navigation.navigate("Menu")}>
        <MaterialCommunityIcons
          name="view-dashboard"
          size={30}
          color={COLORS.secondaryWhite}
        />
      </TouchableOpacity>
      <View>


        <TouchableOpacity onPress={() => {
          props.navigation.navigate('NotificationScreen');
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

export default OtherUserHeader;
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { getDatabase, onValue, ref } from 'firebase/database';

import { COLORS } from '../constants';
import { db } from '../config';
import { isNotificationVisibleForUser } from '../utils/notificationUtils';

const NotificationBell = ({
  navigation,
  iconColor = 'white',
  style,
  iconSize = 26,
  isAdmin = false,
}) => {
  const [userProfile, setUserProfile] = useState({ isAdmin });
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setUserProfile({ isAdmin });
        return;
      }

      try {
        const usersRef = collection(db, 'users');
        let userSnapshot = await getDocs(query(usersRef, where('uid', '==', user.uid)));

        if (userSnapshot.empty && user.email) {
          userSnapshot = await getDocs(query(usersRef, where('email', '==', user.email)));
        }

        const userData = userSnapshot.empty ? {} : userSnapshot.docs[0].data();
        setUserProfile({
          uid: user.uid,
          email: user.email,
          bloodGroup: userData.bloodGroup || null,
          userType: userData.userType || null,
          isAdmin: isAdmin || Boolean(userData.isAdmin),
        });
      } catch (error) {
        console.error('Error loading notification profile:', error);
        setUserProfile({ uid: user.uid, email: user.email, isAdmin });
      }
    });

    return () => unsubscribe();
  }, [isAdmin]);

  useEffect(() => {
    const database = getDatabase();
    const notificationsRef = ref(database, 'notifications');

    const unsubscribe = onValue(notificationsRef, (snapshot) => {
      let count = 0;

      if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
          const notification = childSnapshot.val();
          if (!notification.read && isNotificationVisibleForUser(notification, userProfile)) {
            count += 1;
          }
        });
      }

      setUnreadCount(count);
    });

    return () => unsubscribe();
  }, [userProfile]);

  const handlePress = () => {
    try {
      navigation?.navigate?.('NotificationScreen');
    } catch (error) {
      navigation?.getParent?.()?.navigate?.('NotificationScreen');
    }
  };

  return (
    <TouchableOpacity
      style={[styles.bell, style]}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel="Notifications"
    >
      <Ionicons name="notifications-outline" size={iconSize} color={iconColor} />
      {unreadCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  bell: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: 3,
    right: 3,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: COLORS.primaryRed,
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default NotificationBell;

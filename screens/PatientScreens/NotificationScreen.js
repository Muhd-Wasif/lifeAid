import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Image, Button, TouchableOpacity } from 'react-native';
import { onValue, update, getDatabase } from 'firebase/database';
import { COLORS } from '../../constants/themes';
import { icons } from '../../constants';
import { ref as Sref } from 'firebase/database';
import BackArrow from '../../components/BackArrow';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../config';
import { isNotificationVisibleForUser, sortNotifications } from '../../utils/notificationUtils';

const NotificationScreen = ({ navigation }) => {
    // Initialize Realtime Firebase Database
    const RealtimeDatabase = getDatabase();
    const auth = getAuth();

    const [notifications, setNotifications] = useState([]);
    const [userProfile, setUserProfile] = useState(null);

    // Get current user's blood group
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) {
                setUserProfile({ isAdmin: false });
                return;
            }

            try {
                const usersRef = collection(db, 'users');
                let userSnapshot = await getDocs(query(usersRef, where('uid', '==', user.uid)));

                if (userSnapshot.empty && user.email) {
                    userSnapshot = await getDocs(query(usersRef, where('email', '==', user.email)));
                }

                if (!userSnapshot.empty) {
                    const userDoc = userSnapshot.docs[0];
                    const userData = userDoc.data();
                    console.log('NotificationScreen userData:', userData);
                    setUserProfile({
                        uid: user.uid,
                        email: user.email,
                        bloodGroup: userData.bloodGroup || null,
                        userType: userData.userType || null,
                        isAdmin: Boolean(userData.isAdmin),
                    });
                } else {
                    setUserProfile({ uid: user.uid, email: user.email, isAdmin: false });
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        });

        return () => unsubscribe();
    }, []);

    //FUnction to fetch notifications
    useEffect(() => {
        const fetchNotifications = () => {
            try {
                const notificationsRef = Sref(RealtimeDatabase, 'notifications');

                const unsubscribe = onValue(notificationsRef, (snapshot) => {
                    const notificationData = [];

                    if (snapshot.exists()) {
                        const notifications = snapshot.val();

                        for (const key in notifications) {
                            const notification = notifications[key];
                            if (notification.message && notification.message.trim() !== '') {
                                const shouldShow = isNotificationVisibleForUser(notification, userProfile);

                                if (notification.requestId && !shouldShow) {
                                    console.log('Skipping request notification for user:', auth.currentUser?.uid, 'bloodGroup:', userProfile?.bloodGroup, 'notification:', notification);
                                }

                                if (shouldShow) {
                                    notificationData.push({ id: key, ...notification });
                                }
                            }
                        }

                        notificationData.splice(0, notificationData.length, ...sortNotifications(notificationData));
                    }

                    setNotifications(notificationData);
                });

                return () => unsubscribe(); // Return the unsubscribe function
            } catch (error) {
                console.error('Error fetching notifications:', error);
            }
        };

        if (userProfile) {
            const unsubscribe = fetchNotifications();
            return () => unsubscribe();
        }
    }, [userProfile]);
    //Mark Notification as Read
    const markAllNotificationsAsRead = async () => {
        try {
            const updates = {};
            notifications.forEach((notification) => {
                updates[`notifications/${notification.id}/read`] = true;
            });

            await update(Sref(RealtimeDatabase), updates);
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    useEffect(() => {
        if (!notifications.some((notification) => !notification.read)) {
            return;
        }

        markAllNotificationsAsRead();
    }, [notifications]);



    //To show the time at which the notification was sent
    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        const hours = date.getHours() > 12 ? (date.getHours() - 12).toString().padStart(2, '0') : date.getHours().toString().padStart(2, '0');
        const ampm = date.getHours() >= 12 ? 'PM' : 'AM';
        const minutes = date.getMinutes().toString().padStart(2, '0');

        return `${day}/${month}/${year} ${hours}:${minutes} ${ampm}`;
    };



    //To display Notifications
    const renderItem = ({ item }) => {
        const handleNotificationPress = () => {
            if (item.requestId) {
                navigation.navigate('RequestDetailScreen', { requestId: item.requestId });
            }
        };

        return (
            <TouchableOpacity
                style={styles.notificationContainer}
                onPress={handleNotificationPress}
                disabled={!item.requestId}
            >
                <View style={{ flexDirection: 'row' }}>
                    <Image source={icons.notificationIcon} style={styles.bellicon} />
                    <Text style={styles.notificationMsg}>{item.message}</Text>
                </View>

                <Text style={styles.time}>sent at: {formatTimestamp(item.timestamp)}</Text>
                {item.requestId && (
                    <Text style={styles.tapToView}>Tap to view request →</Text>
                )}
            </TouchableOpacity>
        );
    };

    // Function to check if there are any unread notifications
    const hasUnreadNotifications = notifications.some(notification => !notification.read);
    return (
        <View style={{ marginLeft: 10, marginRight: 10, marginTop: 20, }}>
            <BackArrow navigation={navigation} style={styles.backArrow} />

            {hasUnreadNotifications && (
                <Button
                    title='Clear All Notifications'
                    onPress={markAllNotificationsAsRead}
                    color='#CF0A0A' />
            )}

            {notifications.length > 0 ? (
                <FlatList
                    data={notifications}
                    renderItem={renderItem}
                    keyExtractor={(item, index) => index.toString()}
                />
            ) : (
                <Text style={{ alignSelf: 'center', fontSize: 18 }}>No new notifications...🦗</Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    notificationContainer: {
        elevation: 8,
        shadowColor: 'black',
        shadowOffset: { width: 0, height: 1 },
        shadowRadius: 2,
        shadowOpacity: 0.3,
        padding: 20,
        borderRadius: 10,
        backgroundColor: 'white',
        marginBottom: 15,
        marginRight: 10,
        marginLeft: 10,
        marginTop: 10
    },
    time: {
        alignSelf: 'flex-end',
        fontSize: 12,
        color: 'grey',
        marginBottom: -5,
        marginTop: 10
    },
    tapToView: {
        alignSelf: 'flex-end',
        fontSize: 11,
        color: COLORS.primaryRed,
        marginTop: 8,
        fontWeight: '600'
    },
    notificationMsg: {
        marginLeft: 15,
        fontSize: 15,
        marginRight: 20
    },
    bellicon: {
        marginTop: 2,
        height: 27,
        width: 27
    },
    backArrow: {
        marginBottom: 16,
    }
});
export default NotificationScreen;

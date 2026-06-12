import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Image, Button, TouchableOpacity } from 'react-native';
import { onValue, update, getDatabase } from 'firebase/database';
import { COLORS, icons } from '../../constants';
import { ref as Sref } from 'firebase/database';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../config';
import { Ionicons as Icon } from '@expo/vector-icons';
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

    //Function to fetch notifications
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
                    <View style={{ flex: 1, marginLeft: 15 }}>
                        <Text style={styles.notificationMsg}>{item.message}</Text>
                        {item.requestId && (
                            <View style={styles.tagContainer}>
                                <Icon name="tap" size={12} color={COLORS.primaryRed} />
                                <Text style={styles.tagText}>Tap to view request</Text>
                            </View>
                        )}
                    </View>
                </View>

                <Text style={styles.time}>sent at: {formatTimestamp(item.timestamp)}</Text>
            </TouchableOpacity>
        );
    };

    // Function to check if there are any unread notifications
    const hasUnreadNotifications = notifications.some(notification => !notification.read);
    return (
        <View style={styles.container}>
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
                    contentContainerStyle={styles.listContent}
                />
            ) : (
                <Text style={styles.emptyText}>No new notifications...🦗</Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        paddingHorizontal: 10,
    },
    listContent: {
        paddingBottom: 20,
    },
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
    notificationMsg: {
        fontSize: 15,
        marginRight: 20,
        fontWeight: '500',
    },
    bellicon: {
        marginTop: 2,
        height: 27,
        width: 27
    },
    tagContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        gap: 4,
    },
    tagText: {
        fontSize: 11,
        color: COLORS.primaryRed,
        fontWeight: '600',
    },
    emptyText: {
        alignSelf: 'center',
        fontSize: 18,
        marginTop: 40,
    }
});
export default NotificationScreen;







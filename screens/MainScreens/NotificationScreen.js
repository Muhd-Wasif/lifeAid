import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity, Button } from 'react-native';
import { ref, onValue, update, getDatabase, set } from 'firebase/database';
import { COLORS, icons } from '../../constants';
import { ref as Sref } from 'firebase/database';

const NotificationScreen = () => {
    // Initialize Realtime Firebase Database
    const RealtimeDatabase = getDatabase();

    const [notifications, setNotifications] = useState([]);
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
                            if (notifications[key].message && notifications[key].message.trim() !== '') {
                                notificationData.push(notifications[key]);
                            }
                        }
                    }

                    setNotifications(notificationData);
                });

                return () => unsubscribe(); // Return the unsubscribe function
            } catch (error) {
                console.error('Error fetching notifications:', error);
            }
        };

        const unsubscribe = fetchNotifications();

        return () => unsubscribe(); // Cleanup listener on component unmount
    }, []);
    //Mark Notification as Read
    const markNotificationAsRead = async (notificationId) => {
        try {
            const notificationsRef = Sref(RealtimeDatabase, 'notifications', notificationId);

            await set(notificationsRef, { ...notifications[notificationId], read: true });
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };



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
    const renderItem = ({ item }) => (
        <View style={styles.notificationContainer}>
            <View style={{ flexDirection: 'row' }}>
                <Image source={icons.notificationIcon} style={styles.bellicon} />
                <Text style={styles.notificationMsg}>{item.message}</Text>
            </View>

            <Text style={styles.time}>sent at: {formatTimestamp(item.timestamp)}</Text>
        </View>
    );

    // Function to check if there are any unread notifications
    const hasUnreadNotifications = notifications.some(notification => !notification.read);
    return (
        <View style={{ marginLeft: 10, marginRight: 10, marginTop: 20, }}>
            {hasUnreadNotifications && (
                <Button
                    title='Clear All Notifications'
                    onPress={markNotificationAsRead}
                    color='#CF0A0A'/>
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
    notificationMsg: {
        marginLeft: 15,
        fontSize: 15,
        marginRight: 20
    },
    bellicon: {
        marginTop: 2,
        height: 27,
        width: 27
    }
});
export default NotificationScreen;
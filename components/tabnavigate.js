import * as React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, RequestPage, EventPage, MapPage, Invite, About, Menu, Settings, NotificationScreen } from "../screens/PatientScreens";
import { icons } from '../constants';
import TabBarIcons from '../constants/TabBarIcons';
import { collection, doc, getDocs, onSnapshot, query, where } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '../config';
import { useState, useEffect } from 'react';

const Tab = createBottomTabNavigator();

function Bottomtab({ navigation }) {
    const [profilePicture, setProfilePicture] = useState(null);

    useEffect(() => {
        const fetchUserData = async () => {
            const auth = getAuth();
            const user = auth.currentUser;

            if (user) {
                // Query Firestore to get user data based on uid
                const q = query(collection(db, 'users'), where('uid', '==', user.uid));
                const querySnapshot = await getDocs(q);

                if (!querySnapshot.empty) {
                    const docRef = doc(db, 'users', querySnapshot.docs[0].id);

                    const unsubscribe = onSnapshot(docRef, (doc) => {
                        if (doc.exists()) {
                            const userData = doc.data();
                            setProfilePicture(userData.profilePicture);
                        }
                    });

                    return () => unsubscribe();
                }
            }
        };

        fetchUserData();
    }, []);

    return (
        <Tab.Navigator
            initialRouteName='Home'
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused }) => {
                    let icon;

                    if (route.name === 'Home') {
                        icon = focused ? icons.home : icons.home;
                    } else if (route.name === 'RequestPage') {
                        icon = focused ? icons.requsetIcon : icons.requsetIcon;
                    } else if (route.name === 'EventPage') {
                        icon = focused ? icons.eventIcon : icons.eventIcon;
                    } else if (route.name === 'MapPage') {
                        icon = focused ? icons.mapWhite : icons.mapWhite;
                    } else if (route.name === 'Invite') {
                        icon = focused ? icons.shareIcon : icons.shareIcon;
                    } else if (route.name === 'About') {
                        icon = focused ? icons.infoIcon : icons.infoIcon;
                    } else if (route.name === 'Menu') {
                        icon = focused ? icons.menuIcon : icons.menuIcon;
                    } else if (route.name === 'Settings') {
                        icon = focused ? icons.settingsIcon : icons.settingsIcon;
                    } else if (route.name === 'NotificationScreen') {
                        icon = focused ? icons.notificationIcon : icons.notificationIcon;
                    }

                    return <TabBarIcons focused={focused} icon={icon} />;
                },
                tabBarStyle: {
                    backgroundColor: 'white',
                    elevation: 20,
                    shadowColor: 'black',
                    shadowOpacity: 0.4,
                    shadowRadius: 4,
                    shadowOffset: 50,
                    borderTopWidth: 0.6,
                    borderTopColor: 'grey',
                    height: 110
                },
                tabBarActiveTintColor: '#CF0A0A',
                tabBarInactiveTintColor: '#000',
                tabBarIconStyle: { marginBottom: -8 },
                tabBarLabelStyle: {
                    marginBottom: 10,
                    marginTop: 10,
                    color: 'black',
                    fontWeight: 'bold',
                    fontSize: 11.5,
                }
            })}
        >
            <Tab.Screen name="Home" component={Home}
                options={{
                    title: 'Home',
                    headerShown: false
                }} />
            <Tab.Screen name="RequestPage" component={RequestPage}
                options={{
                    title: 'Request',
                    headerShown: false
                }} />
            <Tab.Screen name="EventPage" component={EventPage}
                options={{
                    title: 'Events',
                    headerShown: false
                }} />
            <Tab.Screen name="MapPage" component={MapPage}
                options={{
                    title: 'Maps',
                    headerShown: false
                }} />
            
            
        </Tab.Navigator>
    );
}

export default Bottomtab;

import * as React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, DonorPage, EventPage, MapPage } from "../screens/DonorScreens";
import { icons } from '../constants';
import TabBarIcons from '../constants/TabBarIcons';

const Tab = createBottomTabNavigator();

function DonorTab() {
    return (
        <Tab.Navigator
            initialRouteName='Home'
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused }) => {
                    let icon;

                    if (route.name === 'Home') {
                        icon = focused ? icons.home : icons.home;
                    } else if (route.name === 'DonorPage') {
                        icon = focused ? icons.donorIcon : icons.donorIcon;
                    } else if (route.name === 'EventPage') {
                        icon = focused ? icons.eventIcon : icons.eventIcon;
                    } else if (route.name === 'MapPage') {
                        icon = focused ? icons.mapWhite : icons.mapWhite;
                    }

                    return <TabBarIcons focused={focused} icon={icon} />;
                },
                tabBarStyle: { display: 'none' },
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
            <Tab.Screen name="Home" component={Home} options={{
                title: 'Home',
                headerShown: false
            }} />

            <Tab.Screen name="DonorPage" component={DonorPage}
                options={{
                    title: 'Donor',
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

export default DonorTab;







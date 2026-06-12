import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DoctorHome from '../../screens/DoctorScreens/DoctorHome';
import DoctorAppointmentList from '../../screens/DoctorScreens/DoctorAppointmentList';

const Stack = createNativeStackNavigator();

export default function DoctorStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="DoctorHome" component={DoctorHome} />
            <Stack.Screen name="DoctorAppointmentList" component={DoctorAppointmentList} />
        </Stack.Navigator>
    );
}

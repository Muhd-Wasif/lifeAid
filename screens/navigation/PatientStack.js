import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Home from "../../screens/PatientScreens/Home";
import BookAppointmentScreen from "../../screens/PatientScreens/BookAppointmentScreen";
import AppointmentFormScreen from "../../screens/PatientScreens/AppointmentFormScreen";
import MyAppointmentsScreen from "../../screens/PatientScreens/MyAppointmentsScreen";
import RequestPage from "../../screens/PatientScreens/RequestPage";
import EventPage from "../../screens/PatientScreens/EventPage";
import MapPage from "../../screens/PatientScreens/MapPage";
import Menu from "../../screens/PatientScreens/Menu";
import About from "../../screens/PatientScreens/About";
import Invite from "../../screens/PatientScreens/Invite";
import Settings from "../../screens/PatientScreens/Settings";
import ChatScreen from "../../screens/PatientScreens/ChatScreen";
import NotificationScreen from "../../screens/PatientScreens/NotificationScreen";
import RequestDetailScreen from "../../screens/PatientScreens/RequestDetailScreen";
import ViewReports from "../../screens/Reports/ViewReports";


const Stack = createNativeStackNavigator();

export default function PatientStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={Home} />
      <Stack.Screen name="BookAppointment" component={BookAppointmentScreen} />
      <Stack.Screen name="AppointmentFormScreen" component={AppointmentFormScreen} />
      <Stack.Screen name="MyAppointments" component={MyAppointmentsScreen} />
      <Stack.Screen name="ViewReports" component={ViewReports} />
      <Stack.Screen name="Chat" component={ChatScreen} />
      <Stack.Screen name="NotificationScreen" component={NotificationScreen} />
      <Stack.Screen name="RequestDetailScreen" component={RequestDetailScreen} />
      <Stack.Screen name="RequestPage" component={RequestPage}
        options={{
          title: 'Request',
          headerShown: false
        }} />
      <Stack.Screen name="EventPage" component={EventPage}
        options={{
          title: 'Events',
          headerShown: false
        }} />
      <Stack.Screen name="MapPage" component={MapPage}
        options={{
          title: 'Maps',
          headerShown: false
        }} />

      <Stack.Screen name="Menu" component={Menu}
        options={{
          title: 'Menu',
          headerShown: false
        }} />

      <Stack.Screen name="About" component={About}
        options={{
          title: 'About',
          headerShown: false
        }} />
      <Stack.Screen name="Invite" component={Invite}
        options={{
          title: 'Invite',
          headerShown: false
        }} />
      <Stack.Screen name="Settings" component={Settings}
        options={{
          title: 'Settings',
          headerShown: false
        }} />
    </Stack.Navigator>
  );
}

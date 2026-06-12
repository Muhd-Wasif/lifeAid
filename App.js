import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useCallback } from "react";
import DonorTab from "./components/donorTabnavigate";
import PatientStack from "./screens/navigation/PatientStack";
import DoctorStack from "./screens/navigation/DoctorStack";
import ViewReports from "./screens/Reports/ViewReports";

import {
  GetStarted,
  Signin,
  Signup,
  ResetPassword,
} from "./screens/AuthenticationScreens";

import {
  MassRequest,
  ManageRequest,
  ManageEvents,
  PatientInfo,
  RegisteredUsers,
  ViewUserInfo,
  Inventory,
  AdminDashboard,
  AddPatient,
  ModifyPatient,
  ViewPatient,
  EditEvent,
  UpdateInventory,
  AddInventoryItem,
  AddQuantityForm,
  SubtractQuantityForm,
  ViewInventoryDetails,
  BloodTypeList,
  DonorDetails,
  DonorNames,
  UploadReports,
  ManageDoctors,
  ManageAppointments,
} from "./screens/AdminScreens"

import { About, Invite, Menu, Settings, NotificationScreen, DonationHistory, DonationRequests, ChatScreen as DonorChatScreen } from "./screens/DonorScreens";
import RequestDetailScreen from "./screens/PatientScreens/RequestDetailScreen";


SplashScreen.preventAutoHideAsync();

const Stack = createNativeStackNavigator();

const App = () => {
  const [fontLoaded] = useFonts({
    HeeboRegular: require("./assets/fonts/Heebo-Regular.ttf"),
    PoppinBold: require("./assets/fonts/Poppins-Bold.ttf"),
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontLoaded]);
  if (!fontLoaded) {
    return null;
  }

  return (

    <NavigationContainer onReady={onLayoutRootView} initialRouteName="GetStarted">

      <Stack.Navigator>

        <Stack.Screen
          name="GetStarted"
          component={GetStarted}
          options={{ headerShown: false }} />
        <Stack.Screen
          name="Signin"
          component={Signin}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Signup"
          component={Signup}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ResetPassword"
          component={ResetPassword}
          options={{ headerShown: false }} />

        <Stack.Screen name="Patient" component={PatientStack} options={{ headerShown: false }} />
        <Stack.Screen name="donorTabnavigate" component={DonorTab} options={{ headerShown: false }} />

        <Stack.Screen name='Menu' component={Menu}
          options={{
            headerShown: false,
          }} />
        <Stack.Screen name='Invite' component={Invite}
          options={{
            title: 'Invite',
            headerStyle: { backgroundColor: '#CF0A0A' },
            headerTitleStyle: { color: 'white' },
            headerTintColor: 'white'
          }} />
        <Stack.Screen name='About' component={About}
          options={{
            title: 'About',
            headerStyle: { backgroundColor: '#CF0A0A' },
            headerTitleStyle: { color: 'white' },
            headerTintColor: 'white'
          }} />
        <Stack.Screen name='Settings' component={Settings}
          options={{
            title: 'Settings',
            headerStyle: { backgroundColor: '#CF0A0A' },
            headerTitleStyle: { color: 'white' },
            headerTintColor: 'white'
          }} />
        <Stack.Screen name='DonationRequests' component={DonationRequests}
          options={{
            title: 'Donation Requests',
            headerStyle: { backgroundColor: '#CF0A0A' },
            headerTitleStyle: { color: 'white' },
            headerTintColor: 'white'
          }} />
        <Stack.Screen name='DonationHistory' component={DonationHistory}
          options={{
            title: 'Donation History',
            headerStyle: { backgroundColor: '#CF0A0A' },
            headerTitleStyle: { color: 'white' },
            headerTintColor: 'white'
          }} />
        <Stack.Screen name='DonorChat' component={DonorChatScreen}
          options={{
            headerShown: false,
          }} />
        <Stack.Screen name='ViewReports' component={ViewReports}
          options={{
            headerShown: false,
          }} />
        <Stack.Screen name='RequestDetailScreen' component={RequestDetailScreen}
          options={{
            title: 'Request Details',
            headerStyle: { backgroundColor: '#CF0A0A' },
            headerTitleStyle: { color: 'white' },
            headerTintColor: 'white',
            headerShown: false
          }} />


        <Stack.Screen
          name="AdminDashboard"
          component={AdminDashboard}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="MassRequest"
          component={MassRequest}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="ManageRequest"
          component={ManageRequest}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="ManageEvents"
          component={ManageEvents}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="EditEvent"
          component={EditEvent}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="RegisteredUsers"
          component={RegisteredUsers}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="ViewUserInfo"
          component={ViewUserInfo}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="PatientInfo"
          component={PatientInfo}
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="ModifyPatient"
          component={ModifyPatient}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="AddPatient"
          component={AddPatient}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="ViewPatient"
          component={ViewPatient}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="ManageDoctors"
          component={ManageDoctors}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="ManageAppointments"
          component={ManageAppointments}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="Doctor"
          component={DoctorStack}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="BloodTypeList"
          component={BloodTypeList}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="DonorDetails"
          component={DonorDetails}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="DonorNames"
          component={DonorNames}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="UploadReports"
          component={UploadReports}
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="Inventory"
          component={Inventory}
          options={{
            title: 'Inventory List',
            headerStyle: {
              backgroundColor: '#CF0A0A',
            },
            headerTitleStyle: { color: 'white', },
            headerTintColor: 'white'
          }}
        />
        <Stack.Screen
          name="UpdateInventory"
          component={UpdateInventory}
          options={{
            title: 'Update Inventory',
            headerStyle: {
              backgroundColor: '#CF0A0A',
            },
            headerTitleStyle: { color: 'white', },
            headerTintColor: 'white'
          }}
        />
        <Stack.Screen
          name="AddInventoryItem"
          component={AddInventoryItem}
          options={{
            title: 'Add Inventory Item',
            headerStyle: {
              backgroundColor: '#CF0A0A',
            },
            headerTitleStyle: { color: 'white', },
            headerTintColor: 'white'
          }}
        />
        <Stack.Screen
          name="AddQuantityForm"
          component={AddQuantityForm}
          options={{
            title: 'Add Quantity',
            headerStyle: {
              backgroundColor: '#CF0A0A',
            },
            headerTitleStyle: { color: 'white', },
            headerTintColor: 'white'
          }}
        />
        <Stack.Screen
          name="SubtractQuantityForm"
          component={SubtractQuantityForm}
          options={{
            title: 'Subtract Quantity',
            headerStyle: {
              backgroundColor: '#CF0A0A',
            },
            headerTitleStyle: { color: 'white', },
            headerTintColor: 'white'
          }} />
        <Stack.Screen name='NotificationScreen' component={NotificationScreen}
          options={{
            title: 'Notifications',
            headerStyle: { backgroundColor: '#CF0A0A' },
            headerTitleStyle: { color: 'white' },
            headerTintColor: 'white'
          }} />



      </Stack.Navigator>


    </NavigationContainer>
  );
};

export default App;

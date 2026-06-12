import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../PatientScreens/Home';
import { Ionicons as Icon } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

export default function BottomTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Icon name="home" size={22} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

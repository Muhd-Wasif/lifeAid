import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { COLORS } from '../constants/themes';

const patientMenuItems = [
  { label: 'Home', icon: 'home-outline', route: 'Home' },
  { label: 'Request', icon: 'water-outline', route: 'RequestPage' },
  { label: 'Chat', icon: 'chatbubble-ellipses-outline', route: 'Chat' },
  { label: 'Events', icon: 'calendar-outline', route: 'EventPage' },
  { label: 'Maps', icon: 'map-outline', route: 'MapPage' },
];

const PatientBottomMenu = ({ navigation, activeRoute }) => {
  const handleNavigate = (route) => {
    const parentNavigation = navigation.getParent?.();

    if (parentNavigation?.navigate) {
      parentNavigation.navigate('Patient', { screen: route });
      return;
    }

    navigation.navigate(route);
  };

  return (
    <View style={styles.bottomMenu}>
      {patientMenuItems.map((item) => {
        const isActive = activeRoute === item.route;
        const color = isActive ? COLORS.primaryRed : COLORS.black;

        return (
          <TouchableOpacity
            key={item.route}
            style={styles.bottomItem}
            onPress={() => handleNavigate(item.route)}
            activeOpacity={0.8}
          >
            <Icon name={item.icon} size={22} color={color} />
            <Text style={[styles.bottomText, isActive && styles.activeText]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  bottomMenu: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 10,
    marginHorizontal: 16,
    borderRadius: 18,
    elevation: 6,
  },
  bottomItem: {
    alignItems: 'center',
  },
  bottomText: {
    marginTop: 4,
    fontSize: 11,
    color: COLORS.black,
  },
  activeText: {
    color: COLORS.primaryRed,
  },
});

export default PatientBottomMenu;

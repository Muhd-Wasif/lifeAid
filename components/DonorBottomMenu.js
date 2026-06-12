import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { COLORS } from '../constants/themes';

const donorMenuItems = [
  { label: 'Home', icon: 'home-outline', route: 'Home' },
  { label: 'Donor', icon: 'water-outline', route: 'DonorPage' },
  { label: 'Requests', icon: 'reader-outline', route: 'DonationRequests', parent: true },
  { label: 'Events', icon: 'calendar-outline', route: 'EventPage' },
  { label: 'Chat', icon: 'chatbubble-ellipses-outline', route: 'DonorChat', parent: true },
  { label: 'Maps', icon: 'map-outline', route: 'MapPage' },
];

const DonorBottomMenu = ({ navigation, activeRoute }) => {
  const handleNavigate = (item) => {
    if (item.parent) {
      const parentNavigation = navigation.getParent?.();
      if (parentNavigation?.navigate) {
        parentNavigation.navigate(item.route);
        return;
      }
    }

    navigation.navigate(item.route);
  };

  return (
    <View style={styles.bottomMenu}>
      {donorMenuItems.map((item) => {
        const isActive = activeRoute === item.route;
        const color = isActive ? COLORS.primaryRed : COLORS.black;

        return (
          <TouchableOpacity
            key={item.route}
            style={styles.bottomItem}
            onPress={() => handleNavigate(item)}
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
    alignSelf: 'stretch',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 10,
    marginHorizontal: 16,
    borderRadius: 18,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  bottomItem: {
    alignItems: 'center',
    minWidth: 42,
  },
  bottomText: {
    marginTop: 4,
    fontSize: 10,
    color: COLORS.black,
  },
  activeText: {
    color: COLORS.primaryRed,
  },
});

export default DonorBottomMenu;

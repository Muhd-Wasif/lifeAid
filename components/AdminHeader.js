import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants';
import NotificationBell from './NotificationBell';

const AdminHeader = ({ navigation, showBack = true }) => {
  const handleBack = () => {
    if (navigation?.canGoBack?.()) {
      navigation.goBack();
      return;
    }

    navigation?.navigate?.('AdminDashboard');
  };

  return (
    <View style={styles.header}>
      {showBack ? (
        <TouchableOpacity
          style={[styles.iconButton, styles.backButton]}
          onPress={handleBack}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back-outline" size={26} color={COLORS.primaryRed} />
        </TouchableOpacity>
      ) : (
        <View style={styles.iconButton} />
      )}

      <NotificationBell
        navigation={navigation}
        isAdmin
        style={styles.iconButton}
        iconSize={26}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginHorizontal: -16,
    marginTop: -5,
    marginBottom: 14,
    backgroundColor: COLORS.primaryRed,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    elevation: 8,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    backgroundColor: 'white',
  },
});

export default AdminHeader;

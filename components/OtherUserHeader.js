import React from 'react';
import { View, StyleSheet } from 'react-native';
import BackArrow from './BackArrow';
import NotificationBell from './NotificationBell';

const OtherUserHeader = (props) => {
  const { navigation } = props;
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#CF0A0A',
        marginHorizontal: 0.5,
        marginTop: 0,
        height: 80,
        elevation: 20,
        paddingVertical: 20,
        shadowColor: 'black',
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 6,
        shadowOpacity: 0.3,
        borderBottomRightRadius: 10,
        borderBottomLeftRadius: 10,
      }}
    >
      <BackArrow navigation={navigation} style={styles.headerBackArrow} />
      <NotificationBell navigation={navigation} style={styles.headerBell} iconSize={30} />
    </View>
  )
}
const styles = StyleSheet.create({
  headerBackArrow: {
    marginLeft: 15,
    backgroundColor: 'white',
    borderRadius: 16,
  },
  headerBell: {
    marginRight: 16,
  },
});

export default OtherUserHeader;

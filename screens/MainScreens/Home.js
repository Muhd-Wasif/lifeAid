import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Image, Alert, BackHandler } from 'react-native';
import PageContainer from '../../components/PageContainer';
import { icons } from '../../constants';
import { COLORS, FONTS, SIZES } from "../../constants/themes";
import HeaderUsers from '../../components/HeaderUsers';
import { useNavigation } from '@react-navigation/native';

const Home = () => {
  const navigation = useNavigation();
  useEffect(() => {
    const backAction = () => {
      Alert.alert(
        'Exit App',
        'Are you sure you want to exit?',
        [
          {
            text: 'Cancel',
            onPress: () => null, // Do nothing when cancel is pressed
            style: 'cancel',
          },
          { text: 'OK', onPress: () => BackHandler.exitApp() },
        ],
        { cancelable: false }
      );

      return true; // Prevent default behavior (exit the app)
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, []);


  return (

    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <HeaderUsers navigation={navigation} />
        <View style={styles.container}>
          <View style={{
            marginLeft: 15,
            marginRight: 15,
            marginTop: 20
          }}>

            <View style={styles.blocks}>
              <Text style={styles.text}>Quote of the Day</Text>
              <Text style={styles.quote}>Saving lives brings inner peace.</Text>
            </View>



            <View style={styles.blocks}>
              <View style={{ flexDirection: 'row' }}>
                <Image source={icons.requestIconRed} style={{ height: 35, width: 35 }} />
                <Text style={styles.text2}>Create a Request</Text>
              </View>
              <Text style={styles.text3}>Ask for blood in emergency situation.</Text>
              <TouchableOpacity onPress={() => navigation.navigate("RequestPage")}>
                <View style={{ alignItems: 'flex-end', justifyContent: 'flex-end', flexDirection: 'row' }}>
                  <Text style={{ color: COLORS.primaryRed, fontWeight: 'bold' }}>Request</Text>
                  <Image source={icons.rightArrowRed} style={{ height: 16, width: 14, marginLeft: 5 }} />
                </View>
              </TouchableOpacity>
            </View>

            <View style={styles.blocks}>
              <View style={{ flexDirection: 'row', paddingBottom: 2 }}>
                <Image source={icons.shareIcon} style={{ height: 35, width: 35 }} />
                <Text style={styles.text2}>Invite Friends</Text>
              </View>
              <Text style={styles.text3}>Inviting People can bring a change, someone in your friends & family would be able to help.</Text>
              <TouchableOpacity onPress={() => navigation.navigate("Invite")}>
                <View style={{ alignItems: 'flex-end', justifyContent: 'flex-end', flexDirection: 'row' }}>
                  <Text style={{ color: COLORS.primaryRed, fontWeight: 'bold' }}>Invite</Text>
                  <Image source={icons.rightArrowRed} style={{ height: 16, width: 14, marginLeft: 5 }} />
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'white',
  },
  blocks: {
    elevation: 10,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    shadowOpacity: 0.3,
    padding: 25,
    borderRadius: 10,
    backgroundColor: 'white',
    marginTop: 15,

  },

  image: {
    width: 100,
    height: 100,
  },
  text: {
    fontSize: 40,
    fontWeight: 'bold',
    color: COLORS.primaryRed,
    textAlign: 'center',
    paddingBottom: 15
  },
  text2: {
    fontSize: 23,
    fontWeight: 'bold',
    color: COLORS.primaryRed,
    paddingBottom: 3,
    marginLeft: 15
  },
  text3: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.black,
    paddingBottom: 19,
    marginLeft: 51
  },
  quote: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.black,
    textAlign: 'center'
  }
});

export default Home;

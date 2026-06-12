import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  BackHandler,
  ActivityIndicator,
} from 'react-native';

import { getAuth, signOut } from 'firebase/auth';
import { collection, doc, getDocs, onSnapshot, query, where } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons as Icon } from "@expo/vector-icons";

import Button from "../../components/Button";
import LoadingModal from '../../components/LoadingModel';

import { icons } from '../../constants';
import images from "../../constants/images";
import { COLORS } from "../../constants/themes";
import { db } from '../../config';

const Menu = () => {
  const navigation = useNavigation();

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        navigation.goBack();
        return true;
      }
    );
    return () => backHandler.remove();
  }, [navigation]);

  const [isLoading, setIsLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);
  const [fullName, setFullName] = useState("");
  const [profilePicture, setProfilePicture] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const auth = getAuth();
      const user = auth.currentUser;

      if (user) {
        const q = query(
          collection(db, 'users'),
          where('email', '==', user.email)
        );

        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const docRef = doc(db, 'users', querySnapshot.docs[0].id);

          const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
              const userData = docSnap.data();
              setFullName(userData.fullName);
              setProfilePicture(userData.profilePicture);
            }
            setIsLoading(false);
          });

          return () => unsubscribe();
        }
      }
    };

    fetchUserData();
  }, []);

  const handleSignOut = () => {
    setSigningOut(true);

    setTimeout(() => {
      const auth = getAuth();
      signOut(auth)
        .then(() => {
          AsyncStorage.multiRemove(['email', 'password', 'user']);
          navigation.navigate("Signin");
        })
        .catch(console.error)
        .finally(() => setSigningOut(false));
    }, 3000);
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.backArrow}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back-outline" size={28} color={COLORS.primaryRed} />
        </TouchableOpacity>

        <LoadingModal visible={isLoading} />

        <View style={styles.profileContainer}>
          <Image
            source={profilePicture ? { uri: profilePicture } : icons.profilePicWhite}
            style={styles.profileImage}
          />
          <Text style={styles.name}>{fullName}</Text>
        </View>

        <View style={styles.menuWrapper}>
          <TouchableOpacity
            style={styles.blocks}
            onPress={() => navigation.navigate("Settings")}
          >
            <Text style={styles.menuText}>Personal Info</Text>
            <Image source={icons.rightArrowBlack} style={styles.icon} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.blocks}
            onPress={() => navigation.navigate("About")}
          >
            <Text style={styles.menuText}>About</Text>
            <Image source={icons.rightArrowBlack} style={styles.icon} />
          </TouchableOpacity>
        </View>

        {signingOut ? (
          <ActivityIndicator size="large" color={COLORS.primaryRed} />
        ) : (
          <Button title="Sign Out" onPress={handleSignOut} />
        )}

        <View style={styles.bottomDesignWrap}>
          <Image source={images.BottomDesign} style={styles.bottom} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
    paddingTop: 20,
  },

  backArrow: {
    marginLeft: 16,
    marginTop: 10,
  },

  profileContainer: {
    alignItems: "center",
    marginTop: 40,
  },

  profileImage: {
    height: 95,
    width: 95,
    borderRadius: 50,
  },

  name: {
    fontSize: 20,
    marginTop: 15,
  },

  menuWrapper: {
    marginHorizontal: 40,
    marginTop: 60,
  },

  blocks: {
    elevation: 10,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    shadowOpacity: 0.3,
    padding: 15,
    borderRadius: 10,
    backgroundColor: 'white',
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  menuText: {
    fontSize: 20,
  },

  icon: {
    height: 16,
    width: 10,
  },



  bottom: {
    width: "100%",
    aspectRatio: 905 / 379,
    resizeMode: "contain",
    alignSelf: "center",
    
  },
  bottomDesignWrap: {
    marginTop: "auto",
    width: "100%",
    maxHeight: 180,
    overflow: "hidden",
    justifyContent: "flex-end",
  },
});

export default Menu;

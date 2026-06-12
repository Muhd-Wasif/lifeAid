import {
  View,
  Text,
  SafeAreaView,
  Image,
  StyleSheet,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Alert,
  BackHandler,
} from "react-native";
import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import images from "../../constants/images";
import { COLORS, FONTS } from "../../constants/themes";
import PageContainer from "../../components/PageContainer";
import Input from "../../components/Input";
import RememberMeCheckbox from "../../components/RememberMeCheckbox";

import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../config';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';



const Signin = () => {
  const navigation = useNavigation();

  useEffect(() => {
    const backAction = () => {
      Alert.alert(
        'Exit App',
        'Are you sure you want to exit?',
        [
          { text: 'Cancel', onPress: () => null, style: 'cancel' },
          { text: 'OK', onPress: () => BackHandler.exitApp() },
        ],
        { cancelable: false }
      );

      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, []);

  useEffect(() => {
    const getData = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        const storedEmail = await AsyncStorage.getItem('email');
        const storedPassword = await AsyncStorage.getItem('password');

        if (storedUser && storedEmail !== null && storedPassword !== null) {
          setEmail(storedEmail);
          setPassword(storedPassword);
        } else {
          await AsyncStorage.multiRemove(['email', 'password']);
          setEmail('');
          setPassword('');
        }
      } catch (e) {
        console.error('Error reading data from AsyncStorage:', e);
      }
    };

    getData();
  }, []);


  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [isEmailValid, setIsEmailValid] = useState(true);
  const [password, setPassword] = useState("");
  const handlePassword = (text) => {

    setPassword(text);

  };

  const handleEmailChange = (text) => {
    setEmail(text);
    setIsEmailValid(isValidEmail(text) || /^[0-9+\-\s]+$/.test(text)); // Allow email or phone username
  };

  const isValidEmail = (email) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  };

  //Handling Sign in
  const handleSignIn = async () => {
    setIsLoading(true);

    const auth = getAuth();
    const loginInput = email.trim();

    try {
      const usersRef = collection(db, 'users');
      const q1 = query(usersRef, where('email', '==', loginInput));
      const q2 = query(usersRef, where('username', '==', loginInput));
      const [emailSnapshot, usernameSnapshot] = await Promise.all([getDocs(q1), getDocs(q2)]);
      let loginUserData = null;

      if (!emailSnapshot.empty) {
        loginUserData = emailSnapshot.docs[0].data();
      } else if (!usernameSnapshot.empty) {
        loginUserData = usernameSnapshot.docs[0].data();
      }

      const authEmail = loginUserData?.authEmail || loginUserData?.email || loginInput;

      signInWithEmailAndPassword(auth, authEmail, password)
      .then((userCredential) => {
        const user = userCredential.user;

        if (rememberMe) {
          AsyncStorage.setItem('user', JSON.stringify(user));
        }

        if (rememberMe) {
          AsyncStorage.setItem('email', loginInput);
          AsyncStorage.setItem('password', password);
        } else {
          AsyncStorage.multiRemove(['email', 'password', 'user']);
        }
        const usersRef = collection(db, 'users');
        const q1 = query(usersRef, where('email', '==', loginInput));
        const q2 = query(usersRef, where('username', '==', loginInput));

        Promise.all([getDocs(q1), getDocs(q2)])
          .then(([emailSnapshot, usernameSnapshot]) => {
            let userData = null;

            if (!emailSnapshot.empty) {
              emailSnapshot.forEach((doc) => {
                userData = doc.data();
              });
            } else if (!usernameSnapshot.empty) {
              usernameSnapshot.forEach((doc) => {
                userData = doc.data();
              });
            }

            if (userData) {
              const isAdmin = userData.isAdmin;
              const userType = userData.userType;

              if (isAdmin) {
                navigation.navigate('AdminDashboard');
              } else if (userType === 'patient') {
                navigation.navigate('Patient');
              } else if (userType === 'doctor') {
                navigation.navigate('Doctor');
              } else {
                navigation.navigate('donorTabnavigate');
              }
            } else {
              console.error('User data not found');
              setIsLoading(false);
            }
          })
          .catch((error) => {
            console.error('Error fetching user data:', error);
            setIsLoading(false);
          })
          .finally(() => {
            setIsLoading(false);
          });
      })
      .catch((error) => {
        console.error('Error signing in:', error);
        setIsLoading(false);
        Alert.alert(
          "ERROR!",
          "Oops!  Please check your email or password and try again.",
          [
            { text: "OK" }
          ]
        );
      });
    } catch (error) {
      console.error('Error preparing sign in:', error);
      setIsLoading(false);
      Alert.alert(
        "ERROR!",
        "Oops!  Please check your email or password and try again.",
        [
          { text: "OK" }
        ]
      );
    }

  };

  return (
    <PageContainer>
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar
          barStyle={Platform.select({
            ios: "dark-content",
            android: "dark-content",
          })}
          backgroundColor={Platform.select({
            ios: "black",
            android: "red",
          })}
        />

        <View style={styles.topContainer}>
          <Image source={images.topDesign} style={styles.top} />
        </View>

        <View
          style={{
            alignItems: "center",
            justifyContent: "center",
            paddingTop: 5,
          }}
        >
          <Image source={images.logo} style={{ marginTop: -40 }}></Image>
        </View>
        <View style={{ marginLeft: 25, marginRight: 25 }}>
          <Text
            style={{
              ...FONTS.largerTitles,
              color: COLORS.primaryRed,
              marginTop: 10,
            }}
          >
            Sign In
          </Text>
          <Text style={{ ...FONTS.h6, color: COLORS.black, marginTop: 10 }}>
            Sign in using your credentials.
          </Text>

          <Text style={styles.inputLabel}>Email / Username:</Text>
          <Input placeholder="name@example.com or phone"
            keyboardType="default"
            value={email}
            onChangeText={handleEmailChange}
          />
          {!isEmailValid && (
            <Text style={{ color: "red", marginLeft: 25 }}>
              Enter a valid email or phone username
            </Text>
          )}

          <Text style={styles.inputLabel}>Password:</Text>
          <Input placeholder="min. 8 characters" secureTextEntry maxLength={20} value={password} onChangeText={handlePassword} />

          <View style={{ marginTop: 10, marginLeft: 5 }}>
            <RememberMeCheckbox
              label="Keep me logged in"
              isChecked={rememberMe}
              onChange={setRememberMe}
            />

          </View>
        </View>


        <View>
          {isLoading ? (
            <ActivityIndicator size="large" color={COLORS.primaryRed} />
          ) : (
            <TouchableOpacity
              style={[
                styles.button,
              ]}

              onPress={handleSignIn}
            >
              <Text style={styles.buttonText}>Sign In</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.forgotPassword}>
          <TouchableOpacity
            onPress={() => navigation.navigate("ResetPassword")}
          >
            <Text
              style={{
                fontWeight: "bold",
                color: "#CF0A0A",
                fontSize: 15,
              }}
            >
              Forgot your password?
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.signupContainer}>
          <Text style={{ color: "#000000", fontWeight: "400", fontSize: 15 }}>
            Don't have an account?
          </Text>

          <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
            <Text style={styles.signupText}>Signup (for donor only)</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </PageContainer>
  );
};

const styles = StyleSheet.create({
  inputLabel: {
    color: '#CF0A0A',
    fontWeight: 'bold',
    marginTop: 4,
    marginBottom: 1,
  },

  forgotPassword: {
    justifyContent: "center",
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 0,
  },
  signupContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 15,
    marginBottom: 70
  },
  signupText: {
    marginLeft: 5,
    color: "#CF0A0A",
    fontWeight: "bold",
    fontSize: 17,
  },

  topContainer: {
    flex: 1,
    alignItems: "flex-start",
    justifyContent: "flex-start",
  },
  bottomContainer: {
    flex: 1,
    alignItems: "flex-end",
    justifyContent: "flex-end",
  },
  top: {
    height: 150,
    width: 150,
    resizeMode: "contain",
    marginLeft: -8,
  },
  bottom: {
    height: 130,
    width: 130,
    resizeMode: "contain",
    marginRight: -8,
    marginTop: 20,
    marginBottom: 0,
    marginLeft: 20
  },

  button: {
    backgroundColor: COLORS.primaryRed,
    borderRadius: 13,
    paddingHorizontal: 5,
    paddingVertical: 15,
    marginTop: 30,
    marginHorizontal: 24,
    marginBottom: 10,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "black",
    shadowOffset: { width: 2, height: 2 },
    shadowRadius: 2,
    shadowOpacity: 0.8,
    elevation: 8,
  },
  buttonText: {
    fontSize: 17,
    alignSelf: "center",
    color: COLORS.secondaryWhite,
    fontWeight: "bold",
    fontFamily: "HeeboRegular",
  },

});
export default Signin;

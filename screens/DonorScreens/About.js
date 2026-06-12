// import { View, Text, StyleSheet, BackHandler } from 'react-native'
// import React, { useEffect } from 'react';
// import { COLORS, FONTS, SIZES } from "../../constants/themes";
// import { useNavigation } from '@react-navigation/native';

// const About = () => {

//     //Function to navigate back when hardware back button is pressed
//     const navigation = useNavigation();
//     useEffect(() => {
//         const backHandler = BackHandler.addEventListener(
//             'hardwareBackPress',
//             () => {
//                 navigation.goBack();
//                 return true; // Prevent default behavior (exit the app)
//             }
//         );

//         return () => backHandler.remove();
//     }, [navigation]);

//     return (
//         <View style={styles.container}>
//             <Text style={styles.text}>JSF (Jamila Sultana Foundation) is a non-profit organization that was founded in 2004. In December 2005, a blood bank was added to this facility. It is a welfare health division of Global Pharmaceutical, Islamabad, which deals with the treatment and prevention of Thalassemia, a genetically inherited blood disorder. The foundation focuses on providing the best available treatment to ensure a normal quality of life for Thalassemia patients.</Text>

//             <View
//                 style={{
//                     flexDirection: "row",
//                     alignItems: "center",
//                     paddingTop: 50,
//                     alignSelf: "center",
//                 }}
//             >
//                 <Text style={{ ...FONTS.title, color: COLORS.primaryRed }}>
//                     Donate
//                 </Text>
//                 <Text style={{ ...FONTS.title, color: COLORS.black }}> Blood,</Text>
//                 <Text style={{ ...FONTS.title, color: COLORS.primaryRed }}>
//                     {" "}
//                     Save
//                 </Text>
//                 <Text style={{ ...FONTS.title, color: COLORS.black }}> Lives</Text>
//             </View>

//             <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: 50 }}>
//                 <Text style={styles.text2}>Developed By:</Text>
//                 <Text style={styles.text2}>Waleed Ahmed, Sameer Javed, Danyal Fasihi </Text>
//             </View>
//         </View>
//     )
// }
// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         justifyContent: 'center',
//         alignItems: 'center',
//         backgroundColor: 'white',

//     },
//     text: {
//         fontSize: 20,
//         fontWeight: '500',
//         textAlign: 'center',
//         marginLeft: 20,
//         marginRight: 20
//     },
//     text2: {
//         fontSize: 14,
//         fontWeight: '500',
//         textAlign: 'center'
//     }
// })
// export default About;








import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  BackHandler,
} from "react-native";
import { COLORS, FONTS } from "../../constants/themes";
import { useNavigation } from "@react-navigation/native";

const About = () => {
  const navigation = useNavigation();

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        navigation.goBack();
        return true;
      }
    );

    return () => backHandler.remove(); // ✅ correct modern API
  }, [navigation]);

  return (
    <View style={{ flex: 1 }}>
      {/* Fixed Background */}
      <Image
        source={require("../../assets/about_reference_bg-04.jpg")}
        style={styles.background}
        resizeMode="cover"
      />

      {/* Scrollable content */}
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Overlay Image */}
        <Image
          source={require("../../assets/p12.png")}
          style={styles.overlayImage}
          resizeMode="contain"
        />

        {/* About Text */}
        <Text style={styles.text}>
          JSF (Jamila Sultana Foundation) is a non-profit organization that
          was founded in 2004. In December 2005, a blood bank was added to this
          facility. It is a welfare health division of Global Pharmaceutical,
          Islamabad, which deals with the treatment and prevention of
          Thalassemia, a genetically inherited blood disorder. The foundation
          focuses on providing the best available treatment to ensure a normal
          quality of life for Thalassemia patients.
        </Text>

        {/* Donate Text */}
        <View style={styles.donateRow}>
          <Text style={[FONTS.h1, { color: COLORS.primaryRed }]}>Donate</Text>
          <Text style={[FONTS.h1, { color: COLORS.black }]}> Blood,</Text>
          <Text style={[FONTS.h1, { color: COLORS.primaryRed }]}> Save</Text>
          <Text style={[FONTS.h1, { color: COLORS.black }]}> Lives</Text>
        </View>

        {/* Developers */}
        <View style={styles.footer}>
          <Text style={styles.text2}>Developed By:</Text>
          <Text style={styles.text2}>
            Muhammad Wasif, Abdullah, Akramullah Khan
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default About;

const styles = StyleSheet.create({
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  container: {
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
    zIndex: 1,
  },
  overlayImage: {
    width: "80%",
    height: 200,
    marginBottom: 30,
  },
  text: {
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
    color: COLORS.black,
    marginBottom: 30,
    marginHorizontal: 20, // ✅ left and right margin
  },
  donateRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
  },
  footer: {
    marginTop: 50,
    alignItems: "center",
  },
  text2: {
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
    color: COLORS.black,
  },
});

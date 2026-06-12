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
import BackArrow from "../../components/BackArrow";

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
        <BackArrow navigation={navigation} style={styles.backArrow} />

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
  backArrow: {
    alignSelf: "flex-start",
    marginBottom: 12,
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

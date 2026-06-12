// import React, { useState, useEffect } from 'react';
// import { View, Text, StyleSheet, Image, ImageBackground } from 'react-native';
// import { collection, getDocs } from 'firebase/firestore';
// import { db } from '../../config';
// import images from '../../constants/images';
// import Slideshow from 'react-native-image-slider-show';
// import HeaderUsers from '../../components/HeaderUsers';
// import OtherUserHeader from '../../components/OtherUserHeader';
// const DonorPage = ({navigation}) => {
//   const [position, setPosition] = useState(0);
//   const [dataSource, setDataSource] = useState([
//     {
//       url: 'https://i.ibb.co/YXKSm0q/16262070-tp227-facebookeventcover-06.jpg',
//     },
//     {
//       url: 'https://i.ibb.co/vhBbSQf/16262056-tp227-facebookeventcover-04.jpg',
//     },
//   ]);

//   useEffect(() => {
//     const toggle = setInterval(() => {
//       setPosition((prevPosition) =>
//         prevPosition === dataSource.length - 1 ? 0 : prevPosition + 1
//       );
//     }, 5000);

//     return () => clearInterval(toggle);
//   }, [position, dataSource]);

//   const [totalCount, setTotalCount] = useState(0);

//   // Function to fetch and update the total count
//   const fetchTotalCount = async () => {
//     try {
//       const querySnapshot = await getDocs(collection(db, 'users'));
//       const count = querySnapshot.size; // Get the number of documents
//       setTotalCount(count);
//     } catch (error) {
//       console.error('Error fetching total count:', error);
//     }
//   };

//   // Fetch the total count when the component mounts
//   useEffect(() => {
//     fetchTotalCount();
//   }, []);

//   return (
//     <View style={styles.container}>
//     <OtherUserHeader navigation={navigation}/>
//     <View style={styles.secodarycontainer}>
//       <View style={styles.sliderContainer}>
//         <Slideshow
//           position={position}
//           dataSource={dataSource}
//           onPositionChanged={(position) => setPosition(position)}
//         />
//       </View>

//       <View style={styles.metricContainer}>
//         <View style={styles.metricBox}>
//           <ImageBackground source={images.DonorBackground} style={styles.backgroundImage}>
//             <Text style={styles.metricValue}>{totalCount}</Text>
//             <Text style={styles.metricLabel}>Total Records</Text>
//           </ImageBackground>
//         </View>
//       </View>
//     </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   secodarycontainer: {
//     flex: 1,
//     marginHorizontal: 10,
//   },
//   sliderContainer: {
//     height: 200,
//     width: '100%',
//     marginTop: 20,

//   },
//   metricContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginVertical: 20,

//   },
//   metricBox: {
//     flex: 1,
//     borderColor: 'lightgrey',
//     alignItems: 'center',

//     justifyContent: 'center',
//   },
//   backgroundImage: {
//     height: 210,
//     width: '100%',
//     alignItems: 'center',
//     justifyContent: 'center',

//   },
//   metricValue: {
//     fontSize: 34,
//     fontWeight: 'bold',
//     color: 'white'
//   },
//   metricLabel: {
//     fontSize: 22,
//     color: 'white',
//     marginTop: 5,
//   },
// });

// export default DonorPage;









import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
  Image
} from 'react-native';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../config';
import { COLORS } from '../../constants';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import images from '../../constants/images';
import OtherUserHeader from '../../components/OtherUserHeader';
import DonorBottomMenu from '../../components/DonorBottomMenu';

const DonorPage = ({ navigation }) => {
  const [totalCount, setTotalCount] = useState(0);
  const [activeDonors, setActiveDonors] = useState(0);

  // Fetch total donor count
  useEffect(() => {
    const fetchTotalCount = async () => {
      try {
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const donorsSnapshot = await getDocs(
          query(collection(db, 'users'), where('userType', '==', 'donor'))
        );

        setTotalCount(usersSnapshot.size);
        setActiveDonors(donorsSnapshot.size);
      } catch (error) {
        console.error('Error fetching total count:', error);
      }
    };
    fetchTotalCount();
  }, []);

  // Render Total Records Card
  const renderTotalRecordsCard = () => {
    return (
      <View style={styles.totalRecordsCard}>
        {/* Left: Blood Drop Icon + Text */}
        <View style={styles.cardLeft}>
          <MaterialCommunityIcons
            name="water"
            size={40}
            color="white"
            style={styles.bloodDropIcon}
          />
          <Text style={styles.saveLivesText}>save lives.{'\n'}donate blood.</Text>
        </View>

        {/* Right: Total Records Count */}
        <View style={styles.cardRight}>
          <Text style={styles.totalCountText}>{totalCount}</Text>
          <Text style={styles.totalRecordsLabel}>Total Records</Text>
        </View>
      </View>
    );
  };

  // Render Middle Section
  const renderMiddleSection = () => {
    return (
      <View style={styles.middleSection}>
        {/* Left: Active Donors Card */}
        <View style={styles.middleLeft}>
          {/* Active Donors Card */}
          <View style={styles.activeDonorsCard}>
            <View style={styles.activeDonorsTopContainer}>
              <MaterialCommunityIcons name="water" size={30} color={COLORS.primaryRed} />
              <Text style={styles.activeDonorsCount}>{activeDonors}+</Text>
            </View>
            <Text style={styles.activeDonorsLabel}>Active Donors</Text>
          </View>
        </View>
      </View>
    );
  };

  // Render Bottom Section
  const renderBottomSection = () => {
    return (
      <View style={styles.bottomSection}>
        {/* Text */}
        <View style={styles.dreamsTextContainer}>
          <Text style={styles.dreamsText}>Gives wing to their Dreams.</Text>
        </View>

        {/* Donate Now Button */}

        {/* <TouchableOpacity
          style={[styles.button, { backgroundColor: "#D60000" }]}
          onPress={() =>
            navigation.navigate("DonationRequests")
          }
        >
          <Text style={styles.buttonText}>Donate Now</Text>
        </TouchableOpacity> */}
        <TouchableOpacity 
          style={styles.donateButton}
          onPress={() => {
            navigation.getParent()?.navigate('DonationRequests');

            // navigation.navigate('DonationRequests');
            // Add navigation to donate screen or action
            // console.log('Donate Now pressed');
          }}
        >
          <Text style={styles.donateButtonText}>Donate Now</Text>
        </TouchableOpacity>
        <View>
          <Image source={images.DonateScreenBottom} style={styles.bottom} />
        </View>
      </View>

    );
  };

  return (
    <ImageBackground
      source={images.DonateScreenBG}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <OtherUserHeader navigation={navigation} />
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {renderTotalRecordsCard()}
          {renderMiddleSection()}
        </ScrollView>
        {/* Bottom Section - Absolute Positioned */}
        {renderBottomSection()}
        <View style={styles.menuWrapper}>
          <DonorBottomMenu navigation={navigation} activeRoute="DonorPage" />
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    // backgroundColor: 'transparent',
    // position: 'relative',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 200,
  },
  totalRecordsCard: {
    backgroundColor: COLORS.primaryRed,
    marginHorizontal: 0,
    marginTop: 5,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 5,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    shadowOpacity: 0.3,
  },
  cardLeft: {
    flex: 1,
    alignItems: 'flex-start',
  },
  bloodDropIcon: {
    marginBottom: 10,
  },
  saveLivesText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
  },
  cardRight: {
    alignItems: 'flex-end',
  },
  totalCountText: {
    fontSize: 38,
    fontWeight: 'bold',
    color: 'white',
  },
  totalRecordsLabel: {
    fontSize: 16,
    color: 'white',
    marginTop: 5,
  },
  middleSection: {
    marginHorizontal: 15,
    marginTop: 90,
    alignItems: 'flex-start',
  },
  middleLeft: {
    width: '100%',
    alignItems: 'flex-start',
  },
  activeDonorsCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    flexDirection: 'column',
    alignItems: 'flex-start',
    elevation: 3,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    shadowOpacity: 0.1,
  },
  activeDonorsTopContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  activeDonorsCount: {
    fontSize: 15,
    fontWeight: 'bold',
    color: 'black',
    marginLeft: 10,
  },
  activeDonorsLabel: {
    fontSize: 14,
    color: 'black',
  },
  bottomSection: {
    position: 'absolute',
    bottom: 115,
    left: 0,
    right: 0,
    marginHorizontal: 0,
    zIndex: 3,
  },
  menuWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 10,
    zIndex: 5,
  },
  dreamsTextContainer: {

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    marginLeft: 0,
  },
  dreamsText: {
    fontSize: 18,
    color: '#8B0000',
    fontWeight: '600',
    textAlign: 'center',
  },
  donateButton: {
    backgroundColor: COLORS.primaryRed,
    borderRadius: 15,
    paddingVertical: 15,
    paddingHorizontal: 40,
    alignItems: 'center',
    alignSelf: 'center',
    elevation: 4,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    shadowOpacity: 0.3,
     marginBottom: -30,
  },
  donateButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  bottom: {
    height: 260,
    width: '100%',
    resizeMode: "contain",
    marginBottom: -85,
    alignSelf: 'center',
    right: 0

  },
  button: { padding: 14, borderRadius: 10, alignItems: "center", marginHorizontal: 16,  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },

});

export default DonorPage;

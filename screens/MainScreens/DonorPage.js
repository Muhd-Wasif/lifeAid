import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ImageBackground } from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../config';
import images from '../../constants/images';
import Slideshow from 'react-native-image-slider-show';
import HeaderUsers from '../../components/HeaderUsers';
import OtherUserHeader from '../../components/OtherUserHeader';
const DonorPage = ({navigation}) => {
  const [position, setPosition] = useState(0);
  const [dataSource, setDataSource] = useState([
    {
      url: 'https://i.ibb.co/YXKSm0q/16262070-tp227-facebookeventcover-06.jpg',
    },
    {
      url: 'https://i.ibb.co/vhBbSQf/16262056-tp227-facebookeventcover-04.jpg',
    },
  ]);

  useEffect(() => {
    const toggle = setInterval(() => {
      setPosition((prevPosition) =>
        prevPosition === dataSource.length - 1 ? 0 : prevPosition + 1
      );
    }, 5000);

    return () => clearInterval(toggle);
  }, [position, dataSource]);

  const [totalCount, setTotalCount] = useState(0);

  // Function to fetch and update the total count
  const fetchTotalCount = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const count = querySnapshot.size; // Get the number of documents
      setTotalCount(count);
    } catch (error) {
      console.error('Error fetching total count:', error);
    }
  };

  // Fetch the total count when the component mounts
  useEffect(() => {
    fetchTotalCount();
  }, []);

  return (
    <View style={styles.container}>
    <OtherUserHeader navigation={navigation}/>
    <View style={styles.secodarycontainer}>
      <View style={styles.sliderContainer}>
        <Slideshow
          position={position}
          dataSource={dataSource}
          onPositionChanged={(position) => setPosition(position)}
        />
      </View>

      <View style={styles.metricContainer}>
        <View style={styles.metricBox}>
          <ImageBackground source={images.DonorBackground} style={styles.backgroundImage}>
            <Text style={styles.metricValue}>{totalCount}</Text>
            <Text style={styles.metricLabel}>Total Records</Text>
          </ImageBackground>
        </View>
      </View>
    </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  secodarycontainer: {
    flex: 1,
    marginHorizontal: 10,
  },
  sliderContainer: {
    height: 200,
    width: '100%',
    marginTop: 20,

  },
  metricContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 20,

  },
  metricBox: {
    flex: 1,
    borderColor: 'lightgrey',
    alignItems: 'center',

    justifyContent: 'center',
  },
  backgroundImage: {
    height: 210,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',

  },
  metricValue: {
    fontSize: 34,
    fontWeight: 'bold',
    color: 'white'
  },
  metricLabel: {
    fontSize: 22,
    color: 'white',
    marginTop: 5,
  },
});

export default DonorPage;

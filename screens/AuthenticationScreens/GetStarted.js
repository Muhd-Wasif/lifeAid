import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  AppState,
  Dimensions,
  FlatList,
  Image,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { COLORS } from "../../constants/themes";

const slides = [
  {
    id: "splash-1",
    image: require("../../assets/splash/splash-slide-1.jpeg"),
  },
  {
    id: "splash-2",
    image: require("../../assets/splash/splash-slide-2.jpeg"),
  },
  {
    id: "splash-3",
    image: require("../../assets/splash/splash-slide-3.jpeg"),
  },
];

const GetStarted = () => {
  const navigation = useNavigation();
  const listRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const { width, height } = useWindowDimensions();
  const [screenHeight, setScreenHeight] = useState(Dimensions.get("screen").height);

  const viewabilityConfig = useMemo(
    () => ({
      itemVisiblePercentThreshold: 60,
    }),
    []
  );

  const handleViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setActiveIndex(viewableItems[0].index || 0);
    }
  }).current;

  const handleGetStarted = () => {
    navigation.replace("Signin");
  };

  const slideHeight = Platform.OS === "android" ? Math.max(height, screenHeight) : height;
  const listKey = `${Math.round(width)}-${Math.round(slideHeight)}`;

  useEffect(() => {
    const updateScreenHeight = () => {
      setScreenHeight(Dimensions.get("screen").height);
    };

    const dimensionsSubscription = Dimensions.addEventListener("change", updateScreenHeight);
    const appStateSubscription = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active") {
        updateScreenHeight();
      }
    });

    return () => {
      dimensionsSubscription?.remove?.();
      appStateSubscription.remove();
    };
  }, []);

  useEffect(() => {
    requestAnimationFrame(() => {
      listRef.current?.scrollToIndex?.({
        index: activeIndex,
        animated: false,
      });
    });
  }, [activeIndex, width, slideHeight]);

  const renderSlide = ({ item }) => (
    <View style={[styles.slide, { width, height: slideHeight }]}>
      <Image source={item.image} style={styles.slideImage} resizeMode="stretch" />
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle={Platform.OS === "ios" ? "dark-content" : "light-content"}
      />

      <FlatList
        key={listKey}
        ref={listRef}
        data={slides}
        keyExtractor={(item) => item.id}
        renderItem={renderSlide}
        getItemLayout={(_, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
        horizontal
        pagingEnabled
        bounces={false}
        showsHorizontalScrollIndicator={false}
        viewabilityConfig={viewabilityConfig}
        onViewableItemsChanged={handleViewableItemsChanged}
      />

      <View style={styles.bottomOverlay} pointerEvents="box-none">
        <View style={styles.pagination}>
          {slides.map((item, index) => (
            <View
              key={item.id}
              style={[
                styles.dot,
                activeIndex === index && styles.activeDot,
              ]}
            />
          ))}
        </View>

        <TouchableOpacity
          style={styles.getStartedButton}
          onPress={handleGetStarted}
          activeOpacity={0.85}
        >
          <Text style={styles.getStartedText}>Get Started</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  slide: {
    flex: 1,
    backgroundColor: "#fff",
  },
  slideImage: {
    width: "100%",
    height: "100%",
  },
  bottomOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: Platform.OS === "android" ? 64 : 52,
    alignItems: "center",
    paddingHorizontal: 24,
  },
  pagination: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  dot: {
    width: 24,
    height: 5,
    borderRadius: 3,
    marginHorizontal: 5,
    backgroundColor: "rgba(255, 255, 255, 0.82)",
    borderWidth: 1,
    borderColor: COLORS.primaryRed,
  },
  activeDot: {
    width: 42,
    backgroundColor: COLORS.primaryRed,
  },
  getStartedButton: {
    width: "100%",
    height: 54,
    borderRadius: 27,
    backgroundColor: COLORS.primaryRed,
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
  },
  getStartedText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },
});

export default GetStarted;

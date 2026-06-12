import React, { useEffect, useState } from "react";
import {
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { getAuth } from "firebase/auth";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../../config";

const DonationHistory = ({ navigation }) => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) return undefined;

    const historyQuery = query(
      collection(db, "donationHistory"),
      where("donorUid", "==", user.uid)
    );

    const unsubscribe = onSnapshot(
      historyQuery,
      (snapshot) => {
        const fetchedHistory = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));
        setHistory(fetchedHistory);
      },
      (error) => {
        console.error("Error fetching donation history:", error);
      }
    );

    return () => unsubscribe();
  }, []);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>
        View{"\n"}
        <Text style={styles.bold}>Donation History</Text>
      </Text>

      <Text style={styles.subtitle}>
        You can access your medical report securely{"\n"}view or download
      </Text>

      {history.length === 0 ? (
        <Text style={styles.emptyText}>No donation history found.</Text>
      ) : history.map((item) => (
        <View key={item.id} style={styles.card}>
          <View style={styles.redStrip} />

          <View style={styles.cardContent}>
            <View style={styles.historyText}>
              <Text style={styles.historyTitle}>{item.requestName || "Donation Request"}</Text>
              <Text style={styles.historyDetail}>
                {item.bloodType || "Blood"} - {item.bloodGroup || "Group"}
              </Text>
              <Text style={styles.historyDetail}>Status: {item.status || "contacted"}</Text>
            </View>

            <TouchableOpacity>
              <Text style={styles.actionText}>View</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fde7ea",
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 26,
    marginTop: 30,
    color: "#000",
  },
  bold: {
    fontWeight: "800",
  },
  subtitle: {
    fontSize: 12,
    color: "#555",
    marginVertical: 10,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    height: 90,
    marginBottom: 16,
    flexDirection: "row",
    elevation: 3,
  },
  redStrip: {
    width: 6,
    backgroundColor: "#d10000",
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
  },
  cardContent: {
    flex: 1,
    justifyContent: "flex-end",
    flexDirection: "row",
    padding: 12,
  },
  actionText: {
    fontSize: 12,
    color: "#888",
    marginLeft: 16,
  },
  emptyText: {
    color: "#555",
    textAlign: "center",
    marginTop: 30,
  },
  historyText: {
    flex: 1,
  },
  historyTitle: {
    color: "#000",
    fontWeight: "700",
  },
  historyDetail: {
    color: "#555",
    fontSize: 12,
    marginTop: 3,
  },
});

export default DonationHistory;

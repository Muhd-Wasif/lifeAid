import React, { useEffect, useState } from "react";
import {
  Alert,
  Linking,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { getAuth } from "firebase/auth";
import { addDoc, collection, getDocs, onSnapshot, query, serverTimestamp, where } from "firebase/firestore";
import { db } from "../../config";

const DonationRequests = ({ navigation }) => {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "requests"),
      (snapshot) => {
        const fetchedRequests = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));
        setRequests(fetchedRequests);
      },
      (error) => {
        console.error("Error fetching donation requests:", error);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleContact = async (item) => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      const donationDate = new Date();
      const donorName = await getDonorName(user);
      const requestName = item.fullName || item.name || "Patient";
      const bloodType = item.bloodType || item.blood || "Blood";
      const bloodGroup = item.bloodGroup || item.group || "Group";

      await addDoc(collection(db, "donationHistory"), {
        donorUid: user?.uid || null,
        donorEmail: user?.email || null,
        requestId: item.id,
        requestName,
        phoneNumber: item.phoneNumber || item.phone,
        bloodType,
        bloodGroup,
        medicalReason: item.medicalReason || item.reason,
        status: "contacted",
        donationDate: donationDate.toISOString(),
        createdAt: serverTimestamp(),
      });

      if (user?.uid) {
        await createDonationCertificate({
          donorUid: user.uid,
          donorEmail: user.email || null,
          donorName,
          requestId: item.id,
          patientName: requestName,
          bloodType,
          bloodGroup,
          donationDate,
        });
      }

      const phoneNumber = item.phoneNumber || item.phone;
      if (phoneNumber) {
        Linking.openURL(`tel:${phoneNumber}`);
      }
    } catch (error) {
      console.error("Error saving donation history:", error);
      Alert.alert("Error", "Unable to save donation history.");
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.header}>Gives wing to their Dreams.</Text>

      {requests.length === 0 ? (
        <Text style={styles.emptyText}>No donation requests available.</Text>
      ) : requests.map((item) => (
        <View key={item.id} style={styles.card}>
          <Text style={styles.text}>
            <Text style={styles.label}>Full Name: </Text>
            {item.fullName || item.name}
          </Text>

          <Text style={styles.text}>
            <Text style={styles.label}>Phone Number: </Text>
            {item.phoneNumber || item.phone}
          </Text>

          <Text style={styles.text}>
            <Text style={styles.label}>Blood Type: </Text>
            {item.bloodType || item.blood}
          </Text>

          <Text style={styles.text}>
            <Text style={styles.label}>Blood Group: </Text>
            {item.bloodGroup || item.group}
          </Text>

          <Text style={styles.text}>
            <Text style={styles.label}>Medical Reason: </Text>
            {item.medicalReason || item.reason}
          </Text>

          <TouchableOpacity style={styles.button} onPress={() => handleContact(item)}>
            <Text style={styles.buttonText}>Contact</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 16,
  },
  header: {
    color: "#d10000",
    fontWeight: "600",
    textAlign: "center",
    marginVertical: 12,
  },
  emptyText: {
    color: "#555",
    textAlign: "center",
    marginTop: 30,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
    elevation: 3,
  },
  label: {
    fontWeight: "700",
    color: "#000",
  },
  text: {
    fontSize: 13,
    color: "#000",
    marginBottom: 4,
  },
  button: {
    backgroundColor: "#d10000",
    borderRadius: 20,
    alignSelf: "center",
    paddingVertical: 8,
    paddingHorizontal: 30,
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 13,
  },
});


export default DonationRequests;

const getDonorName = async (user) => {
  if (!user) return "Valued Donor";

  try {
    const usersRef = collection(db, "users");
    let userSnapshot = await getDocs(query(usersRef, where("uid", "==", user.uid)));

    if (userSnapshot.empty && user.email) {
      userSnapshot = await getDocs(query(usersRef, where("email", "==", user.email)));
    }

    if (!userSnapshot.empty) {
      const userData = userSnapshot.docs[0].data();
      return userData.fullName || user.displayName || user.email || "Valued Donor";
    }
  } catch (error) {
    console.error("Error fetching donor name:", error);
  }

  return user.displayName || user.email || "Valued Donor";
};

const createDonationCertificate = async ({
  donorUid,
  donorEmail,
  donorName,
  requestId,
  patientName,
  bloodType,
  bloodGroup,
  donationDate,
}) => {
  const certificateQuery = query(
    collection(db, "reports"),
    where("ownerUid", "==", donorUid)
  );
  const existingCertificate = await getDocs(certificateQuery);

  const hasCertificateForRequest = existingCertificate.docs.some(
    (docSnap) => {
      const report = docSnap.data();
      return report?.reportKind === "donationCertificate" && report?.requestId === requestId;
    }
  );

  if (hasCertificateForRequest) return;

  const formattedDate = donationDate.toLocaleDateString();

  await addDoc(collection(db, "reports"), {
    ownerUid: donorUid,
    ownerType: "donor",
    donorUid,
    ownerName: donorName,
    donorEmail,
    reportKind: "donationCertificate",
    title: "Blood Donation Certificate",
    description: `Certificate for donating ${bloodType} (${bloodGroup}) on ${formattedDate}.`,
    fileName: `JSF_Donation_Certificate_${donorName}_${formattedDate}.html`,
    fileType: "text/html",
    requestId,
    patientName,
    bloodType,
    bloodGroup,
    donationDate: donationDate.toISOString(),
    certificateData: {
      donorName,
      patientName,
      bloodType,
      bloodGroup,
      donationDate: donationDate.toISOString(),
      organizationName: "Jamila Sultana Foundation",
    },
    uploadedAt: serverTimestamp(),
  });
};

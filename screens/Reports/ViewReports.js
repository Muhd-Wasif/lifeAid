import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity } from "react-native";
import { Ionicons as Icon } from "@expo/vector-icons";
import { getAuth } from "firebase/auth";
import { collection, onSnapshot, query, where } from "firebase/firestore";

import ReportCard from "../../components/ReportCard";
import { db } from "../../config";
import { COLORS } from "../../constants/themes";

const ViewReports = ({ navigation, route }) => {
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const isCertificateMode = route?.params?.mode === "certificates";

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      setIsLoading(false);
      return undefined;
    }

    const reportsQuery = query(
      collection(db, "reports"),
      where("ownerUid", "==", user.uid)
    );

    const unsubscribe = onSnapshot(
      reportsQuery,
      (snapshot) => {
        const fetchedReports = snapshot.docs
          .map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data(),
          }))
          .filter((report) => (
            isCertificateMode ? report.reportKind === "donationCertificate" : report.reportKind !== "donationCertificate"
          ))
          .sort((a, b) => {
            const aTime = a.uploadedAt?.toMillis ? a.uploadedAt.toMillis() : 0;
            const bTime = b.uploadedAt?.toMillis ? b.uploadedAt.toMillis() : 0;
            return bTime - aTime;
          });

        setReports(fetchedReports);
        setIsLoading(false);
      },
      (error) => {
        console.error("Error fetching reports:", error);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [isCertificateMode]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity
        style={styles.backArrow}
        onPress={() => navigation.goBack()}
        accessibilityRole="button"
        accessibilityLabel="Go back"
      >
        <Icon name="arrow-back-outline" size={28} color={COLORS.primaryRed} />
      </TouchableOpacity>

      <Text style={styles.title}>{isCertificateMode ? "View Certificates" : "View Reports"}</Text>
      <Text style={styles.subtitle}>
        {isCertificateMode
          ? "View or download certificates generated after blood donation."
          : "Securely view or download reports uploaded by admin."}
      </Text>

      {isLoading ? (
        <Text style={styles.emptyText}>Loading reports...</Text>
      ) : reports.length > 0 ? (
        reports.map((report) => (
          <ReportCard
            key={report.id}
            title={report.title || report.name}
            desc={report.description || report.desc}
            fileUrl={report.fileUrl || report.downloadUrl}
            fileName={report.fileName}
            fileType={report.fileType}
            reportDate={report.donationDate || report.uploadedAt || report.reportDate || report.createdAt}
            certificateData={report.certificateData}
            reportKind={report.reportKind}
          />
        ))
      ) : (
        <Text style={styles.emptyText}>
          {isCertificateMode ? "No certificates generated yet." : "No reports uploaded yet."}
        </Text>
      )}
    </ScrollView>
  );
};

export default ViewReports;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    padding: 15,
    paddingBottom: 30,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
  },
  backArrow: {
    marginBottom: 16,
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  subtitle: {
    color: "#666",
    marginBottom: 20,
  },
  emptyText: {
    marginTop: 30,
    textAlign: "center",
    color: "#777",
    fontSize: 16,
  },
});

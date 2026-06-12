import React, { useRef, useState } from "react";
import { Alert, View, Text, StyleSheet, TouchableOpacity } from "react-native";
import * as FileSystem from "expo-file-system/legacy";
import { COLORS } from "../constants/themes";

let downloadInProgress = false;

const ReportCard = ({ title, desc }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const downloadLockRef = useRef(false);

  const downloadPDF = async () => {
    if (downloadLockRef.current || downloadInProgress) return;

    downloadLockRef.current = true;
    downloadInProgress = true;
    setIsDownloading(true);

    try {
      const uri = FileSystem.documentDirectory + `${title}.pdf`;
      await FileSystem.writeAsStringAsync(uri, "Dummy PDF Content");
      Alert.alert("Downloaded", `Report saved successfully.\n\nLocation: ${uri}`);
    } finally {
      downloadLockRef.current = false;
      downloadInProgress = false;
      setIsDownloading(false);
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <Text>{desc}</Text>
      <Text style={styles.date}>Date: 12 Aug 2025 • 4:32 PM</Text>

      <View style={styles.row}>
        <TouchableOpacity style={styles.btn}>
          <Text style={styles.btnText}>View</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, isDownloading && styles.disabledBtn]}
          onPress={downloadPDF}
          disabled={isDownloading}
        >
          <Text style={styles.btnText}>{isDownloading ? "Downloading..." : "Download"}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ReportCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    padding: 15,
    marginVertical: 10,
    borderRadius: 15,
    elevation: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
  },
  date: {
    marginVertical: 5,
    color: "#666",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  btn: {
    backgroundColor: COLORS.primaryRed,
    padding: 10,
    borderRadius: 20,
    width: "45%",
    alignItems: "center",
  },
  btnText: {
    color: "#fff",
    fontWeight: "bold",
  },
  disabledBtn: {
    opacity: 0.7,
  },
});

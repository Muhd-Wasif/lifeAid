import React, { useRef, useState } from "react";
import { Alert, Linking, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import * as FileSystem from "expo-file-system/legacy";
import * as MediaLibrary from "expo-media-library";
import { COLORS } from "../constants/themes";

let downloadInProgress = false;

const formatDate = (value) => {
  if (!value) return "-";
  if (value?.toDate) return value.toDate().toLocaleString();

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleString();
};

const getMimeType = (fileName, fileType) => {
  if (fileType) return fileType;

  const extension = (fileName || "").split(".").pop()?.toLowerCase();
  if (extension === "pdf") return "application/pdf";
  if (["jpg", "jpeg"].includes(extension)) return "image/jpeg";
  if (extension === "png") return "image/png";
  return "application/octet-stream";
};

const isImageFile = (mimeType) => mimeType.startsWith("image/");

const escapeHtml = (value) => (
  String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
);

const formatCertificateDate = (value) => {
  if (!value) return "-";
  const date = value?.toDate ? value.toDate() : new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleDateString();
};

const buildCertificateHtml = (certificateData = {}) => {
  const donorName = escapeHtml(certificateData.donorName || "Valued Donor");
  const donationDate = escapeHtml(formatCertificateDate(certificateData.donationDate));
  const patientName = escapeHtml(certificateData.patientName || "a patient");
  const bloodGroup = escapeHtml(certificateData.bloodGroup || "blood");
  const bloodType = escapeHtml(certificateData.bloodType || "blood donation");
  const organizationName = escapeHtml(certificateData.organizationName || "Jamila Sultana Foundation");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Blood Donation Certificate</title>
  <style>
    * {
      box-sizing: border-box;
    }
    html {
      width: 100%;
      min-height: 100%;
      -webkit-text-size-adjust: 100%;
    }
    body {
      margin: 0;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f4f4f4;
      font-family: Georgia, 'Times New Roman', serif;
      color: #1f1f1f;
      padding: clamp(10px, 3vw, 28px);
      overflow-x: hidden;
    }
    .certificate {
      width: min(920px, 100%);
      min-height: min(620px, calc(100vh - 20px));
      background: #fffdf8;
      border: clamp(5px, 1.6vw, 12px) solid #cf0a0a;
      box-shadow: 0 10px 32px rgba(0,0,0,0.18);
      padding: clamp(14px, 4vw, 46px);
      text-align: center;
      position: relative;
    }
    .inner {
      border: 2px solid #d7b46a;
      min-height: clamp(420px, 72vh, 500px);
      padding: clamp(18px, 4vw, 34px);
    }
    .foundation {
      color: #cf0a0a;
      font-size: clamp(20px, 4.6vw, 34px);
      font-weight: 700;
      letter-spacing: 1px;
      text-transform: uppercase;
      margin-bottom: clamp(8px, 2vw, 12px);
      overflow-wrap: anywhere;
    }
    .subtitle {
      font-size: clamp(13px, 2.8vw, 19px);
      margin-bottom: clamp(18px, 4vw, 32px);
    }
    .certificate-title {
      font-size: clamp(25px, 7vw, 46px);
      color: #111;
      margin: clamp(8px, 2vw, 12px) 0 clamp(16px, 4vw, 24px);
      font-weight: 700;
      line-height: 1.1;
    }
    .presented {
      font-size: clamp(13px, 3vw, 18px);
      margin: 8px 0;
    }
    .donor {
      max-width: 100%;
      font-size: clamp(24px, 7vw, 42px);
      color: #cf0a0a;
      font-weight: 700;
      margin: clamp(8px, 2vw, 12px) 0 clamp(12px, 3vw, 18px);
      border-bottom: 2px solid #d7b46a;
      display: inline-block;
      padding: 0 clamp(12px, 4vw, 34px) 8px;
      line-height: 1.15;
      overflow-wrap: anywhere;
    }
    .body {
      font-size: clamp(15px, 3.7vw, 21px);
      line-height: 1.55;
      max-width: 720px;
      margin: 0 auto clamp(20px, 4vw, 34px);
    }
    .details {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      gap: clamp(16px, 4vw, 20px);
      margin-top: clamp(26px, 6vw, 42px);
      padding-right: clamp(0px, 11vw, 92px);
      font-size: clamp(13px, 2.8vw, 17px);
    }
    .line {
      flex: 1 1 240px;
      border-top: 1px solid #333;
      padding-top: 8px;
      min-width: 0;
      overflow-wrap: anywhere;
    }
    .seal {
      position: absolute;
      right: clamp(22px, 6vw, 44px);
      bottom: clamp(18px, 5vw, 36px);
      width: clamp(58px, 14vw, 92px);
      height: clamp(58px, 14vw, 92px);
      border-radius: 50%;
      border: clamp(3px, 0.8vw, 4px) solid #cf0a0a;
      color: #cf0a0a;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: clamp(12px, 3vw, 16px);
      background: rgba(255,253,248,0.92);
    }
    @media (max-width: 520px) {
      body {
        align-items: stretch;
        padding: 8px;
      }
      .certificate {
        min-height: calc(100vh - 16px);
      }
      .inner {
        min-height: calc(100vh - 58px);
        display: flex;
        flex-direction: column;
        justify-content: center;
      }
      .details {
        padding-right: 0;
        margin-bottom: 64px;
      }
      .line {
        flex-basis: 100%;
      }
    }
    @media print {
      body {
        padding: 0;
        background: #fff;
      }
      .certificate {
        width: 100%;
        min-height: 100vh;
        box-shadow: none;
      }
    }
  </style>
</head>
<body>
  <main class="certificate">
    <section class="inner">
      <div class="foundation">${organizationName}</div>
      <div class="subtitle">Thalassemia Free Pakistan</div>
      <div class="certificate-title">Certificate of Appreciation</div>
      <div class="presented">This certificate is proudly presented to</div>
      <div class="donor">${donorName}</div>
      <p class="body">
        In grateful recognition of your ${bloodType} (${bloodGroup}) donation on
        <strong>${donationDate}</strong>. Your generous contribution helped bring hope
        and support to ${patientName}.
      </p>
      <div class="details">
        <div class="line">Date of Donation: ${donationDate}</div>
        <div class="line">Authorized by ${organizationName}</div>
      </div>
    </section>
    <div class="seal">JSF</div>
  </main>
</body>
</html>`;
};

const saveWithFolderPicker = async (sourceUri, safeFileName, mimeType) => {
  if (Platform.OS !== "android" || !FileSystem.StorageAccessFramework) {
    const destination = `${FileSystem.documentDirectory}${safeFileName}`;
    await FileSystem.moveAsync({ from: sourceUri, to: destination });
    return;
  }

  const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

  if (!permissions.granted) {
    throw new Error("Storage folder permission was not granted.");
  }

  const visibleFileUri = await FileSystem.StorageAccessFramework.createFileAsync(
    permissions.directoryUri,
    safeFileName,
    mimeType
  );

  const base64File = await FileSystem.readAsStringAsync(sourceUri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  await FileSystem.StorageAccessFramework.writeAsStringAsync(visibleFileUri, base64File, {
    encoding: FileSystem.EncodingType.Base64,
  });
};

const ReportCard = ({ title, desc, fileUrl, fileName, fileType, reportDate, certificateData, reportKind }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const downloadLockRef = useRef(false);
  const isCertificate = reportKind === "donationCertificate" || !!certificateData;

  const writeCertificateFile = async () => {
    const safeFileName = (fileName || `${title || "certificate"}.html`).replace(/[^\w.\-]/g, "_");
    const destination = `${FileSystem.cacheDirectory}${Date.now()}_${safeFileName}`;

    await FileSystem.writeAsStringAsync(destination, buildCertificateHtml(certificateData));

    return { uri: destination, safeFileName, mimeType: "text/html" };
  };

  const openReport = async () => {
    if (isCertificate) {
      try {
        const { uri } = await writeCertificateFile();
        const openUri = Platform.OS === "android" && FileSystem.getContentUriAsync
          ? await FileSystem.getContentUriAsync(uri)
          : uri;
        await Linking.openURL(openUri);
      } catch (error) {
        console.error("Error opening certificate:", error);
        Alert.alert("Error", "Unable to open this certificate.");
      }
      return;
    }

    if (!fileUrl) {
      Alert.alert("No File", "This report does not have an uploaded file.");
      return;
    }

    try {
      await Linking.openURL(fileUrl);
    } catch (error) {
      console.error("Error opening report:", error);
      Alert.alert("Error", "Unable to open this report.");
    }
  };

  const downloadReport = async () => {
    if (downloadLockRef.current || downloadInProgress) return;

    if (!isCertificate && !fileUrl) {
      Alert.alert("No File", "This report does not have an uploaded file.");
      return;
    }

    downloadLockRef.current = true;
    downloadInProgress = true;
    setIsDownloading(true);

    try {
      const generatedFile = isCertificate ? await writeCertificateFile() : null;
      const safeFileName = generatedFile?.safeFileName || (fileName || `${title || "report"}.pdf`).replace(/[^\w.\-]/g, "_");
      const mimeType = generatedFile?.mimeType || getMimeType(safeFileName, fileType);
      const tempDestination = `${FileSystem.cacheDirectory}${Date.now()}_${safeFileName}`;
      const result = generatedFile || await FileSystem.downloadAsync(fileUrl, tempDestination);

      if (!generatedFile && (result.status < 200 || result.status >= 300)) {
        throw new Error(`Download failed with status ${result.status}`);
      }

      if (isImageFile(mimeType)) {
        try {
          const permission = await MediaLibrary.requestPermissionsAsync(true, ["photo"]);

          if (!permission.granted) {
            Alert.alert("Permission Required", "Please choose a folder to save this image in mobile storage.");
            await saveWithFolderPicker(result.uri, safeFileName, mimeType);
          } else {
            await MediaLibrary.createAssetAsync(result.uri);
          }
        } catch (mediaError) {
          console.warn("Media library save unavailable, using folder picker:", mediaError?.message);
          Alert.alert("Choose Folder", "Expo Go cannot save directly to Gallery on this Android version. Please choose a folder to save this image.");
          await saveWithFolderPicker(result.uri, safeFileName, mimeType);
        }
      } else {
        await saveWithFolderPicker(result.uri, safeFileName, mimeType);
      }

      Alert.alert("Downloaded", `${isCertificate ? "Certificate" : "Report"} downloaded successfully.`);
    } catch (error) {
      console.error("Error downloading report:", error);
      Alert.alert("Error", `Unable to download this ${isCertificate ? "certificate" : "report"}.`);
    } finally {
      downloadLockRef.current = false;
      downloadInProgress = false;
      setIsDownloading(false);
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title || (isCertificate ? "Certificate" : "Report")}</Text>
      {!!desc && <Text style={styles.desc}>{desc}</Text>}
      <Text style={styles.date}>Date: {formatDate(reportDate)}</Text>

      <View style={styles.row}>
        <TouchableOpacity style={styles.btn} onPress={openReport}>
          <Text style={styles.btnText}>View</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, isDownloading && styles.disabledBtn]}
          onPress={downloadReport}
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
  desc: {
    marginTop: 4,
    color: "#333",
  },
  date: {
    marginVertical: 8,
    color: "#666",
  },
  row: {
    flexDirection: "row",
    gap: 10,
  },
  btn: {
    flex: 1,
    backgroundColor: COLORS.primaryRed,
    padding: 10,
    borderRadius: 20,
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

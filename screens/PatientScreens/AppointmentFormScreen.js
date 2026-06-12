import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ImageBackground,
} from "react-native";
import { Calendar } from "react-native-calendars";
import { Ionicons as Icon } from "@expo/vector-icons";
import { COLORS } from "../../constants/themes";
import { getAuth } from "firebase/auth";
import {
  addDoc,
  collection,
  onSnapshot,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { db } from "../../config";

export default function AppointmentFormScreen({ route, navigation }) {
  const { doctor, doctorImage, appointments = {} } = route.params || {};

  const today = new Date().toISOString().split("T")[0];

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [cnic, setCnic] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [doctorAppointments, setDoctorAppointments] = useState(
    doctor?.name ? appointments[doctor.name] || [] : []
  );

  const weeklyOffDays = [0]; // Sunday off
  const holidays = ["2026-01-10", "2026-01-15"];
  const parseDoctorTiming = (timingText = "") => {
    const matches = timingText.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/gi) || [];
    const toTwentyFourHour = (value) => {
      const match = value.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
      if (!match) return null;
      let hour = Number(match[1]);
      const minute = Number(match[2] || 0);
      const period = match[3]?.toLowerCase();

      if (period === "pm" && hour < 12) hour += 12;
      if (period === "am" && hour === 12) hour = 0;

      return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
    };

    const start = toTwentyFourHour(matches[0]) || "09:00";
    const end = toTwentyFourHour(matches[1]) || "13:00";
    return { start, end, gap: 30 };
  };
  const doctorTiming = parseDoctorTiming(doctor?.timing);
  const resolvedDoctorImage = doctorImage || (
    doctor?.image || doctor?.imageUrl || doctor?.profilePicture
      ? { uri: doctor.image || doctor.imageUrl || doctor.profilePicture }
      : require("../../assets/images/Dr_akramullah_image.jpg")
  );

  useEffect(() => {
    const appointmentsQuery = query(
      collection(db, "appointments"),
      where("doctorName", "==", doctor?.name || "")
    );

    const unsubscribe = onSnapshot(
      appointmentsQuery,
      (snapshot) => {
        const fetchedAppointments = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));
        setDoctorAppointments(fetchedAppointments);
      },
      (error) => {
        console.error("Error fetching doctor appointments:", error);
      }
    );

    return () => unsubscribe();
  }, [doctor?.name]);

  const isHoliday = (date) => holidays.includes(date);
  const isWeeklyOff = (date) => weeklyOffDays.includes(new Date(date).getDay());
  const isSlotBooked = (time) =>
    doctorAppointments.some((a) => a.date === selectedDate && a.time === time);

  const generateSlots = () => {
    const slots = [];
    let start = new Date(`1970-01-01T${doctorTiming.start}:00`);
    const end = new Date(`1970-01-01T${doctorTiming.end}:00`);

    while (start < end) {
      slots.push(
        start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      );
      start.setMinutes(start.getMinutes() + doctorTiming.gap);
    }
    return slots;
  };

  const timeSlots = generateSlots();

  const markedDates = { [selectedDate]: { selected: true, selectedColor: "#D60000" } };
  holidays.forEach((date) => {
    markedDates[date] = { disabled: true, disableTouchEvent: true };
  });

  const handleConfirm = async () => {
    if (!firstName || !lastName || !cnic || !selectedDate || !selectedTime) {
      alert("Please fill all fields and select date & time");
      return;
    }

    const auth = getAuth();
    const user = auth.currentUser;
    if (!doctor?.name) {
      alert("Doctor information is missing. Please select doctor again.");
      navigation.goBack();
      return;
    }
    const newAppointment = {
      firstName,
      lastName,
      cnic,
      date: selectedDate,
      time: selectedTime,
      doctor: doctor.name,
      doctorName: doctor.name,
      doctorDegree: doctor.degree,
      doctorUid: doctor.authUid || doctor.uid || null,
      doctorId: doctor.id || null,
      doctorEmail: doctor.email || null,
      patientUid: user?.uid || null,
      patientEmail: user?.email || null,
      status: "booked",
      visitStatus: "pending",
      doctorNotification: true,
      createdAt: serverTimestamp(),
    };

    try {
      await addDoc(collection(db, "appointments"), newAppointment);

      alert("Appointment booked successfully!");
      navigation.navigate("Home");
    } catch (error) {
      console.error("Error booking appointment:", error);
      alert("Unable to book appointment. Please try again.");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ImageBackground
          source={require("../../assets/appointment_form_screen_bg.jpg")}
          style={styles.background}
          resizeMode="cover"
        >
          <ScrollView
            style={styles.container}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <TouchableOpacity
              style={styles.backArrow}
              onPress={() => navigation.goBack()}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <Icon name="arrow-back-outline" size={28} color={COLORS.primaryRed} />
            </TouchableOpacity>

            {/* Doctor Info */}
            {/* <View style={styles.doctorCard}>
        <Image source={doctor.image} style={styles.doctorImage} />
        <View>
          <Text style={styles.doctorName}>{doctor.name}</Text>
          <Text style={styles.doctorDegree}>{doctor.degree}</Text>
          <Text style={styles.timing}>{doctor.timing}</Text>
        </View>
      </View> */}

            <View
              style={styles.doctorSummary}
            >
              <Image
                source={resolvedDoctorImage}
                style={styles.doctorImage}
              />

              <View style={styles.doctorInfoCard}>
                <Text style={styles.doctorName}>
                  {doctor?.name || "Doctor"}
                </Text>
                <Text style={styles.doctorDegree}>
                  {doctor?.degree || "-"}
                </Text>
                <Text style={styles.timing}>
                  {doctor?.timing || "-"}
                </Text>
              </View>
            </View>



            <View style={styles.formCard}>
              <Text style={styles.sectionTitle}>Patient Details</Text>

              <Text style={styles.label}>First Name</Text>
              <TextInput
                style={styles.input}
                value={firstName}
                onChangeText={setFirstName}
                placeholder="Enter first name"
                placeholderTextColor="#9a9a9a"
              />

              <Text style={styles.label}>Last Name</Text>
              <TextInput
                style={styles.input}
                value={lastName}
                onChangeText={setLastName}
                placeholder="Enter last name"
                placeholderTextColor="#9a9a9a"
              />

              <Text style={styles.label}>CNIC</Text>
              <TextInput
                style={styles.input}
                value={cnic}
                onChangeText={setCnic}
                placeholder="Enter CNIC"
                placeholderTextColor="#9a9a9a"
                keyboardType="number-pad"
              />
            </View>

            <View style={styles.formCard}>
              <Text style={styles.sectionTitle}>Appointment Date</Text>
              <Calendar
                minDate={today}
                markedDates={markedDates}
                onDayPress={(day) => {
                  if (isHoliday(day.dateString) || isWeeklyOff(day.dateString)) return;
                  setSelectedDate(day.dateString);
                  setSelectedTime("");
                }}
                style={styles.calendar}
                theme={{
                  todayTextColor: COLORS.primaryRed,
                  arrowColor: COLORS.primaryRed,
                  selectedDayBackgroundColor: COLORS.primaryRed,
                  textDayFontWeight: "500",
                  textMonthFontWeight: "700",
                  textDayHeaderFontWeight: "600",
                }}
              />
            </View>

            {selectedDate && isWeeklyOff(selectedDate) && (
              <Text style={styles.infoText}>Doctor is not available on this day</Text>
            )}

            <View style={styles.formCard}>
              <Text style={styles.sectionTitle}>Select Time</Text>
              <View style={styles.timeContainer}>
                {selectedDate &&
                  !isHoliday(selectedDate) &&
                  !isWeeklyOff(selectedDate) &&
                  timeSlots.map((time) => {
                    const booked = isSlotBooked(time);
                    return (
                      <TouchableOpacity
                        key={time}
                        disabled={booked}
                        onPress={() => setSelectedTime(time)}
                        style={[
                          styles.timeSlot,
                          booked && styles.timeSlotBooked,
                          selectedTime === time && styles.timeSlotSelected,
                        ]}
                      >
                        <Text
                          style={[
                            styles.timeText,
                            booked && styles.timeTextBooked,
                            selectedTime === time && styles.timeTextSelected,
                          ]}
                        >
                          {booked ? "Booked" : time}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                {!selectedDate && (
                  <Text style={styles.emptySlotText}>Select a date to view available slots.</Text>
                )}
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.confirmBtn,
                (!selectedDate || !selectedTime) && { opacity: 0.6 },
              ]}
              disabled={!selectedDate || !selectedTime}
              onPress={handleConfirm}
            >
              <Text style={styles.confirmText}>Confirm</Text>
            </TouchableOpacity>
          </ScrollView>
        </ImageBackground>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, padding: 16 },
  scrollContent: { paddingBottom: 40 },
  background: { flex: 1, width: "100%", height: "100%" },

  backArrow: {
    marginBottom: 16,
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.88)",
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
  },

  doctorSummary: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
    marginBottom: 14,
    gap: 10,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: "#f0d7d7",
    elevation: 3,
  },

  doctorImage: {
    width: 118,
    height: 118,
    borderRadius: 16,
    backgroundColor: "#eee",
  },

  doctorInfoCard: {
    flex: 1,
    backgroundColor: "#fcf4f4ff",
    borderRadius: 16,
    padding: 12,
    justifyContent: "center",
    minHeight: 112,
  },

  doctorName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },

  doctorDegree: {
    fontSize: 14,
    color: "#555",
    marginTop: 2,
  },

  timing: {
    fontSize: 12,
    color: "#777",
    marginTop: 4,
  },

  formCard: {
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 18,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#f0d7d7",
    elevation: 3,
  },
  sectionTitle: {
    color: COLORS.primaryRed,
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  label: { color: "#C40000", fontWeight: "600", marginTop: 8, marginBottom: 6 },
  input: {
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e7c8c8",
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 8,
    color: "#111",
  },
  infoText: { color: "red", marginVertical: 10 },
  timeContainer: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  timeSlot: { width: "48%", backgroundColor: "#fff", borderRadius: 14, paddingVertical: 12, marginBottom: 10, alignItems: "center", borderWidth: 1, borderColor: "#e7c8c8" },
  timeSlotSelected: { backgroundColor: "#D60000", borderColor: "#D60000" },
  timeSlotBooked: { backgroundColor: "#eee" },
  timeText: { color: "#333" },
  timeTextSelected: { color: "#fff" },
  timeTextBooked: { color: "#999" },
  emptySlotText: { color: "#666", lineHeight: 20 },
  calendar: {
    borderRadius: 14,
    overflow: "hidden",
  },
  confirmBtn: { backgroundColor: "#D60000", paddingVertical: 15, borderRadius: 15, marginTop: 20, alignItems: "center" },
  confirmText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
});

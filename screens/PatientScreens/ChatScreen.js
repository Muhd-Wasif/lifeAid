import React, { useEffect, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons as Icon } from "@expo/vector-icons";
import { getAuth } from "firebase/auth";
import {
  addDoc,
  collection,
  onSnapshot,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { COLORS } from "../../constants/themes";
import { db } from "../../config";

const BOT_UID = "lifeaid-support-bot";

const getBotReply = (text) => {
  const message = text.toLowerCase();

  if (/(hi|hello|hey|salam|assalam)/.test(message)) {
    return "Hello! I am LifeAid support bot. You can ask about blood requests, appointments, reports, events, donors, or app help.";
  }

  if (/(urgent|emergency|need blood|blood request|request blood|create request)/.test(message)) {
    return "For urgent blood help, open Request from the bottom menu, fill patient details, select blood type/group, and submit. Matching donors will be notified automatically.";
  }

  if (/(appointment|doctor|book|schedule)/.test(message)) {
    return "To book an appointment, go to Home > Book Appointment, choose a doctor, select date and time, then confirm your booking.";
  }

  if (/(report|medical report|lab|test)/.test(message)) {
    return "You can view reports from Home > View Reports. If a report is missing, please contact the admin or clinic staff.";
  }

  if (/(donor|donate|blood donate|become donor)/.test(message)) {
    return "To become a donor, use the donor module and complete your donor information. Admin can also view donors by blood group.";
  }

  if (/(event|camp|blood camp|campaign)/.test(message)) {
    return "You can see upcoming blood camps from the Events page. Open Events from the home screen or bottom menu.";
  }

  if (/(notification|alert|bell)/.test(message)) {
    return "Notifications appear from the bell icon. Once you open the notification screen, unread notifications are marked as read.";
  }

  if (/(map|location|nearby|where)/.test(message)) {
    return "Use the Map page to view location features. Make sure location permission is allowed on your phone.";
  }

  if (/(password|login|signin|sign in|account)/.test(message)) {
    return "For login issues, check your email/phone and password. Patients created by admin use CNIC as password unless changed.";
  }

  if (/(thank|thanks|ok|okay)/.test(message)) {
    return "You are welcome. I am here if you need more help.";
  }

  return "I can help you with blood requests, appointments, reports, events, donor information, notifications, login, and app navigation. Please tell me what you need.";
};

const ChatScreen = ({ navigation }) => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [isBotTyping, setIsBotTyping] = useState(false);
  const user = getAuth().currentUser;
  const roomId = user?.uid ? `patient-support-${user.uid}` : "patient-support";

  useEffect(() => {
    const messagesQuery = query(
      collection(db, "chats"),
      where("roomId", "==", roomId)
    );

    const unsubscribe = onSnapshot(
      messagesQuery,
      (snapshot) => {
        const fetchedMessages = snapshot.docs
          .map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
          .sort((a, b) => {
            const aTime = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
            const bTime = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
            return aTime - bTime;
          });

        setMessages(fetchedMessages);
      },
      (error) => {
        console.error("Error fetching chat messages:", error);
      }
    );

    return () => unsubscribe();
  }, [roomId]);

  const sendMessage = async () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage) return;

    const auth = getAuth();
    const user = auth.currentUser;

    try {
      await addDoc(collection(db, "chats"), {
        roomId,
        text: trimmedMessage,
        senderUid: user?.uid || null,
        senderEmail: user?.email || null,
        senderName: user?.displayName || user?.email || "Patient",
        createdAt: serverTimestamp(),
      });
      setMessage("");
      setIsBotTyping(true);

      setTimeout(async () => {
        try {
          await addDoc(collection(db, "chats"), {
            roomId,
            text: getBotReply(trimmedMessage),
            senderUid: BOT_UID,
            senderEmail: null,
            senderName: "LifeAid Bot",
            createdAt: serverTimestamp(),
          });
        } catch (error) {
          console.error("Error sending bot reply:", error);
        } finally {
          setIsBotTyping(false);
        }
      }, 700);
    } catch (error) {
      console.error("Error sending chat message:", error);
      alert("Unable to send message. Please try again.");
    }
  };

  const renderMessage = ({ item }) => {
    const auth = getAuth();
    const isMine = item.senderUid && item.senderUid === auth.currentUser?.uid;
    const isBot = item.senderUid === BOT_UID;

    return (
      <View style={[
        styles.messageBubble,
        isMine && styles.myMessageBubble,
        isBot && styles.botMessageBubble,
      ]}>
        <Text style={[
          styles.messageSender,
          isMine && styles.myMessageText,
          isBot && styles.botSender,
        ]}>
          {item.senderName || "User"}
        </Text>
        <Text style={[styles.messageText, isMine && styles.myMessageText]}>
          {item.text}
        </Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back-outline" size={28} color={COLORS.primaryRed} />
        </TouchableOpacity>
        <Text style={styles.title}>Chat</Text>
      </View>

      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messageList}
        ListEmptyComponent={<Text style={styles.emptyText}>Ask LifeAid Bot anything about the app.</Text>}
      />

      {isBotTyping && (
        <Text style={styles.typingText}>LifeAid Bot is typing...</Text>
      )}

      <View style={styles.inputRow}>
        <TextInput
          value={message}
          onChangeText={setMessage}
          placeholder="Type message"
          style={styles.input}
          multiline
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Icon name="send" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backButton: {
    marginRight: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#000",
  },
  messageList: {
    padding: 16,
  },
  messageBubble: {
    alignSelf: "flex-start",
    maxWidth: "80%",
    backgroundColor: "#f2f2f2",
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
  },
  myMessageBubble: {
    alignSelf: "flex-end",
    backgroundColor: COLORS.primaryRed,
  },
  botMessageBubble: {
    backgroundColor: "#fff4f4",
    borderWidth: 1,
    borderColor: "#f3cccc",
  },
  messageSender: {
    fontSize: 11,
    color: "#555",
    marginBottom: 3,
  },
  botSender: {
    color: COLORS.primaryRed,
    fontWeight: "bold",
  },
  messageText: {
    color: "#111",
  },
  myMessageText: {
    color: "#fff",
  },
  emptyText: {
    textAlign: "center",
    color: "#777",
    marginTop: 30,
  },
  typingText: {
    color: "#777",
    fontSize: 12,
    marginHorizontal: 16,
    marginBottom: 6,
    fontStyle: "italic",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  input: {
    flex: 1,
    maxHeight: 100,
    backgroundColor: "#f5f5f5",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  sendButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.primaryRed,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
  },
});

export default ChatScreen;

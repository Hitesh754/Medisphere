import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { useState } from "react";

export default function ChatBot() {
  const [open, setOpen] = useState(false);

  return (
    <View style={styles.wrapper} pointerEvents="box-none">
      {open && (
        <View style={styles.chatBox}>
          <Text>Hi 👋 I'm MediSphere Bot</Text>
          <Text>Ask about medicines, reports, etc.</Text>
        </View>
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setOpen(!open)}
      >
        <Text style={{ color: "#fff", fontWeight: "bold" }}>💬</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    bottom: 80,
    right: 20,
    zIndex: 999,
  },
  fab: {
    backgroundColor: "#2563EB",
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  chatBox: {
    position: "absolute",
    bottom: 70,
    right: 0,
    width: 250,
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    elevation: 5,
  },
});
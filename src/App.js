import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const JournalView = () => {
  const [journalText, setJournalText] = useState("");
  const [entries, setEntries] = useState([]);
  const [tracker, setTracker] = useState({});

  useEffect(() => {
    loadEntries();
  }, []);

  // Load entries and tracker from AsyncStorage when app starts
  const loadEntries = async () => {
    try {
      const storedEntries = await AsyncStorage.getItem("entries");
      const storedTracker = await AsyncStorage.getItem("tracker");
      if (storedEntries) setEntries(JSON.parse(storedEntries));
      if (storedTracker) setTracker(JSON.parse(storedTracker));
    } catch (error) {
      console.error("Failed to load entries", error);
    }
  };

  // Save a new journal entry and update the daily tracker
  const addNewEntry = async () => {
    const today = new Date().toISOString().split("T")[0]; // Format: YYYY-MM-DD
    const newEntry = { date: today, text: journalText };

    const updatedEntries = [...entries, newEntry];
    const updatedTracker = { ...tracker, [today]: true };

    setEntries(updatedEntries);
    setTracker(updatedTracker);
    setJournalText("");

    try {
      await AsyncStorage.setItem("entries", JSON.stringify(updatedEntries));
      await AsyncStorage.setItem("tracker", JSON.stringify(updatedTracker));
    } catch (error) {
      console.error("Failed to save entry", error);
    }
  };

  // Render a calendar grid for the current month, with checked days if there's an entry
  const renderCalendar = () => {
    const daysInMonth = new Date(
      new Date().getFullYear(),
      new Date().getMonth() + 1,
      0
    ).getDate();
    const today = new Date();
    const yearMonth = today.toISOString().slice(0, 7); // Format: YYYY-MM

    return Array.from({ length: daysInMonth }, (_, index) => {
      const day = (index + 1).toString().padStart(2, "0");
      const dateKey = `${yearMonth}-${day}`;

      return (
        <View key={dateKey} style={styles.calendarDay}>
          <Text style={[styles.dayText, tracker[dateKey] && styles.checkedDay]}>
            {index + 1}
          </Text>
        </View>
      );
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Journal Entry</Text>

      <TextInput
        style={styles.journalInput}
        placeholder="Write your thoughts here..."
        value={journalText}
        onChangeText={setJournalText}
        multiline
      />

      <TouchableOpacity style={styles.addBtn} onPress={addNewEntry}>
        <Text style={styles.addBtnText}>Add New Entry</Text>
      </TouchableOpacity>

      <Text style={styles.trackerTitle}>Daily Entry Tracker</Text>
      <View style={styles.calendarContainer}>{renderCalendar()}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  journalInput: {
    height: 100,
    borderColor: "#ccc",
    borderWidth: 1,
    padding: 10,
    marginBottom: 20,
    textAlignVertical: "top",
  },
  addBtn: {
    backgroundColor: "#4CAF50",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
  },
  addBtnText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  trackerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  calendarContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  calendarDay: {
    width: "14%", // 7 days per row
    alignItems: "center",
    marginBottom: 10,
  },
  dayText: {
    fontSize: 16,
    padding: 10,
    backgroundColor: "#e0e0e0",
    borderRadius: 20,
    textAlign: "center",
  },
  checkedDay: {
    backgroundColor: "#4CAF50",
    color: "#fff",
  },
});

export default JournalView;

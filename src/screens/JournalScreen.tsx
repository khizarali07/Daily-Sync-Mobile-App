import React, { useState, useEffect, useCallback } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList,
  Alert, ActivityIndicator, RefreshControl, TextInput, Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { aiApi } from "../services/api";

const { width } = Dimensions.get("window");

interface JournalEntry {
  id: string;
  date: string;
  content: string;
  stats?: { completed: number; total: number; categories: string[] };
}

export default function JournalScreen() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [genDate, setGenDate] = useState("");

  const fetchEntries = useCallback(async () => {
    try {
      const data = await aiApi.getJournals();
      // Backend returns { success: true, data: [...] }
      setEntries(data.data || []);
    } catch (e) {} finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { fetchEntries(); }, [fetchEntries]);

  const handleGenerate = async () => {
    if (!genDate.trim()) {
      const today = new Date().toISOString().split("T")[0];
      setGenDate(today);
      return;
    }
    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(genDate)) {
      Alert.alert("Invalid Date", "Please use YYYY-MM-DD format");
      return;
    }
    setGenerating(true);
    try {
      const data = await aiApi.generateSummary(genDate);
      Alert.alert("Generated!", "Your AI diary entry has been created");
      setGenDate("");
      fetchEntries();
    } catch (e: any) {
      Alert.alert("Error", e.response?.data?.error || "Failed to generate");
    } finally { setGenerating(false); }
  };

  const viewEntry = async (date: string) => {
    try {
      // Backend returns { success: true, data: dailyLogObj }
      setSelectedEntry(data.dataournal(date);
      setSelectedEntry(data.journal);
    } catch (e) { Alert.alert("Error", "Failed to load entry"); }
  };

  const formatDate = (d: string) => {
    const date = new Date(d);
    return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  };

  const getDayEmoji = (d: string) => {
    const day = new Date(d).getDay();
    return ["🌙", "🌅", "💫", "🌊", "⚡", "🎯", "☀️"][day];
  };

  if (selectedEntry) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <LinearGradient colors={["#8b5cf6", "#6d28d9"]} style={styles.header} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <TouchableOpacity style={styles.backBtn} onPress={() => setSelectedEntry(null)}>
              <Text style={styles.backText}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>📖 Diary</Text>
            <Text style={styles.headerSub}>{formatDate(selectedEntry.date)}</Text>
          </LinearGradient>

          {/* Stats */}
          {selectedEntry.stats && (
            <View style={styles.statsRow}>
              <View style={styles.statBadge}>
                <Text style={styles.statBadgeText}>
                  ✅ {selectedEntry.stats.completed}/{selectedEntry.stats.total} tasks
                </Text>
              </View>
              {selectedEntry.stats.categories?.map((c, i) => (
                <View key={i} style={[styles.statBadge, styles.catBadge]}>
                  <Text style={styles.catBadgeText}>{c}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Content */}
          <View style={styles.contentCard}>
            <Text style={styles.contentText}>{selectedEntry.content}</Text>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchEntries(); }} />}
      >
        {/* Header */}
        <LinearGradient colors={["#8b5cf6", "#6d28d9"]} style={styles.header} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <Text style={styles.headerEmoji}>📖</Text>
          <Text style={styles.headerTitle}>AI Journal</Text>
          <Text style={styles.headerSub}>AI-powered daily diary entries</Text>
        </LinearGradient>

        {/* Generate section */}
        <View style={styles.generateCard}>
          <View style={styles.genHeader}>
            <Text style={styles.genIcon}>✨</Text>
            <View>
              <Text style={styles.genTitle}>Generate Diary Entry</Text>
              <Text style={styles.genSub}>AI summarizes your day based on tasks</Text>
            </View>
          </View>

          <View style={styles.genInputRow}>
            <TextInput
              style={styles.genInput}
              placeholder="YYYY-MM-DD (tap Generate for today)"
              placeholderTextColor="#94a3b8"
              value={genDate}
              onChangeText={setGenDate}
            />
            <TouchableOpacity onPress={handleGenerate} disabled={generating}>
              <LinearGradient colors={["#8b5cf6", "#6d28d9"]} style={styles.genBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                {generating ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.genBtnText}>Generate</Text>}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Entries list */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Past Entries</Text>

          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color="#8b5cf6" />
            </View>
          ) : entries.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyIcon}>📝</Text>
              <Text style={styles.emptyTitle}>No entries yet</Text>
              <Text style={styles.emptySub}>Generate your first AI diary entry above</Text>
            </View>
          ) : (
            entries.map((entry, i) => (
              <TouchableOpacity
                key={entry.id || i}
                style={styles.entryCard}
                onPress={() => viewEntry(entry.date)}
                activeOpacity={0.7}
              >
                <View style={styles.entryLeft}>
                  <Text style={styles.entryEmoji}>{getDayEmoji(entry.date)}</Text>
                </View>
                <View style={styles.entryBody}>
                  <Text style={styles.entryDate}>{formatDate(entry.date)}</Text>
                  <Text style={styles.entryPreview} numberOfLines={2}>
                    {entry.content?.substring(0, 100)}...
                  </Text>
                  {entry.stats && (
                    <Text style={styles.entryStats}>
                      ✅ {entry.stats.completed}/{entry.stats.total} tasks
                    </Text>
                  )}
                </View>
                <Text style={styles.entryArrow}>›</Text>
              </TouchableOpacity>
            ))
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  header: { paddingTop: 20, paddingBottom: 44, paddingHorizontal: 24, borderBottomLeftRadius: 28, borderBottomRightRadius: 28, alignItems: "center" },
  headerEmoji: { fontSize: 36, marginBottom: 8 },
  headerTitle: { fontSize: 28, fontWeight: "800", color: "#fff" },
  headerSub: { fontSize: 14, color: "rgba(255,255,255,0.8)", marginTop: 4 },
  backBtn: { alignSelf: "flex-start", marginBottom: 8 },
  backText: { color: "rgba(255,255,255,0.9)", fontSize: 16, fontWeight: "600" },
  generateCard: { marginHorizontal: 20, marginTop: -20, backgroundColor: "#fff", borderRadius: 20, padding: 20, shadowColor: "#0f172a", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 4 },
  genHeader: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 16 },
  genIcon: { fontSize: 28 },
  genTitle: { fontSize: 17, fontWeight: "800", color: "#0f172a" },
  genSub: { fontSize: 13, color: "#64748b" },
  genInputRow: { flexDirection: "row", gap: 10 },
  genInput: { flex: 1, backgroundColor: "#f8fafc", borderWidth: 1.5, borderColor: "#e2e8f0", borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: "#0f172a" },
  genBtn: { paddingHorizontal: 20, paddingVertical: 14, borderRadius: 14, justifyContent: "center" },
  genBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  section: { paddingHorizontal: 20, marginTop: 24 },
  sectionTitle: { fontSize: 16, fontWeight: "800", color: "#0f172a", marginBottom: 12 },
  loadingBox: { padding: 40, alignItems: "center" },
  emptyCard: { backgroundColor: "#fff", borderRadius: 20, padding: 40, alignItems: "center" },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 20, fontWeight: "700", color: "#0f172a" },
  emptySub: { fontSize: 14, color: "#64748b", marginTop: 4 },
  entryCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderRadius: 18, padding: 16, marginBottom: 10, shadowColor: "#0f172a", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  entryLeft: { width: 48, height: 48, borderRadius: 14, backgroundColor: "#f5f3ff", justifyContent: "center", alignItems: "center", marginRight: 14 },
  entryEmoji: { fontSize: 22 },
  entryBody: { flex: 1 },
  entryDate: { fontSize: 14, fontWeight: "700", color: "#0f172a" },
  entryPreview: { fontSize: 13, color: "#64748b", marginTop: 3, lineHeight: 18 },
  entryStats: { fontSize: 12, color: "#8b5cf6", fontWeight: "600", marginTop: 4 },
  entryArrow: { fontSize: 24, color: "#cbd5e1" },
  statsRow: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 20, marginTop: 16, gap: 8 },
  statBadge: { backgroundColor: "#f0fdf4", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  statBadgeText: { fontSize: 13, fontWeight: "700", color: "#16a34a" },
  catBadge: { backgroundColor: "#f5f3ff" },
  catBadgeText: { fontSize: 13, fontWeight: "700", color: "#7c3aed" },
  contentCard: { marginHorizontal: 20, marginTop: 16, backgroundColor: "#fff", borderRadius: 20, padding: 24 },
  contentText: { fontSize: 15, color: "#334155", lineHeight: 26 },
});

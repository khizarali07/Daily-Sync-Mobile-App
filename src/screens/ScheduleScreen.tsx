import React, { useState, useEffect, useCallback } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList,
  Alert, ActivityIndicator, RefreshControl, Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { scheduleApi } from "../services/api";

const { width } = Dimensions.get("window");

const categoryColors: Record<string, { bg: string; text: string }> = {
  Prayer: { bg: "#f5f3ff", text: "#7c3aed" },
  Workout: { bg: "#fef2f2", text: "#ef4444" },
  Study: { bg: "#eff6ff", text: "#3b82f6" },
  Food: { bg: "#f0fdf4", text: "#16a34a" },
  Work: { bg: "#fffbeb", text: "#d97706" },
  Health: { bg: "#fdf2f8", text: "#db2777" },
};

const dayMap: Record<string, string> = {
  Monday: "Mon", Tuesday: "Tue", Wednesday: "Wed", Thursday: "Thu",
  Friday: "Fri", Saturday: "Sat", Sunday: "Sun",
};

interface Template {
  id: string;
  name: string;
  time: string;
  category?: string;
  daysOfWeek: number[];
}

export default function ScheduleScreen({ navigation }: any) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTemplates = useCallback(async () => {
    try {
      const data = await scheduleApi.getTemplates();
      setTemplates(data.templates || []);
    } catch (e) {} finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { fetchTemplates(); }, [fetchTemplates]);

  const handleDelete = (id: string, name: string) => {
    Alert.alert("Delete Template", `Remove "${name}" from your schedule?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete", style: "destructive",
        onPress: async () => {
          try {
            await scheduleApi.deleteTemplate(id);
            setTemplates(prev => prev.filter(t => t.id !== id));
          } catch (e) { Alert.alert("Error", "Failed to delete"); }
        }
      }
    ]);
  };

  const formatTime = (time: string) => {
    const [h, m] = time.split(":");
    const hour = parseInt(h, 10);
    return `${hour % 12 || 12}:${m} ${hour >= 12 ? "PM" : "AM"}`;
  };

  const sorted = [...templates].sort((a, b) => a.time.localeCompare(b.time));
  const categories = [...new Set(templates.map(t => t.category).filter(Boolean))];

  if (loading) return <SafeAreaView style={styles.container}><View style={styles.center}><ActivityIndicator size="large" color="#0ea5e9" /></View></SafeAreaView>;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchTemplates(); }} />}
      >
        {/* Header */}
        <LinearGradient colors={["#0ea5e9", "#3b82f6"]} style={styles.header} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerEmoji}>📅</Text>
          <Text style={styles.headerTitle}>My Schedule</Text>
          <Text style={styles.headerSub}>Manage your task templates</Text>
        </LinearGradient>

        {/* Info card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoIcon}>💡</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.infoTitle}>About Templates</Text>
            <Text style={styles.infoText}>
              Templates are your recurring tasks. Upload a CSV from the web dashboard to add more.
            </Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{templates.length}</Text>
            <Text style={styles.statLabel}>Templates</Text>
          </View>
          <View style={[styles.statItem, styles.statDivider]}>
            <Text style={styles.statValue}>{categories.length}</Text>
            <Text style={styles.statLabel}>Categories</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>7</Text>
            <Text style={styles.statLabel}>Days</Text>
          </View>
        </View>

        {/* Templates */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Templates ({templates.length})</Text>

          {sorted.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={styles.emptyTitle}>No templates</Text>
              <Text style={styles.emptySub}>Upload a CSV from the web dashboard to create schedule templates</Text>
            </View>
          ) : (
            sorted.map((t) => {
              const cc = categoryColors[t.category || ""] || { bg: "#f8fafc", text: "#64748b" };
              return (
                <View key={t.id} style={styles.templateCard}>
                  <View style={styles.templateTop}>
                    <View style={[styles.catBadge, { backgroundColor: cc.bg }]}>
                      <Text style={[styles.catText, { color: cc.text }]}>{t.category || "General"}</Text>
                    </View>
                    <TouchableOpacity onPress={() => handleDelete(t.id, t.name)}>
                      <Text style={styles.deleteBtn}>✕</Text>
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.templateName}>{t.name}</Text>
                  <Text style={styles.templateTime}>🕐 {formatTime(t.time)}</Text>

                  {/* Day chips */}
                  <View style={styles.daysRow}>
                    {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day, idx) => {
                      const active = t.daysOfWeek.includes(idx);
                      return (
                        <View key={day} style={[styles.dayChip, active && { backgroundColor: cc.bg, borderColor: cc.text }]}>
                          <Text style={[styles.dayText, active && { color: cc.text, fontWeight: "700" }]}>{dayMap[day]}</Text>
                        </View>
                      );
                    })}
                  </View>
                </View>
              );
            })
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { paddingTop: 16, paddingBottom: 44, paddingHorizontal: 24, borderBottomLeftRadius: 28, borderBottomRightRadius: 28, alignItems: "center" },
  headerEmoji: { fontSize: 36, marginBottom: 8 },
  headerTitle: { fontSize: 28, fontWeight: "800", color: "#fff" },
  headerSub: { fontSize: 14, color: "rgba(255,255,255,0.8)", marginTop: 4 },
  backBtn: { alignSelf: "flex-start", marginBottom: 8 },
  backText: { color: "rgba(255,255,255,0.9)", fontSize: 16, fontWeight: "600" },
  infoCard: { marginHorizontal: 20, marginTop: -20, backgroundColor: "#eff6ff", borderRadius: 18, padding: 18, flexDirection: "row", gap: 12, borderWidth: 1, borderColor: "#bfdbfe" },
  infoIcon: { fontSize: 22 },
  infoTitle: { fontSize: 14, fontWeight: "700", color: "#1e40af" },
  infoText: { fontSize: 13, color: "#3b82f6", marginTop: 2, lineHeight: 18 },
  statsRow: { flexDirection: "row", marginHorizontal: 20, marginTop: 16, backgroundColor: "#fff", borderRadius: 18, padding: 16, shadowColor: "#0f172a", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  statItem: { flex: 1, alignItems: "center" },
  statDivider: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: "#f1f5f9" },
  statValue: { fontSize: 24, fontWeight: "800", color: "#0ea5e9" },
  statLabel: { fontSize: 12, color: "#94a3b8", fontWeight: "600", marginTop: 2 },
  section: { paddingHorizontal: 20, marginTop: 24 },
  sectionTitle: { fontSize: 16, fontWeight: "800", color: "#0f172a", marginBottom: 12 },
  emptyCard: { backgroundColor: "#fff", borderRadius: 20, padding: 40, alignItems: "center" },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 20, fontWeight: "700", color: "#0f172a" },
  emptySub: { fontSize: 14, color: "#64748b", marginTop: 4, textAlign: "center" },
  templateCard: { backgroundColor: "#fff", borderRadius: 18, padding: 18, marginBottom: 12, shadowColor: "#0f172a", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  templateTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  catBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 10 },
  catText: { fontSize: 12, fontWeight: "700" },
  deleteBtn: { fontSize: 18, color: "#94a3b8", padding: 4 },
  templateName: { fontSize: 17, fontWeight: "700", color: "#0f172a", marginBottom: 4 },
  templateTime: { fontSize: 14, color: "#64748b", marginBottom: 12 },
  daysRow: { flexDirection: "row", gap: 4, flexWrap: "wrap" },
  dayChip: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1.5, borderColor: "#e2e8f0", backgroundColor: "#f8fafc" },
  dayText: { fontSize: 11, fontWeight: "500", color: "#94a3b8" },
});

import React, { useState, useEffect, useCallback } from "react";
import {
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity,
  RefreshControl, Alert, ActivityIndicator, Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { healthApi } from "../services/api";

const { width } = Dimensions.get("window");

const moodEmojis: Record<number, string> = { 1: "😔", 2: "😕", 3: "😐", 4: "😊", 5: "😄" };
const energyLabels: Record<number, string> = { 1: "Very Low", 2: "Low", 3: "Moderate", 4: "High", 5: "Very High" };

export default function HealthScreen() {
  const [todayData, setTodayData] = useState<any>(null);
  const [weeklyStats, setWeeklyStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

  const [form, setForm] = useState({ steps: "", sleepHours: "", weight: "", mood: 3, energy: 3, water: "" });

  const fetchData = useCallback(async () => {
    try {
      const [today, weekly] = await Promise.all([healthApi.getToday(), healthApi.getWeeklyStats()]);
      setTodayData(today);
      setWeeklyStats(weekly);
      if (today?.metrics) {
        setForm({
          steps: today.metrics.steps?.toString() || "",
          sleepHours: today.metrics.sleepDuration?.toString() || "",
          weight: today.metrics.weight?.toString() || "",
          mood: today.metrics.moodScore || 3,
          energy: today.metrics.energyLevel || 3,
          water: today.metrics.waterIntake?.toString() || "",
        });
      }
    } catch (e) {} finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await healthApi.save({
        date: new Date().toISOString().split('T')[0],
        steps: parseInt(form.steps) || 0,
        sleepDuration: parseFloat(form.sleepHours) || 0,
        weight: parseFloat(form.weight) || undefined,
        moodScore: form.mood,
        energyLevel: form.energy,
        waterIntake: parseInt(form.water) || 0,
      });
      Alert.alert("Saved", "Health data updated!");
      setEditing(false);
      fetchData();
    } catch (e: any) { Alert.alert("Error", e.response?.data?.error || "Failed to save"); }
    finally { setSaving(false); }
  };

  const statCards = [
    { emoji: "👣", label: "Steps", value: form.steps || "0", unit: "", color: "#3b82f6" },
    { emoji: "😴", label: "Sleep", value: form.sleepHours || "0", unit: "hrs", color: "#8b5cf6" },
    { emoji: "💧", label: "Water", value: form.water || "0", unit: "glasses", color: "#0ea5e9" },
    { emoji: "⚖️", label: "Weight", value: form.weight || "—", unit: "kg", color: "#f59e0b" },
  ];

  if (loading) return <SafeAreaView style={styles.container}><View style={styles.center}><ActivityIndicator size="large" color="#0ea5e9" /></View></SafeAreaView>;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} />}>
        {/* Header */}
        <LinearGradient colors={["#10b981", "#059669"]} style={styles.header} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <Text style={styles.headerEmoji}>💚</Text>
          <Text style={styles.headerTitle}>Health Dashboard</Text>
          <Text style={styles.headerSub}>{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</Text>
        </LinearGradient>

        {/* Stats grid */}
        <View style={styles.statsGrid}>
          {statCards.map((s, i) => (
            <View key={i} style={styles.statCard}>
              <View style={[styles.statIconBg, { backgroundColor: s.color + "15" }]}>
                <Text style={{ fontSize: 20 }}>{s.emoji}</Text>
              </View>
              <Text style={styles.statValue}>{s.value} <Text style={styles.statUnit}>{s.unit}</Text></Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Mood & Energy */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How are you feeling?</Text>
          <View style={styles.moodCard}>
            <Text style={styles.moodLabel}>Mood</Text>
            <View style={styles.moodRow}>
              {[1, 2, 3, 4, 5].map(v => (
                <TouchableOpacity
                  key={v}
                  style={[styles.moodBtn, form.mood === v && styles.moodBtnActive]}
                  onPress={() => { setForm(f => ({ ...f, mood: v })); setEditing(true); }}
                >
                  <Text style={styles.moodEmoji}>{moodEmojis[v]}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.divider} />

            <Text style={styles.moodLabel}>Energy Level</Text>
            <View style={styles.moodRow}>
              {[1, 2, 3, 4, 5].map(v => (
                <TouchableOpacity
                  key={v}
                  style={[styles.energyBtn, form.energy === v && styles.energyBtnActive]}
                  onPress={() => { setForm(f => ({ ...f, energy: v })); setEditing(true); }}
                >
                  <Text style={[styles.energyNum, form.energy === v && styles.energyNumActive]}>{v}</Text>
                  <Text style={[styles.energyLabel, form.energy === v && styles.energyLabelActive]}>{energyLabels[v]}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Input form */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Log Your Data</Text>
          <View style={styles.formCard}>
            {[
              { key: "steps", label: "Steps", icon: "👣", keyboard: "number-pad" as const, placeholder: "e.g. 8000" },
              { key: "sleepHours", label: "Sleep (hours)", icon: "😴", keyboard: "decimal-pad" as const, placeholder: "e.g. 7.5" },
              { key: "water", label: "Water (glasses)", icon: "💧", keyboard: "number-pad" as const, placeholder: "e.g. 8" },
              { key: "weight", label: "Weight (kg)", icon: "⚖️", keyboard: "decimal-pad" as const, placeholder: "e.g. 72.5" },
            ].map((f, i) => (
              <View key={i} style={styles.inputRow}>
                <View style={styles.inputLabel}>
                  <Text style={{ fontSize: 16 }}>{f.icon}</Text>
                  <Text style={styles.inputLabelText}>{f.label}</Text>
                </View>
                <TextInput
                  style={styles.input}
                  value={(form as any)[f.key]}
                  onChangeText={(v) => { setForm(p => ({ ...p, [f.key]: v })); setEditing(true); }}
                  keyboardType={f.keyboard}
                  placeholder={f.placeholder}
                  placeholderTextColor="#94a3b8"
                />
              </View>
            ))}

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
              <LinearGradient colors={["#10b981", "#059669"]} style={styles.saveBtnInner} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>💾 Save Health Data</Text>}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Weekly Summary */}
        {weeklyStats && weeklyStats.dailyMetrics?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Weekly Overview</Text>
            <View style={styles.weeklyCard}>
              <View style={styles.weekRow}>
                {(weeklyStats.dailyMetrics || []).slice(0, 7).map((d: any, i: number) => {
                  const maxSteps = Math.max(...(weeklyStats.dailyMetrics || []).map((s: any) => s.steps || 0), 1);
                  const h = ((d.steps || 0) / maxSteps) * 80;
                  const day = new Date(d.date).toLocaleDateString("en-US", { weekday: "short" }).slice(0, 2);
                  return (
                    <View key={i} style={styles.weekDay}>
                      <View style={styles.barContainer}>
                        <LinearGradient colors={["#10b981", "#059669"]} style={[styles.bar, { height: Math.max(h, 8) }]} />
                      </View>
                      <Text style={styles.weekLabel}>{day}</Text>
                    </View>
                  );
                })}
              </View>
              <Text style={styles.weekLegend}>👣 Steps Activity</Text>
            </View>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { paddingTop: 20, paddingBottom: 44, paddingHorizontal: 24, borderBottomLeftRadius: 28, borderBottomRightRadius: 28, alignItems: "center" },
  headerEmoji: { fontSize: 36, marginBottom: 8 },
  headerTitle: { fontSize: 28, fontWeight: "800", color: "#fff" },
  headerSub: { fontSize: 14, color: "rgba(255,255,255,0.8)", marginTop: 4 },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 20, marginTop: -20, gap: 10 },
  statCard: { width: (width - 50) / 2, backgroundColor: "#fff", borderRadius: 18, padding: 16, alignItems: "center", shadowColor: "#0f172a", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3 },
  statIconBg: { width: 44, height: 44, borderRadius: 14, justifyContent: "center", alignItems: "center", marginBottom: 10 },
  statValue: { fontSize: 22, fontWeight: "800", color: "#0f172a" },
  statUnit: { fontSize: 13, fontWeight: "500", color: "#64748b" },
  statLabel: { fontSize: 12, color: "#94a3b8", fontWeight: "600", marginTop: 2 },
  section: { paddingHorizontal: 20, marginTop: 24 },
  sectionTitle: { fontSize: 16, fontWeight: "800", color: "#0f172a", marginBottom: 12, letterSpacing: 0.3 },
  moodCard: { backgroundColor: "#fff", borderRadius: 20, padding: 20, shadowColor: "#0f172a", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  moodLabel: { fontSize: 14, fontWeight: "700", color: "#334155", marginBottom: 12 },
  moodRow: { flexDirection: "row", justifyContent: "space-around" },
  moodBtn: { padding: 10, borderRadius: 16, backgroundColor: "#f8fafc", borderWidth: 2, borderColor: "transparent" },
  moodBtnActive: { borderColor: "#f59e0b", backgroundColor: "#fffbeb" },
  moodEmoji: { fontSize: 28 },
  divider: { height: 1, backgroundColor: "#f1f5f9", marginVertical: 16 },
  energyBtn: { alignItems: "center", padding: 8, borderRadius: 12, backgroundColor: "#f8fafc", minWidth: 52, borderWidth: 2, borderColor: "transparent" },
  energyBtnActive: { borderColor: "#0ea5e9", backgroundColor: "#f0f9ff" },
  energyNum: { fontSize: 18, fontWeight: "800", color: "#94a3b8" },
  energyNumActive: { color: "#0ea5e9" },
  energyLabel: { fontSize: 9, color: "#94a3b8", fontWeight: "600", marginTop: 2 },
  energyLabelActive: { color: "#0ea5e9" },
  formCard: { backgroundColor: "#fff", borderRadius: 20, padding: 20, shadowColor: "#0f172a", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  inputRow: { marginBottom: 16 },
  inputLabel: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
  inputLabelText: { fontSize: 14, fontWeight: "600", color: "#334155" },
  input: { backgroundColor: "#f8fafc", borderWidth: 1.5, borderColor: "#e2e8f0", borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: "#0f172a", fontWeight: "600" },
  saveBtn: { marginTop: 8 },
  saveBtnInner: { paddingVertical: 16, borderRadius: 14, alignItems: "center" },
  saveBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  weeklyCard: { backgroundColor: "#fff", borderRadius: 20, padding: 20, shadowColor: "#0f172a", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  weekRow: { flexDirection: "row", justifyContent: "space-around", alignItems: "flex-end", height: 100 },
  weekDay: { alignItems: "center" },
  barContainer: { justifyContent: "flex-end", height: 80 },
  bar: { width: 24, borderRadius: 6 },
  weekLabel: { fontSize: 11, color: "#64748b", fontWeight: "600", marginTop: 6 },
  weekLegend: { textAlign: "center", fontSize: 12, color: "#94a3b8", marginTop: 14 },
});

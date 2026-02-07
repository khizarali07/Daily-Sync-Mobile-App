import React, { useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Image,
  Alert, ActivityIndicator, Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { aiApi } from "../services/api";

const { width } = Dimensions.get("window");

type Tab = "food" | "workout";

export default function AIAnalysisScreen() {
  const [tab, setTab] = useState<Tab>("food");
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async (source: "camera" | "gallery") => {
    try {
      let res: ImagePicker.ImagePickerResult;
      if (source === "camera") {
        const perm = await ImagePicker.requestCameraPermissionsAsync();
        if (!perm.granted) { Alert.alert("Permission Required", "Camera access needed"); return; }
        res = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [4, 3], quality: 0.8, base64: true });
      } else {
        const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!perm.granted) { Alert.alert("Permission Required", "Gallery access needed"); return; }
        res = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, aspect: [4, 3], quality: 0.8, base64: true });
      }

      if (!res.canceled && res.assets[0].base64) {
        setImage(res.assets[0].uri);
        setResult(null);
        analyze(res.assets[0].base64);
      }
    } catch (e) { Alert.alert("Error", "Failed to pick image"); }
  };

  const analyze = async (base64: string) => {
    setLoading(true);
    try {
      const data = tab === "food"
        ? (await aiApi.analyzeFood(base64)).data
        : (await aiApi.analyzeWorkout(base64)).data;
      setResult(data);
    } catch (e: any) {
      Alert.alert("Error", e.response?.data?.error || "Analysis failed");
    } finally { setLoading(false); }
  };

  const renderFoodResult = () => {
    if (!result) return null;
    const { totalCalories, items, summary, macros } = result;
    return (
      <View style={styles.resultCard}>
        {/* Calorie Header */}
        <LinearGradient colors={["#f59e0b", "#f97316"]} style={styles.calorieCard} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
          <Text style={styles.calorieEmoji}>🔥</Text>
          <View>
            <Text style={styles.calLabel}>Total Calories</Text>
            <Text style={styles.calValue}>{totalCalories || 0} kcal</Text>
          </View>
        </LinearGradient>

        {/* Macros */}
        {macros && (
          <View style={styles.macroRow}>
            {[
              { label: "Protein", val: macros.protein, color: "#ef4444", icon: "🥩" },
              { label: "Carbs", val: macros.carbs, color: "#3b82f6", icon: "🌾" },
              { label: "Fat", val: macros.fat, color: "#f59e0b", icon: "🥑" },
            ].map((m, i) => (
              <View key={i} style={[styles.macroItem, { borderLeftColor: m.color, borderLeftWidth: 3 }]}>
                <Text style={styles.macroIcon}>{m.icon}</Text>
                <Text style={styles.macroLabel}>{m.label}</Text>
                <Text style={styles.macroVal}>{m.val}g</Text>
              </View>
            ))}
          </View>
        )}

        {/* Items */}
        {items && items.length > 0 && (
          <View style={styles.itemsSection}>
            <Text style={styles.itemsTitle}>Detected Items</Text>
            {items.map((item: any, i: number) => (
              <View key={i} style={styles.itemRow}>
                <Text style={styles.itemDot}>•</Text>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemCal}>{item.calories} kcal</Text>
              </View>
            ))}
          </View>
        )}

        {summary && <Text style={styles.summaryText}>{summary}</Text>}
      </View>
    );
  };

  const renderWorkoutResult = () => {
    if (!result) return null;
    const { workoutType, caloriesBurned, exercises, summary, duration } = result;
    return (
      <View style={styles.resultCard}>
        <LinearGradient colors={["#ef4444", "#f97316"]} style={styles.calorieCard} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
          <Text style={styles.calorieEmoji}>💪</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.calLabel}>{workoutType || "Workout"}</Text>
            <Text style={styles.calValue}>{caloriesBurned || 0} cal burned</Text>
          </View>
          {duration && (
            <View style={styles.durationBadge}>
              <Text style={styles.durationText}>⏱ {duration}</Text>
            </View>
          )}
        </LinearGradient>

        {exercises && exercises.length > 0 && (
          <View style={styles.itemsSection}>
            <Text style={styles.itemsTitle}>Exercises Detected</Text>
            {exercises.map((ex: any, i: number) => (
              <View key={i} style={styles.exerciseRow}>
                <View style={styles.exerciseIcon}>
                  <Text style={{ fontSize: 16 }}>🏋️</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.exerciseName}>{ex.name}</Text>
                  {ex.sets && <Text style={styles.exerciseDetails}>{ex.sets} sets × {ex.reps} reps</Text>}
                  {ex.duration && <Text style={styles.exerciseDetails}>Duration: {ex.duration}</Text>}
                </View>
                {ex.calories && <Text style={styles.exerciseCal}>{ex.calories} kcal</Text>}
              </View>
            ))}
          </View>
        )}

        {summary && <Text style={styles.summaryText}>{summary}</Text>}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient
          colors={tab === "food" ? ["#f59e0b", "#f97316"] : ["#ef4444", "#f97316"]}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.headerTitle}>✨ AI Analysis</Text>
          <Text style={styles.headerSub}>Take a photo for instant AI-powered analysis</Text>
        </LinearGradient>

        {/* Tabs */}
        <View style={styles.tabBar}>
          {(["food", "workout"] as Tab[]).map(t => (
            <TouchableOpacity
              key={t}
              style={[styles.tabBtn, tab === t && styles.tabActive]}
              onPress={() => { setTab(t); setResult(null); setImage(null); }}
            >
              {tab === t ? (
                <LinearGradient
                  colors={t === "food" ? ["#f59e0b", "#f97316"] : ["#ef4444", "#f97316"]}
                  style={styles.tabGrad}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.tabTextActive}>{t === "food" ? "🍽️ Food" : "💪 Workout"}</Text>
                </LinearGradient>
              ) : (
                <Text style={styles.tabText}>{t === "food" ? "🍽️ Food" : "💪 Workout"}</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Image pick area */}
        <View style={styles.section}>
          {image ? (
            <View style={styles.imagePreview}>
              <Image source={{ uri: image }} style={styles.previewImg} />
              <TouchableOpacity
                style={styles.retakeBtn}
                onPress={() => { setImage(null); setResult(null); }}
              >
                <Text style={styles.retakeText}>📷 Retake</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.pickCard}>
              <Text style={styles.pickIcon}>{tab === "food" ? "📸" : "🎥"}</Text>
              <Text style={styles.pickTitle}>
                {tab === "food" ? "Snap your meal" : "Capture your workout"}
              </Text>
              <Text style={styles.pickSub}>
                {tab === "food"
                  ? "AI will analyze calories, macros & more"
                  : "AI will detect exercises & calories burned"}
              </Text>

              <View style={styles.pickBtns}>
                <TouchableOpacity style={styles.pickBtn} onPress={() => pickImage("camera")}>
                  <LinearGradient
                    colors={tab === "food" ? ["#f59e0b", "#f97316"] : ["#ef4444", "#f97316"]}
                    style={styles.pickBtnInner}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Text style={styles.pickBtnText}>📷 Camera</Text>
                  </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity style={styles.pickBtn} onPress={() => pickImage("gallery")}>
                  <View style={styles.pickBtnOutline}>
                    <Text style={styles.pickBtnOutlineText}>🖼️ Gallery</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Loading */}
        {loading && (
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color={tab === "food" ? "#f59e0b" : "#ef4444"} />
            <Text style={styles.loadingText}>Analyzing with Gemini AI...</Text>
            <Text style={styles.loadingSub}>This may take a moment</Text>
          </View>
        )}

        {/* Results */}
        {!loading && result && (
          <View style={styles.section}>
            <Text style={styles.resultTitle}>📊 Analysis Results</Text>
            {tab === "food" ? renderFoodResult() : renderWorkoutResult()}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  header: { paddingTop: 20, paddingBottom: 44, paddingHorizontal: 24, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  headerTitle: { fontSize: 28, fontWeight: "800", color: "#fff" },
  headerSub: { fontSize: 14, color: "rgba(255,255,255,0.8)", marginTop: 4 },
  tabBar: { flexDirection: "row", marginHorizontal: 20, marginTop: -20, backgroundColor: "#fff", borderRadius: 18, padding: 4, shadowColor: "#0f172a", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 4 },
  tabBtn: { flex: 1, borderRadius: 14, overflow: "hidden" },
  tabActive: {},
  tabGrad: { paddingVertical: 14, alignItems: "center", borderRadius: 14 },
  tabTextActive: { fontSize: 16, fontWeight: "700", color: "#fff" },
  tabText: { fontSize: 16, fontWeight: "600", color: "#94a3b8", textAlign: "center", paddingVertical: 14 },
  section: { paddingHorizontal: 20, marginTop: 24 },
  pickCard: { backgroundColor: "#fff", borderRadius: 24, padding: 32, alignItems: "center", borderWidth: 2, borderColor: "#e2e8f0", borderStyle: "dashed" },
  pickIcon: { fontSize: 56, marginBottom: 12 },
  pickTitle: { fontSize: 20, fontWeight: "800", color: "#0f172a", textAlign: "center" },
  pickSub: { fontSize: 14, color: "#64748b", marginTop: 4, textAlign: "center" },
  pickBtns: { flexDirection: "row", gap: 12, marginTop: 24, width: "100%" },
  pickBtn: { flex: 1 },
  pickBtnInner: { paddingVertical: 16, borderRadius: 14, alignItems: "center" },
  pickBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  pickBtnOutline: { paddingVertical: 16, borderRadius: 14, alignItems: "center", borderWidth: 2, borderColor: "#e2e8f0" },
  pickBtnOutlineText: { fontSize: 16, fontWeight: "700", color: "#334155" },
  imagePreview: { borderRadius: 20, overflow: "hidden" },
  previewImg: { width: "100%", height: 260, borderRadius: 20 },
  retakeBtn: { position: "absolute", top: 12, right: 12, backgroundColor: "rgba(0,0,0,0.5)", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12 },
  retakeText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  loadingCard: { marginHorizontal: 20, marginTop: 20, backgroundColor: "#fff", borderRadius: 20, padding: 32, alignItems: "center" },
  loadingText: { fontSize: 16, fontWeight: "700", color: "#0f172a", marginTop: 16 },
  loadingSub: { fontSize: 13, color: "#94a3b8", marginTop: 4 },
  resultTitle: { fontSize: 18, fontWeight: "800", color: "#0f172a", marginBottom: 12 },
  resultCard: { backgroundColor: "#fff", borderRadius: 20, padding: 20, shadowColor: "#0f172a", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  calorieCard: { flexDirection: "row", alignItems: "center", padding: 20, borderRadius: 16, gap: 14 },
  calorieEmoji: { fontSize: 36 },
  calLabel: { fontSize: 14, color: "rgba(255,255,255,0.8)", fontWeight: "600" },
  calValue: { fontSize: 28, fontWeight: "800", color: "#fff" },
  durationBadge: { backgroundColor: "rgba(255,255,255,0.2)", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  durationText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  macroRow: { flexDirection: "row", gap: 8, marginTop: 16 },
  macroItem: { flex: 1, backgroundColor: "#f8fafc", borderRadius: 14, padding: 14, alignItems: "center" },
  macroIcon: { fontSize: 18 },
  macroLabel: { fontSize: 11, color: "#64748b", fontWeight: "600", marginTop: 4 },
  macroVal: { fontSize: 18, fontWeight: "800", color: "#0f172a" },
  itemsSection: { marginTop: 16 },
  itemsTitle: { fontSize: 15, fontWeight: "700", color: "#334155", marginBottom: 10 },
  itemRow: { flexDirection: "row", alignItems: "center", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#f1f5f9", gap: 8 },
  itemDot: { fontSize: 14, color: "#f59e0b" },
  itemName: { flex: 1, fontSize: 15, fontWeight: "600", color: "#0f172a" },
  itemCal: { fontSize: 14, fontWeight: "700", color: "#f59e0b" },
  exerciseRow: { flexDirection: "row", alignItems: "center", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#f1f5f9", gap: 10 },
  exerciseIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: "#fef2f2", justifyContent: "center", alignItems: "center" },
  exerciseName: { fontSize: 15, fontWeight: "700", color: "#0f172a" },
  exerciseDetails: { fontSize: 12, color: "#64748b" },
  exerciseCal: { fontSize: 14, fontWeight: "700", color: "#ef4444" },
  summaryText: { marginTop: 16, fontSize: 14, color: "#334155", lineHeight: 22, fontStyle: "italic", backgroundColor: "#f8fafc", padding: 14, borderRadius: 12 },
});

import React, { useState, useEffect, useCallback } from "react";
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl,
  Alert, TextInput, ActivityIndicator, Image, Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { tasksApi, aiApi, Task } from "../services/api";

const { width } = Dimensions.get("window");

const categoryColors: Record<string, string> = {
  Prayer: "#8b5cf6", Workout: "#ef4444", Study: "#3b82f6", Food: "#22c55e",
  Work: "#f59e0b", Health: "#ec4899", default: "#64748b",
};
const categoryIcons: Record<string, string> = {
  Prayer: "🕌", Workout: "💪", Study: "📚", Food: "🍽️", Work: "💼", Health: "❤️", default: "✓",
};

interface TaskCardProps {
  task: Task;
  onComplete: (id: string, notes?: string) => void;
  onCamera: (id: string, category?: string) => void;
  isUpdating: boolean;
}

function TaskCard({ task, onComplete, onCamera, isUpdating }: TaskCardProps) {
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState(task.notes || "");

  const color = categoryColors[task.category || "default"] || categoryColors.default;
  const icon = categoryIcons[task.category || "default"] || categoryIcons.default;

  const formatTime = (time: string) => {
    const [h, m] = time.split(":");
    const hour = parseInt(h, 10);
    return `${hour % 12 || 12}:${m} ${hour >= 12 ? "PM" : "AM"}`;
  };

  const cameraCategories = ["Food", "Workout", "Health"];

  return (
    <View style={[styles.taskCard, task.isCompleted && styles.taskCardDone]}>
      {/* Timeline */}
      <View style={styles.timeline}>
        <View style={[styles.timelineDot, { backgroundColor: task.isCompleted ? "#10b981" : color }]}>
          <Text style={styles.dotIcon}>{task.isCompleted ? "✓" : icon}</Text>
        </View>
        <View style={styles.timelineLine} />
      </View>

      {/* Content */}
      <View style={styles.taskBody}>
        <View style={styles.taskTop}>
          <Text style={[styles.taskTime, { color }]}>{formatTime(task.startTime)} - {formatTime(task.endTime)}</Text>
          {task.category && (
            <View style={[styles.catBadge, { backgroundColor: color + "15" }]}>
              <Text style={[styles.catText, { color }]}>{task.category}</Text>
            </View>
          )}
        </View>

        <Text style={[styles.taskName, task.isCompleted && styles.taskNameDone]}>{task.name}</Text>

        {task.notes && <Text style={styles.taskNotes}>{task.notes}</Text>}

        {task.aiData && (
          <View style={styles.aiBox}>
            {task.aiData.totalCalories && <Text style={styles.aiText}>🔥 {task.aiData.totalCalories} kcal</Text>}
            {task.aiData.caloriesBurned && <Text style={styles.aiText}>💪 {task.aiData.caloriesBurned} cal burned</Text>}
            {task.aiData.summary && <Text style={styles.aiSummary}>{task.aiData.summary}</Text>}
          </View>
        )}

        {task.imageUrl && <Image source={{ uri: task.imageUrl }} style={styles.taskImg} />}

        {showNotes && (
          <TextInput
            style={styles.noteInput}
            placeholder="Add a note (optional)..."
            placeholderTextColor="#94a3b8"
            value={notes}
            onChangeText={setNotes}
            multiline
          />
        )}

        {!task.isCompleted && (
          <View style={styles.taskActions}>
            {cameraCategories.includes(task.category || "") && (
              <TouchableOpacity style={styles.camBtn} onPress={() => onCamera(task.id, task.category)} disabled={isUpdating}>
                <Text style={{ fontSize: 18 }}>📷</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.doneBtn}
              onPress={() => {
                if (showNotes) { onComplete(task.id, notes); setShowNotes(false); }
                else setShowNotes(true);
              }}
              disabled={isUpdating}
            >
              <LinearGradient
                colors={showNotes ? ["#10b981", "#059669"] : ["#0ea5e9", "#7c3aed"]}
                style={styles.doneBtnInner}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {isUpdating ? <ActivityIndicator size="small" color="#fff" /> : (
                  <Text style={styles.doneBtnText}>{showNotes ? "Save" : "Mark Done"}</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
            {showNotes && (
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowNotes(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {task.isCompleted && (
          <View style={styles.completedBadge}>
            <Text style={styles.completedText}>✓ Completed</Text>
          </View>
        )}
      </View>
    </View>
  );
}

export default function TodayScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [date, setDate] = useState("");
  const [analyzing, setAnalyzing] = useState(false);

  const fetchTasks = useCallback(async () => {
    try {
      const res = await tasksApi.getToday();
      setTasks(res.tasks);
      setDate(res.date);
    } catch (e: any) {
      Alert.alert("Error", "Failed to load tasks");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const handleComplete = async (id: string, notes?: string) => {
    setUpdatingId(id);
    try {
      await tasksApi.complete(id, { isCompleted: true, notes });
      setTasks(prev => prev.map(t => t.id === id ? { ...t, isCompleted: true, completedAt: new Date().toISOString(), notes } : t));
    } catch (e) { Alert.alert("Error", "Failed to update task"); }
    finally { setUpdatingId(null); }
  };

  const handleCamera = async (taskId: string, category?: string) => {
    try {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) { Alert.alert("Permission Required", "Camera access needed"); return; }
      const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [4, 3], quality: 0.8, base64: true });
      if (!result.canceled && result.assets[0].base64) {
        setAnalyzing(true);
        const b64 = result.assets[0].base64;
        let aiData: any;
        if (category === "Food") aiData = (await aiApi.analyzeFood(b64)).data;
        else if (category === "Workout") aiData = (await aiApi.analyzeWorkout(b64)).data;
        else aiData = { summary: (await aiApi.analyzeGeneral(b64)).data.analysis };
        await tasksApi.update(taskId, { imageUrl: result.assets[0].uri, aiData, notes: aiData.summary || `Calories: ${aiData.totalCalories || aiData.caloriesBurned || 0}` });
        fetchTasks();
        Alert.alert("Analysis Complete", aiData.summary || "Image analyzed!");
      }
    } catch (e: any) { Alert.alert("Error", e.response?.data?.error || "Analysis failed"); }
    finally { setAnalyzing(false); }
  };

  const completed = tasks.filter(t => t.isCompleted).length;
  const progress = tasks.length > 0 ? (completed / tasks.length) * 100 : 0;

  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#0ea5e9" />
          <Text style={styles.loadingLabel}>Loading tasks...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <LinearGradient colors={["#0ea5e9", "#7c3aed"]} style={styles.header} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <Text style={styles.headerTitle}>Today</Text>
        <Text style={styles.headerDate}>{date && formatDate(date)}</Text>
      </LinearGradient>

      {/* Progress card */}
      <View style={styles.progressCard}>
        <View style={styles.progressTop}>
          <Text style={styles.progressLabel}>{completed} of {tasks.length} completed</Text>
          <Text style={styles.progressPct}>{Math.round(progress)}%</Text>
        </View>
        <View style={styles.progressBarBg}>
          <LinearGradient colors={["#0ea5e9", "#7c3aed"]} style={[styles.progressBarFill, { width: `${progress}%` }]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} />
        </View>
      </View>

      {/* AI overlay */}
      {analyzing && (
        <View style={styles.overlay}>
          <View style={styles.overlayModal}>
            <ActivityIndicator size="large" color="#0ea5e9" />
            <Text style={styles.overlayText}>Analyzing with AI...</Text>
          </View>
        </View>
      )}

      {/* Task List */}
      {tasks.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyTitle}>No tasks for today</Text>
          <Text style={styles.emptySub}>Upload a schedule CSV from the web dashboard</Text>
        </View>
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <TaskCard task={item} onComplete={handleComplete} onCamera={handleCamera} isUpdating={updatingId === item.id} />
          )}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchTasks(); }} />}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  loadingBox: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingLabel: { marginTop: 12, fontSize: 16, color: "#64748b", fontWeight: "600" },
  header: { paddingTop: 16, paddingBottom: 40, paddingHorizontal: 24, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  headerTitle: { fontSize: 34, fontWeight: "800", color: "#fff" },
  headerDate: { fontSize: 15, color: "rgba(255,255,255,0.8)", marginTop: 4, fontWeight: "500" },
  progressCard: { marginHorizontal: 20, marginTop: -20, backgroundColor: "#fff", borderRadius: 18, padding: 18, shadowColor: "#0f172a", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 6 },
  progressTop: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  progressLabel: { fontSize: 14, color: "#64748b", fontWeight: "600" },
  progressPct: { fontSize: 14, fontWeight: "800", color: "#0ea5e9" },
  progressBarBg: { height: 8, backgroundColor: "#f1f5f9", borderRadius: 4, overflow: "hidden" },
  progressBarFill: { height: "100%", borderRadius: 4 },
  list: { padding: 20, paddingBottom: 32 },
  taskCard: { flexDirection: "row", marginBottom: 16 },
  taskCardDone: { opacity: 0.7 },
  timeline: { alignItems: "center", width: 48 },
  timelineDot: { width: 40, height: 40, borderRadius: 20, justifyContent: "center", alignItems: "center" },
  dotIcon: { fontSize: 16, color: "#fff", fontWeight: "bold" },
  timelineLine: { flex: 1, width: 2, backgroundColor: "#e2e8f0", marginTop: 4 },
  taskBody: { flex: 1, backgroundColor: "#fff", borderRadius: 18, padding: 16, marginLeft: 10, shadowColor: "#0f172a", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  taskTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  taskTime: { fontSize: 13, fontWeight: "800" },
  catBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10 },
  catText: { fontSize: 11, fontWeight: "700" },
  taskName: { fontSize: 16, fontWeight: "700", color: "#0f172a", marginBottom: 6 },
  taskNameDone: { textDecorationLine: "line-through", color: "#94a3b8" },
  taskNotes: { fontSize: 13, color: "#64748b", fontStyle: "italic", marginBottom: 6 },
  aiBox: { backgroundColor: "#f0fdf4", padding: 10, borderRadius: 12, marginBottom: 8 },
  aiText: { fontSize: 13, color: "#166534", fontWeight: "600" },
  aiSummary: { fontSize: 12, color: "#15803d", marginTop: 4 },
  taskImg: { width: "100%", height: 140, borderRadius: 12, marginBottom: 8 },
  noteInput: { borderWidth: 1.5, borderColor: "#e2e8f0", borderRadius: 12, padding: 12, fontSize: 14, marginBottom: 8, minHeight: 56, textAlignVertical: "top", color: "#0f172a", backgroundColor: "#f8fafc" },
  taskActions: { flexDirection: "row", gap: 8 },
  camBtn: { backgroundColor: "#f1f5f9", paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12, justifyContent: "center" },
  doneBtn: { flex: 1 },
  doneBtnInner: { paddingVertical: 12, borderRadius: 12, alignItems: "center" },
  doneBtnText: { color: "#fff", fontSize: 14, fontWeight: "700" },
  cancelBtn: { paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12, borderWidth: 1.5, borderColor: "#e2e8f0", justifyContent: "center" },
  cancelText: { color: "#64748b", fontSize: 14, fontWeight: "600" },
  completedBadge: { backgroundColor: "#f0fdf4", paddingVertical: 8, paddingHorizontal: 14, borderRadius: 10, alignSelf: "flex-start" },
  completedText: { color: "#10b981", fontSize: 13, fontWeight: "700" },
  emptyBox: { flex: 1, justifyContent: "center", alignItems: "center", padding: 40 },
  emptyIcon: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { fontSize: 22, fontWeight: "700", color: "#0f172a", marginBottom: 8 },
  emptySub: { fontSize: 14, color: "#64748b", textAlign: "center" },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center", zIndex: 100 },
  overlayModal: { backgroundColor: "#fff", padding: 32, borderRadius: 20, alignItems: "center" },
  overlayText: { marginTop: 16, fontSize: 16, fontWeight: "600", color: "#0f172a" },
});

import React, { useState, useEffect } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../contexts/AuthContext";
import { tasksApi, healthApi } from "../services/api";
import { notificationService } from "../services/notifications";

const { width } = Dimensions.get("window");

export default function HomeScreen({ navigation }: any) {
  const { user, signOut } = useAuth();
  const [stats, setStats] = useState({ total: 0, completed: 0 });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const res = await tasksApi.getToday();
      const tasks = res.tasks || [];
      setStats({
        total: tasks.length,
        completed: tasks.filter((t: any) => t.isCompleted).length,
      });
    } catch (e) {}
  };

  const handleLogout = async () => {
    try {
      await notificationService.cancelAllNotifications();
      await signOut();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good Morning";
    if (h < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const rate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  const menuItems = [
    { icon: "📅", label: "My Schedule", desc: "View task templates", onPress: () => navigation.navigate("Schedule") },
    { icon: "🔔", label: "Notifications", desc: "Enable push alerts", onPress: async () => { await notificationService.registerForPushNotifications(); Alert.alert("Success", "Notifications enabled!"); }},
    { icon: "🔒", label: "Change Password", desc: "Update credentials", onPress: () => navigation.navigate("ChangePassword") },
  ];

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header with gradient */}
        <LinearGradient
          colors={["#0ea5e9", "#7c3aed"]}
          style={styles.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerContent}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </Text>
            </View>
            <Text style={styles.greetingText}>{greeting()}</Text>
            <Text style={styles.userName}>{user?.name}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>

            {/* Status badge */}
            <View style={[styles.statusBadge, user?.emailVerified ? styles.verifiedBadge : styles.unverifiedBadge]}>
              <Text style={styles.statusText}>
                {user?.emailVerified ? "✓ Verified" : "⚠ Unverified"}
              </Text>
            </View>
          </View>

          {/* Today's progress card overlapping gradient */}
          <View style={styles.progressCard}>
            <View style={styles.progressRow}>
              <View>
                <Text style={styles.progressLabel}>Today's Progress</Text>
                <Text style={styles.progressValue}>{stats.completed}/{stats.total} tasks</Text>
              </View>
              <View style={styles.rateCircle}>
                <Text style={styles.rateText}>{rate}%</Text>
              </View>
            </View>
            <View style={styles.progressBarBg}>
              <LinearGradient
                colors={["#0ea5e9", "#7c3aed"]}
                style={[styles.progressBarFill, { width: `${rate}%` }]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              />
            </View>
          </View>
        </LinearGradient>

        {/* Verify email prompt */}
        {!user?.emailVerified && (
          <TouchableOpacity
            style={styles.verifyPrompt}
            onPress={() => navigation.navigate("VerifyEmail", { email: user?.email })}
          >
            <LinearGradient colors={["#fef3c7", "#fffbeb"]} style={styles.verifyPromptInner} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <Text style={styles.verifyIcon}>📧</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.verifyTitle}>Verify your email</Text>
                <Text style={styles.verifyDesc}>Tap to complete verification</Text>
              </View>
              <Text style={styles.verifyArrow}>→</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickGrid}>
            {[
              { icon: "📋", label: "Today", color: ["#0ea5e9", "#38bdf8"], tab: "Today" },
              { icon: "✨", label: "AI Analysis", color: ["#f59e0b", "#fbbf24"], tab: "AI" },
              { icon: "💚", label: "Health", color: ["#10b981", "#34d399"], tab: "Health" },
              { icon: "📊", label: "Analytics", color: ["#8b5cf6", "#a78bfa"], tab: "Analytics" },
            ].map((item, i) => (
              <TouchableOpacity
                key={i}
                style={styles.quickItem}
                onPress={() => navigation.navigate(item.tab)}
                activeOpacity={0.8}
              >
                <LinearGradient colors={item.color as any} style={styles.quickIcon} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                  <Text style={{ fontSize: 22 }}>{item.icon}</Text>
                </LinearGradient>
                <Text style={styles.quickLabel}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Settings Menu */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <View style={styles.menuCard}>
            {menuItems.map((item, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.menuItem, i < menuItems.length - 1 && styles.menuItemBorder]}
                onPress={item.onPress}
                activeOpacity={0.7}
              >
                <View style={styles.menuIconBg}>
                  <Text style={{ fontSize: 18 }}>{item.icon}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                  <Text style={styles.menuDesc}>{item.desc}</Text>
                </View>
                <Text style={styles.menuArrow}>›</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Logout */}
        <View style={styles.section}>
          <TouchableOpacity onPress={handleLogout} activeOpacity={0.85}>
            <View style={styles.logoutBtn}>
              <Text style={styles.logoutText}>🚪 Sign Out</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>DailySync v1.0.0</Text>
          <Text style={styles.footerSub}>Powered by Gemini AI</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  headerGradient: { paddingTop: 20, paddingBottom: 60, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
  headerContent: { alignItems: "center", paddingHorizontal: 24 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: "rgba(255,255,255,0.2)", justifyContent: "center", alignItems: "center", marginBottom: 12, borderWidth: 3, borderColor: "rgba(255,255,255,0.3)" },
  avatarText: { fontSize: 32, fontWeight: "800", color: "#fff" },
  greetingText: { fontSize: 14, color: "rgba(255,255,255,0.8)", fontWeight: "600" },
  userName: { fontSize: 26, fontWeight: "800", color: "#fff", marginTop: 4 },
  userEmail: { fontSize: 14, color: "rgba(255,255,255,0.7)", marginTop: 2 },
  statusBadge: { marginTop: 12, paddingHorizontal: 14, paddingVertical: 5, borderRadius: 20 },
  verifiedBadge: { backgroundColor: "rgba(16,185,129,0.3)" },
  unverifiedBadge: { backgroundColor: "rgba(245,158,11,0.3)" },
  statusText: { fontSize: 13, fontWeight: "700", color: "#fff" },
  progressCard: { marginHorizontal: 20, marginTop: 20, backgroundColor: "#fff", borderRadius: 20, padding: 20, shadowColor: "#0f172a", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 24, elevation: 8 },
  progressRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  progressLabel: { fontSize: 13, color: "#64748b", fontWeight: "600" },
  progressValue: { fontSize: 20, fontWeight: "800", color: "#0f172a", marginTop: 2 },
  rateCircle: { width: 52, height: 52, borderRadius: 26, backgroundColor: "#f0f9ff", justifyContent: "center", alignItems: "center", borderWidth: 3, borderColor: "#0ea5e9" },
  rateText: { fontSize: 16, fontWeight: "800", color: "#0ea5e9" },
  progressBarBg: { height: 8, backgroundColor: "#f1f5f9", borderRadius: 4, overflow: "hidden" },
  progressBarFill: { height: "100%", borderRadius: 4 },
  verifyPrompt: { marginHorizontal: 20, marginTop: -20 },
  verifyPromptInner: { flexDirection: "row", alignItems: "center", padding: 16, borderRadius: 16, gap: 12, borderWidth: 1, borderColor: "#fcd34d" },
  verifyIcon: { fontSize: 24 },
  verifyTitle: { fontSize: 14, fontWeight: "700", color: "#92400e" },
  verifyDesc: { fontSize: 12, color: "#a16207" },
  verifyArrow: { fontSize: 18, color: "#92400e", fontWeight: "bold" },
  section: { paddingHorizontal: 20, marginTop: 24 },
  sectionTitle: { fontSize: 16, fontWeight: "800", color: "#0f172a", marginBottom: 12, letterSpacing: 0.3 },
  quickGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  quickItem: { width: (width - 64) / 2, backgroundColor: "#fff", borderRadius: 18, padding: 18, alignItems: "center", shadowColor: "#0f172a", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  quickIcon: { width: 48, height: 48, borderRadius: 14, justifyContent: "center", alignItems: "center", marginBottom: 10 },
  quickLabel: { fontSize: 14, fontWeight: "700", color: "#334155" },
  menuCard: { backgroundColor: "#fff", borderRadius: 20, shadowColor: "#0f172a", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2, overflow: "hidden" },
  menuItem: { flexDirection: "row", alignItems: "center", padding: 16, gap: 14 },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  menuIconBg: { width: 40, height: 40, borderRadius: 12, backgroundColor: "#f8fafc", justifyContent: "center", alignItems: "center" },
  menuLabel: { fontSize: 15, fontWeight: "700", color: "#0f172a" },
  menuDesc: { fontSize: 12, color: "#94a3b8", marginTop: 1 },
  menuArrow: { fontSize: 24, color: "#cbd5e1", fontWeight: "300" },
  logoutBtn: { backgroundColor: "#fff", borderRadius: 16, paddingVertical: 16, alignItems: "center", borderWidth: 1.5, borderColor: "#fecaca" },
  logoutText: { fontSize: 16, fontWeight: "700", color: "#ef4444" },
  footer: { alignItems: "center", padding: 24, paddingBottom: 40 },
  footerText: { fontSize: 14, color: "#94a3b8", fontWeight: "600" },
  footerSub: { fontSize: 12, color: "#cbd5e1", marginTop: 4 },
});

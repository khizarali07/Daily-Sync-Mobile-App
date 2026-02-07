import React, { useState, useEffect, useCallback } from "react";
import {
  View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator, Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { aiApi } from "../services/api";

const { width } = Dimensions.get("window");

const CELL_SIZE = Math.floor((width - 64) / 7);
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function AnalyticsScreen() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const res = await aiApi.getConsistency();
      setData(res);
    } catch (e) {} finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const getHeatColor = (rate: number) => {
    if (rate >= 80) return "#059669";
    if (rate >= 60) return "#10b981";
    if (rate >= 40) return "#34d399";
    if (rate >= 20) return "#6ee7b7";
    if (rate > 0) return "#a7f3d0";
    return "#f1f5f9";
  };

  const renderHeatmap = () => {
    if (!data?.dailyStats?.length) return null;
    const stats = data.dailyStats.slice(-28); // Last 4 weeks
    const weeks: any[][] = [];
    let currentWeek: any[] = [];

    // Pad start
    if (stats.length > 0) {
      const firstDay = new Date(stats[0].date).getDay();
      for (let i = 0; i < firstDay; i++) currentWeek.push(null);
    }

    stats.forEach((s: any) => {
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
      currentWeek.push(s);
    });
    if (currentWeek.length) {
      while (currentWeek.length < 7) currentWeek.push(null);
      weeks.push(currentWeek);
    }

    return (
      <View>
        {/* Day headers */}
        <View style={styles.heatDayRow}>
          {DAYS.map(d => (
            <Text key={d} style={[styles.heatDayLabel, { width: CELL_SIZE }]}>{d.charAt(0)}</Text>
          ))}
        </View>
        {/* Grid */}
        {weeks.map((week, wi) => (
          <View key={wi} style={styles.heatWeekRow}>
            {week.map((day: any, di: number) => (
              <View
                key={di}
                style={[
                  styles.heatCell,
                  {
                    width: CELL_SIZE - 4,
                    height: CELL_SIZE - 4,
                    backgroundColor: day ? getHeatColor(day.completionRate || 0) : "#f8fafc",
                    borderWidth: day ? 0 : 1,
                    borderColor: "#e2e8f0",
                  },
                ]}
              />
            ))}
          </View>
        ))}
        {/* Legend */}
        <View style={styles.legendRow}>
          <Text style={styles.legendText}>Less</Text>
          {[0, 20, 40, 60, 80].map(v => (
            <View key={v} style={[styles.legendCell, { backgroundColor: getHeatColor(v || 1) }]} />
          ))}
          <Text style={styles.legendText}>More</Text>
        </View>
      </View>
    );
  };

  const renderWeeklyBars = () => {
    if (!data?.weeklyStats?.length) return null;
    const weeks = data.weeklyStats.slice(-8);
    const maxRate = Math.max(...weeks.map((w: any) => w.completionRate || 0), 1);

    return (
      <View style={styles.barsContainer}>
        {weeks.map((w: any, i: number) => {
          const h = ((w.completionRate || 0) / maxRate) * 100;
          return (
            <View key={i} style={styles.barCol}>
              <View style={styles.barWrapper}>
                <LinearGradient
                  colors={["#0ea5e9", "#7c3aed"]}
                  style={[styles.bar, { height: Math.max(h, 4) }]}
                />
              </View>
              <Text style={styles.barLabel}>W{i + 1}</Text>
            </View>
          );
        })}
      </View>
    );
  };

  if (loading) return <SafeAreaView style={styles.container}><View style={styles.center}><ActivityIndicator size="large" color="#0ea5e9" /></View></SafeAreaView>;

  const streak = data?.currentStreak || 0;
  const bestStreak = data?.longestStreak || 0;
  const overallRate = data?.overallCompletionRate || 0;
  const totalCompleted = data?.totalCompleted || 0;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} />}
      >
        {/* Header */}
        <LinearGradient colors={["#0ea5e9", "#7c3aed"]} style={styles.header} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <Text style={styles.headerEmoji}>📊</Text>
          <Text style={styles.headerTitle}>Analytics</Text>
          <Text style={styles.headerSub}>Track your consistency & progress</Text>
        </LinearGradient>

        {/* Stat cards */}
        <View style={styles.statsGrid}>
          {[
            { icon: "🔥", label: "Current Streak", value: `${streak}`, unit: "days", color: "#f59e0b" },
            { icon: "🏆", label: "Best Streak", value: `${bestStreak}`, unit: "days", color: "#8b5cf6" },
            { icon: "✅", label: "Completion Rate", value: `${Math.round(overallRate)}`, unit: "%", color: "#10b981" },
            { icon: "📋", label: "Tasks Done", value: `${totalCompleted}`, unit: "total", color: "#3b82f6" },
          ].map((s, i) => (
            <View key={i} style={styles.statCard}>
              <LinearGradient colors={[s.color + "20", s.color + "08"]} style={styles.statCardInner} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                <Text style={styles.statIcon}>{s.icon}</Text>
                <Text style={[styles.statValue, { color: s.color }]}>
                  {s.value}<Text style={styles.statUnit}> {s.unit}</Text>
                </Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </LinearGradient>
            </View>
          ))}
        </View>

        {/* Heatmap */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Activity Heatmap</Text>
          <View style={styles.heatCard}>
            {data?.dailyStats?.length ? renderHeatmap() : (
              <View style={styles.emptySmall}>
                <Text style={styles.emptyIcon}>📅</Text>
                <Text style={styles.emptyText}>No activity data yet</Text>
              </View>
            )}
          </View>
        </View>

        {/* Weekly chart */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Weekly Completion</Text>
          <View style={styles.chartCard}>
            {data?.weeklyStats?.length ? renderWeeklyBars() : (
              <View style={styles.emptySmall}>
                <Text style={styles.emptyIcon}>📊</Text>
                <Text style={styles.emptyText}>Complete tasks to see weekly stats</Text>
              </View>
            )}
          </View>
        </View>

        {/* Insights */}
        {data && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Insights</Text>
            <View style={styles.insightCard}>
              {streak > 0 && (
                <View style={styles.insightRow}>
                  <Text style={styles.insightIcon}>🔥</Text>
                  <Text style={styles.insightText}>
                    You're on a <Text style={styles.bold}>{streak}-day streak</Text>! Keep it up!
                  </Text>
                </View>
              )}
              {overallRate >= 80 && (
                <View style={styles.insightRow}>
                  <Text style={styles.insightIcon}>⭐</Text>
                  <Text style={styles.insightText}>
                    Amazing! Your completion rate is <Text style={styles.bold}>{Math.round(overallRate)}%</Text>
                  </Text>
                </View>
              )}
              {overallRate < 50 && overallRate > 0 && (
                <View style={styles.insightRow}>
                  <Text style={styles.insightIcon}>💪</Text>
                  <Text style={styles.insightText}>
                    Try to complete at least 50% of your daily tasks to build momentum!
                  </Text>
                </View>
              )}
              {totalCompleted === 0 && (
                <View style={styles.insightRow}>
                  <Text style={styles.insightIcon}>🚀</Text>
                  <Text style={styles.insightText}>
                    Start completing tasks to see your analytics and insights here!
                  </Text>
                </View>
              )}
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
  statCard: { width: (width - 50) / 2, borderRadius: 18, overflow: "hidden", shadowColor: "#0f172a", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3 },
  statCardInner: { padding: 18, alignItems: "center", borderRadius: 18, backgroundColor: "#fff" },
  statIcon: { fontSize: 24, marginBottom: 6 },
  statValue: { fontSize: 28, fontWeight: "800" },
  statUnit: { fontSize: 13, fontWeight: "500" },
  statLabel: { fontSize: 12, color: "#64748b", fontWeight: "600", marginTop: 2 },
  section: { paddingHorizontal: 20, marginTop: 24 },
  sectionTitle: { fontSize: 16, fontWeight: "800", color: "#0f172a", marginBottom: 12 },
  heatCard: { backgroundColor: "#fff", borderRadius: 20, padding: 20, shadowColor: "#0f172a", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  heatDayRow: { flexDirection: "row", justifyContent: "space-around", marginBottom: 4 },
  heatDayLabel: { fontSize: 11, color: "#94a3b8", fontWeight: "600", textAlign: "center" },
  heatWeekRow: { flexDirection: "row", justifyContent: "space-around", marginBottom: 4 },
  heatCell: { borderRadius: 6 },
  legendRow: { flexDirection: "row", justifyContent: "center", alignItems: "center", marginTop: 12, gap: 4 },
  legendCell: { width: 16, height: 16, borderRadius: 4 },
  legendText: { fontSize: 11, color: "#94a3b8", paddingHorizontal: 4 },
  chartCard: { backgroundColor: "#fff", borderRadius: 20, padding: 20, shadowColor: "#0f172a", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  barsContainer: { flexDirection: "row", justifyContent: "space-around", alignItems: "flex-end", height: 120 },
  barCol: { alignItems: "center" },
  barWrapper: { justifyContent: "flex-end", height: 100 },
  bar: { width: 28, borderRadius: 6 },
  barLabel: { fontSize: 11, color: "#64748b", fontWeight: "600", marginTop: 6 },
  emptySmall: { alignItems: "center", padding: 24 },
  emptyIcon: { fontSize: 32, marginBottom: 8 },
  emptyText: { fontSize: 14, color: "#94a3b8" },
  insightCard: { backgroundColor: "#fff", borderRadius: 20, padding: 20, shadowColor: "#0f172a", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  insightRow: { flexDirection: "row", alignItems: "flex-start", gap: 10, paddingVertical: 8 },
  insightIcon: { fontSize: 18 },
  insightText: { flex: 1, fontSize: 14, color: "#334155", lineHeight: 20 },
  bold: { fontWeight: "700" },
});

import React, { useEffect } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { Text, View, StyleSheet, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import TodayScreen from "../screens/TodayScreen";
import HomeScreen from "../screens/HomeScreen";
import HealthScreen from "../screens/HealthScreen";
import AIAnalysisScreen from "../screens/AIAnalysisScreen";
import JournalScreen from "../screens/JournalScreen";
import AnalyticsScreen from "../screens/AnalyticsScreen";
import ChangePasswordScreen from "../screens/ChangePasswordScreen";
import VerifyEmailScreen from "../screens/VerifyEmailScreen";
import ScheduleScreen from "../screens/ScheduleScreen";
import { notificationService } from "../services/notifications";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const icons: Record<string, string> = {
    Today: "📋",
    AI: "✨",
    Health: "💚",
    Analytics: "📊",
    Journal: "📖",
    Profile: "👤",
  };

  return (
    <View style={styles.tabIconContainer}>
      {focused && (
        <View style={styles.tabIndicator} />
      )}
      <Text style={[styles.tabEmoji, focused && styles.tabEmojiFocused]}>
        {icons[name] || "📋"}
      </Text>
    </View>
  );
}

function TabNavigator() {
  useEffect(() => {
    notificationService.registerForPushNotifications();
  }, []);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => (
          <TabIcon name={route.name} focused={focused} />
        ),
        tabBarActiveTintColor: "#0ea5e9",
        tabBarInactiveTintColor: "#94a3b8",
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopWidth: 0,
          paddingTop: 6,
          paddingBottom: Platform.OS === "ios" ? 24 : 10,
          height: Platform.OS === "ios" ? 88 : 68,
          elevation: 24,
          shadowColor: "#0f172a",
          shadowOffset: { width: 0, height: -8 },
          shadowOpacity: 0.08,
          shadowRadius: 24,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "700",
          letterSpacing: 0.3,
          marginTop: 2,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="Today"
        component={TodayScreen}
        options={{ tabBarLabel: "Today" }}
      />
      <Tab.Screen
        name="AI"
        component={AIAnalysisScreen}
        options={{ tabBarLabel: "AI" }}
      />
      <Tab.Screen
        name="Health"
        component={HealthScreen}
        options={{ tabBarLabel: "Health" }}
      />
      <Tab.Screen
        name="Analytics"
        component={AnalyticsScreen}
        options={{ tabBarLabel: "Analytics" }}
      />
      <Tab.Screen
        name="Journal"
        component={JournalScreen}
        options={{ tabBarLabel: "Journal" }}
      />
      <Tab.Screen
        name="Profile"
        component={HomeScreen}
        options={{ tabBarLabel: "Profile" }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: "#0ea5e9",
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "700",
          fontSize: 18,
        },
      }}
    >
      <Stack.Screen
        name="Main"
        component={TabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ChangePassword"
        component={ChangePasswordScreen}
        options={{ title: "Change Password", headerShown: true }}
      />
      <Stack.Screen
        name="VerifyEmail"
        component={VerifyEmailScreen}
        options={{ title: "Verify Email", headerShown: true }}
      />
      <Stack.Screen
        name="Schedule"
        component={ScheduleScreen}
        options={{ title: "My Schedule", headerShown: true }}
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  tabIconContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 2,
  },
  tabIndicator: {
    position: "absolute",
    top: -6,
    width: 24,
    height: 3,
    borderRadius: 2,
    backgroundColor: "#0ea5e9",
  },
  tabEmoji: {
    fontSize: 22,
    opacity: 0.6,
  },
  tabEmojiFocused: {
    fontSize: 24,
    opacity: 1,
  },
});

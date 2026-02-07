import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../contexts/AuthContext";

export default function ChangePasswordScreen({ navigation }: any) {
  const { changePassword } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) { Alert.alert("Error", "Please fill in all fields"); return; }
    if (newPassword !== confirmPassword) { Alert.alert("Error", "New passwords do not match"); return; }
    if (newPassword.length < 6) { Alert.alert("Error", "New password must be at least 6 characters"); return; }
    if (currentPassword === newPassword) { Alert.alert("Error", "New password must be different"); return; }

    setLoading(true);
    try {
      await changePassword(currentPassword, newPassword);
      Alert.alert("Success", "Password changed successfully!", [{ text: "OK", onPress: () => navigation.goBack() }]);
    } catch (error: any) {
      Alert.alert("Error", error.response?.data?.error || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.card}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Current Password</Text>
          <View style={styles.inputWrapper}>
            <Text style={styles.inputIcon}>🔒</Text>
            <TextInput style={styles.input} placeholder="Enter current password" placeholderTextColor="#94a3b8" value={currentPassword} onChangeText={setCurrentPassword} secureTextEntry editable={!loading} />
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.inputGroup}>
          <Text style={styles.label}>New Password</Text>
          <View style={styles.inputWrapper}>
            <Text style={styles.inputIcon}>🔐</Text>
            <TextInput style={styles.input} placeholder="Enter new password" placeholderTextColor="#94a3b8" value={newPassword} onChangeText={setNewPassword} secureTextEntry editable={!loading} />
          </View>
          <Text style={styles.helpText}>Minimum 6 characters</Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Confirm New Password</Text>
          <View style={styles.inputWrapper}>
            <Text style={styles.inputIcon}>🔐</Text>
            <TextInput style={styles.input} placeholder="Confirm new password" placeholderTextColor="#94a3b8" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry editable={!loading} />
          </View>
        </View>

        <TouchableOpacity onPress={handleSubmit} disabled={loading} activeOpacity={0.85}>
          <LinearGradient
            colors={loading ? ["#94a3b8", "#94a3b8"] : ["#0ea5e9", "#7c3aed"]}
            style={styles.button}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Change Password</Text>}
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoIcon}>ℹ️</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.infoTitle}>Password Requirements</Text>
          <Text style={styles.infoText}>• Minimum 6 characters long</Text>
          <Text style={styles.infoText}>• Must be different from current</Text>
          <Text style={styles.infoText}>• Use a strong, unique password</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  scrollContent: { padding: 20, paddingBottom: 40 },
  card: { backgroundColor: "#fff", borderRadius: 24, padding: 24, shadowColor: "#0f172a", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 16, elevation: 4, marginBottom: 16 },
  inputGroup: { marginBottom: 18 },
  label: { fontSize: 14, fontWeight: "700", color: "#334155", marginBottom: 8 },
  inputWrapper: { flexDirection: "row", alignItems: "center", backgroundColor: "#f8fafc", borderRadius: 14, borderWidth: 1.5, borderColor: "#e2e8f0", paddingHorizontal: 14 },
  inputIcon: { fontSize: 16, marginRight: 10 },
  input: { flex: 1, paddingVertical: 14, fontSize: 16, color: "#0f172a" },
  helpText: { fontSize: 12, color: "#94a3b8", marginTop: 6, marginLeft: 4 },
  divider: { height: 1, backgroundColor: "#e2e8f0", marginVertical: 12 },
  button: { paddingVertical: 16, borderRadius: 14, alignItems: "center", shadowColor: "#0ea5e9", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 5, marginTop: 8 },
  buttonText: { color: "#fff", fontSize: 17, fontWeight: "800" },
  infoBox: { flexDirection: "row", backgroundColor: "#eff6ff", borderRadius: 16, padding: 16, gap: 12, borderLeftWidth: 4, borderLeftColor: "#0ea5e9" },
  infoIcon: { fontSize: 20 },
  infoTitle: { fontSize: 14, fontWeight: "800", color: "#0369a1", marginBottom: 6 },
  infoText: { fontSize: 13, color: "#0369a1", lineHeight: 20 },
});

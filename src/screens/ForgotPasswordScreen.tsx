import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../contexts/AuthContext";

export default function ForgotPasswordScreen({ navigation }: any) {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!email) { Alert.alert("Error", "Please enter your email address"); return; }
    setLoading(true);
    try {
      await forgotPassword(email);
      setSuccess(true);
    } catch (error: any) {
      Alert.alert("Error", error.response?.data?.error || "Failed to send reset link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#f0f9ff", "#e0f2fe", "#f5f3ff"]} style={StyleSheet.absoluteFill} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          {success ? (
            <>
              <LinearGradient colors={["#10b981", "#059669"]} style={styles.iconCircle} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                <Text style={styles.iconText}>✓</Text>
              </LinearGradient>
              <Text style={styles.title}>Check Your Email</Text>
              <Text style={styles.subtitle}>
                If an account exists with <Text style={styles.emailHighlight}>{email}</Text>, you will receive a password reset link shortly.
              </Text>
              <Text style={styles.helpText}>The link will expire in 1 hour for security reasons.</Text>
              <TouchableOpacity onPress={() => navigation.navigate("Login")} activeOpacity={0.85}>
                <LinearGradient colors={["#0ea5e9", "#7c3aed"]} style={styles.button} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                  <Text style={styles.buttonText}>Back to Login</Text>
                </LinearGradient>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <LinearGradient colors={["#0ea5e9", "#7c3aed"]} style={styles.iconCircle} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                <Text style={styles.iconText}>🔑</Text>
              </LinearGradient>
              <Text style={styles.title}>Forgot Password?</Text>
              <Text style={styles.subtitle}>No worries! Enter your email and we'll send you reset instructions.</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email Address</Text>
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputLeadIcon}>📧</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="you@example.com"
                    placeholderTextColor="#94a3b8"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!loading}
                  />
                </View>
              </View>

              <TouchableOpacity onPress={handleSubmit} disabled={loading} activeOpacity={0.85}>
                <LinearGradient
                  colors={loading ? ["#94a3b8", "#94a3b8"] : ["#0ea5e9", "#7c3aed"]}
                  style={styles.button}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Send Reset Link</Text>}
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                <Text style={styles.backBtnText}>← Back to Login</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: "center", padding: 24 },
  card: { backgroundColor: "#fff", borderRadius: 24, padding: 32, shadowColor: "#0f172a", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.08, shadowRadius: 24, elevation: 6, alignItems: "center" },
  iconCircle: { width: 80, height: 80, borderRadius: 40, justifyContent: "center", alignItems: "center", marginBottom: 20, shadowColor: "#0ea5e9", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 5 },
  iconText: { fontSize: 36, color: "#fff" },
  title: { fontSize: 26, fontWeight: "800", color: "#0f172a", marginBottom: 12 },
  subtitle: { fontSize: 14, color: "#64748b", textAlign: "center", marginBottom: 28, lineHeight: 22 },
  emailHighlight: { fontWeight: "800", color: "#0f172a" },
  helpText: { fontSize: 12, color: "#94a3b8", textAlign: "center", marginBottom: 24 },
  inputGroup: { width: "100%", marginBottom: 24 },
  label: { fontSize: 14, fontWeight: "700", color: "#334155", marginBottom: 8 },
  inputWrapper: { flexDirection: "row", alignItems: "center", backgroundColor: "#f8fafc", borderRadius: 14, borderWidth: 1.5, borderColor: "#e2e8f0", paddingHorizontal: 14 },
  inputLeadIcon: { fontSize: 16, marginRight: 10 },
  input: { flex: 1, paddingVertical: 14, fontSize: 16, color: "#0f172a" },
  button: { width: "100%", paddingVertical: 16, borderRadius: 14, alignItems: "center", shadowColor: "#0ea5e9", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 5 },
  buttonText: { color: "#fff", fontSize: 17, fontWeight: "800" },
  backBtn: { marginTop: 20 },
  backBtnText: { color: "#94a3b8", fontSize: 14, fontWeight: "600" },
});

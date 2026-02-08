import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../contexts/AuthContext";

export default function LoginScreen({ navigation, route }: any) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (route.params?.email) {
      setEmail(route.params.email);
    }
  }, [route.params?.email]);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      await signIn(email, password);
    } catch (error: any) {
      Alert.alert("Login Failed", error.response?.data?.error || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#f0f9ff", "#e0f2fe", "#f5f3ff"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <View style={styles.circle1} />
      <View style={styles.circle2} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo */}
          <View style={styles.logoSection}>
            <LinearGradient
              colors={["#0ea5e9", "#7c3aed"]}
              style={styles.logoBox}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.logoLetter}>D</Text>
            </LinearGradient>
            <Text style={styles.brandName}>DailySync</Text>
            <Text style={styles.welcomeTitle}>Welcome back</Text>
            <Text style={styles.welcomeSubtitle}>Sign in to continue your journey</Text>
          </View>

          {/* Form */}
          <View style={styles.card}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputIcon}>📧</Text>
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

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputIcon}>🔒</Text>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="••••••••"
                  placeholderTextColor="#94a3b8"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  editable={!loading}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                  <Text style={{ fontSize: 18 }}>{showPassword ? "🙈" : "👁️"}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={styles.forgotRow} onPress={() => navigation.navigate("ForgotPassword")}>
              <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleLogin} disabled={loading} activeOpacity={0.85}>
              <LinearGradient
                colors={loading ? ["#94a3b8", "#94a3b8"] : ["#0ea5e9", "#7c3aed"]}
                style={styles.button}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Sign In</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Register")}>
                <Text style={styles.linkText}>Sign up for free</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.trustRow}>
            <View style={styles.trustItem}>
              <Text style={styles.trustCheck}>✓</Text>
              <Text style={styles.trustLabel}>Secure login</Text>
            </View>
            <View style={styles.trustItem}>
              <Text style={styles.trustCheck}>✓</Text>
              <Text style={styles.trustLabel}>Encrypted data</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  circle1: { position: "absolute", top: -60, left: -60, width: 200, height: 200, borderRadius: 100, backgroundColor: "rgba(14,165,233,0.08)" },
  circle2: { position: "absolute", bottom: 60, right: -80, width: 250, height: 250, borderRadius: 125, backgroundColor: "rgba(124,58,237,0.06)" },
  scrollContent: { flexGrow: 1, justifyContent: "center", padding: 24, paddingTop: 60, paddingBottom: 40 },
  logoSection: { alignItems: "center", marginBottom: 32 },
  logoBox: { width: 56, height: 56, borderRadius: 16, justifyContent: "center", alignItems: "center", shadowColor: "#0ea5e9", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 8, marginBottom: 12 },
  logoLetter: { fontSize: 28, fontWeight: "bold", color: "#fff" },
  brandName: { fontSize: 28, fontWeight: "800", color: "#0ea5e9", marginBottom: 16 },
  welcomeTitle: { fontSize: 30, fontWeight: "800", color: "#0f172a", marginBottom: 6 },
  welcomeSubtitle: { fontSize: 16, color: "#64748b" },
  card: { backgroundColor: "#fff", borderRadius: 24, padding: 28, shadowColor: "#0f172a", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.08, shadowRadius: 24, elevation: 6 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: "700", color: "#334155", marginBottom: 8, letterSpacing: 0.2 },
  inputWrapper: { flexDirection: "row", alignItems: "center", backgroundColor: "#f8fafc", borderRadius: 14, borderWidth: 1.5, borderColor: "#e2e8f0", paddingHorizontal: 14 },
  inputIcon: { fontSize: 16, marginRight: 10 },
  input: { flex: 1, paddingVertical: 14, fontSize: 16, color: "#0f172a" },
  eyeBtn: { padding: 4 },
  forgotRow: { alignSelf: "flex-end", marginBottom: 24 },
  forgotText: { fontSize: 14, fontWeight: "700", color: "#0ea5e9" },
  button: { paddingVertical: 16, borderRadius: 14, alignItems: "center", justifyContent: "center", shadowColor: "#0ea5e9", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 5 },
  buttonText: { color: "#fff", fontSize: 17, fontWeight: "800", letterSpacing: 0.5 },
  footer: { flexDirection: "row", justifyContent: "center", marginTop: 24 },
  footerText: { color: "#64748b", fontSize: 15 },
  linkText: { color: "#0ea5e9", fontSize: 15, fontWeight: "700" },
  trustRow: { flexDirection: "row", justifyContent: "center", gap: 24, marginTop: 28 },
  trustItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  trustCheck: { fontSize: 14, color: "#10b981", fontWeight: "bold" },
  trustLabel: { fontSize: 13, color: "#94a3b8", fontWeight: "500" },
});

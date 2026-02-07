import React, { useState } from "react";
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

export default function RegisterScreen({ navigation }: any) {
  const { signUp } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      const result = await signUp(name, email, password);
      if (!result.emailVerified) {
        navigation.navigate("VerifyEmail", { email });
      }
    } catch (error: any) {
      Alert.alert("Registration Failed", error.response?.data?.error || "Please try again");
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

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.logoSection}>
            <LinearGradient colors={["#0ea5e9", "#7c3aed"]} style={styles.logoBox} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <Text style={styles.logoLetter}>D</Text>
            </LinearGradient>
            <Text style={styles.brandName}>DailySync</Text>
            <Text style={styles.welcomeTitle}>Create Account</Text>
            <Text style={styles.welcomeSubtitle}>Start your productivity journey</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputIcon}>👤</Text>
                <TextInput
                  style={styles.input}
                  placeholder="John Doe"
                  placeholderTextColor="#94a3b8"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  editable={!loading}
                />
              </View>
            </View>

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
                  placeholder="Min. 6 characters"
                  placeholderTextColor="#94a3b8"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  editable={!loading}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ padding: 4 }}>
                  <Text style={{ fontSize: 18 }}>{showPassword ? "🙈" : "👁️"}</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.helpText}>Minimum 6 characters</Text>
            </View>

            <TouchableOpacity onPress={handleRegister} disabled={loading} activeOpacity={0.85}>
              <LinearGradient
                colors={loading ? ["#94a3b8", "#94a3b8"] : ["#0ea5e9", "#7c3aed"]}
                style={styles.button}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Create Account</Text>}
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                <Text style={styles.linkText}>Sign in</Text>
              </TouchableOpacity>
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
  scrollContent: { flexGrow: 1, justifyContent: "center", padding: 24, paddingTop: 50, paddingBottom: 40 },
  logoSection: { alignItems: "center", marginBottom: 28 },
  logoBox: { width: 52, height: 52, borderRadius: 14, justifyContent: "center", alignItems: "center", shadowColor: "#0ea5e9", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 8, marginBottom: 10 },
  logoLetter: { fontSize: 26, fontWeight: "bold", color: "#fff" },
  brandName: { fontSize: 24, fontWeight: "800", color: "#0ea5e9", marginBottom: 12 },
  welcomeTitle: { fontSize: 28, fontWeight: "800", color: "#0f172a", marginBottom: 6 },
  welcomeSubtitle: { fontSize: 15, color: "#64748b" },
  card: { backgroundColor: "#fff", borderRadius: 24, padding: 28, shadowColor: "#0f172a", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.08, shadowRadius: 24, elevation: 6 },
  inputGroup: { marginBottom: 18 },
  label: { fontSize: 14, fontWeight: "700", color: "#334155", marginBottom: 8, letterSpacing: 0.2 },
  inputWrapper: { flexDirection: "row", alignItems: "center", backgroundColor: "#f8fafc", borderRadius: 14, borderWidth: 1.5, borderColor: "#e2e8f0", paddingHorizontal: 14 },
  inputIcon: { fontSize: 16, marginRight: 10 },
  input: { flex: 1, paddingVertical: 14, fontSize: 16, color: "#0f172a" },
  helpText: { fontSize: 12, color: "#94a3b8", marginTop: 6, marginLeft: 4 },
  button: { paddingVertical: 16, borderRadius: 14, alignItems: "center", justifyContent: "center", shadowColor: "#0ea5e9", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 5, marginTop: 8 },
  buttonText: { color: "#fff", fontSize: 17, fontWeight: "800", letterSpacing: 0.5 },
  footer: { flexDirection: "row", justifyContent: "center", marginTop: 24 },
  footerText: { color: "#64748b", fontSize: 15 },
  linkText: { color: "#0ea5e9", fontSize: 15, fontWeight: "700" },
});

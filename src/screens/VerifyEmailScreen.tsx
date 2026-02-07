import React, { useState, useEffect } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../contexts/AuthContext";

export default function VerifyEmailScreen({ route, navigation }: any) {
  const { email } = route.params;
  const { verifyEmail, resendOTP } = useAuth();
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleVerify = async () => {
    if (otp.length !== 6) {
      Alert.alert("Error", "Please enter a valid 6-digit OTP");
      return;
    }
    setLoading(true);
    try {
      await verifyEmail(email, otp);
      Alert.alert("Success", "Email verified successfully!");
    } catch (error: any) {
      Alert.alert("Verification Failed", error.response?.data?.error || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setResendLoading(true);
    try {
      await resendOTP(email);
      Alert.alert("Success", "OTP sent successfully!");
      setCooldown(60);
    } catch (error: any) {
      Alert.alert("Error", error.response?.data?.error || "Failed to resend OTP");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#f0f9ff", "#e0f2fe", "#f5f3ff"]} style={StyleSheet.absoluteFill} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          {/* Icon */}
          <LinearGradient colors={["#0ea5e9", "#7c3aed"]} style={styles.iconCircle} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <Text style={styles.iconText}>📧</Text>
          </LinearGradient>

          <Text style={styles.title}>Verify Your Email</Text>
          <Text style={styles.subtitle}>
            We've sent a 6-digit OTP to{"\n"}
            <Text style={styles.emailHighlight}>{email}</Text>
          </Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Enter OTP</Text>
            <TextInput
              style={styles.otpInput}
              placeholder="000000"
              placeholderTextColor="#cbd5e1"
              value={otp}
              onChangeText={(text) => setOtp(text.replace(/\D/g, ""))}
              keyboardType="number-pad"
              maxLength={6}
              textAlign="center"
              editable={!loading}
            />
            <Text style={styles.helpText}>The OTP expires in 10 minutes</Text>
          </View>

          <TouchableOpacity onPress={handleVerify} disabled={loading || otp.length !== 6} activeOpacity={0.85}>
            <LinearGradient
              colors={loading || otp.length !== 6 ? ["#94a3b8", "#94a3b8"] : ["#0ea5e9", "#7c3aed"]}
              style={styles.button}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Verify Email</Text>}
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.resendSection}>
            <Text style={styles.resendLabel}>Didn't receive the code?</Text>
            <TouchableOpacity onPress={handleResendOTP} disabled={resendLoading || cooldown > 0}>
              <Text style={[styles.resendBtn, (resendLoading || cooldown > 0) && { opacity: 0.5 }]}>
                {resendLoading ? "Sending..." : cooldown > 0 ? `Resend in ${cooldown}s` : "Resend OTP"}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backBtnText}>← Back to Login</Text>
          </TouchableOpacity>
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
  iconText: { fontSize: 36 },
  title: { fontSize: 26, fontWeight: "800", color: "#0f172a", marginBottom: 12, textAlign: "center" },
  subtitle: { fontSize: 14, color: "#64748b", textAlign: "center", marginBottom: 28, lineHeight: 22 },
  emailHighlight: { fontWeight: "800", color: "#0f172a" },
  inputGroup: { width: "100%", marginBottom: 24 },
  label: { fontSize: 14, fontWeight: "700", color: "#334155", marginBottom: 8, textAlign: "center" },
  otpInput: { borderWidth: 2, borderColor: "#0ea5e9", borderRadius: 16, padding: 16, fontSize: 28, fontWeight: "800", letterSpacing: 12, color: "#0f172a", backgroundColor: "#f8fafc" },
  helpText: { fontSize: 12, color: "#94a3b8", marginTop: 8, textAlign: "center" },
  button: { width: "100%", paddingVertical: 16, borderRadius: 14, alignItems: "center", shadowColor: "#0ea5e9", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 5 },
  buttonText: { color: "#fff", fontSize: 17, fontWeight: "800" },
  resendSection: { alignItems: "center", marginTop: 24 },
  resendLabel: { color: "#64748b", fontSize: 14, marginBottom: 8 },
  resendBtn: { color: "#0ea5e9", fontSize: 15, fontWeight: "700" },
  backBtn: { marginTop: 20 },
  backBtnText: { color: "#94a3b8", fontSize: 14, fontWeight: "600" },
});

import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authApi, User } from "../services/api";

interface AuthContextData {
  user: User | null;
  token: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    name: string,
    email: string,
    password: string,
  ) => Promise<{ emailVerified: boolean }>;
  signOut: () => Promise<void>;
  verifyEmail: (email: string, otp: string) => Promise<void>;
  resendOTP: (email: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  changePassword: (
    currentPassword: string,
    newPassword: string,
  ) => Promise<void>;
  loadUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedToken = await AsyncStorage.getItem("token");
      const storedUser = await AsyncStorage.getItem("user");

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to load auth from storage:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadUser = async () => {
    try {
      const response = await authApi.me();
      setUser(response.user);
      await AsyncStorage.setItem("user", JSON.stringify(response.user));
    } catch (error) {
      console.error("Failed to load user:", error);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const response = await authApi.login({ email, password });
      setUser(response.user);
      setToken(response.token);
      await AsyncStorage.setItem("token", response.token);
      await AsyncStorage.setItem("user", JSON.stringify(response.user));
    } catch (error) {
      console.error("Sign in failed:", error);
      throw error;
    }
  };

  const signUp = async (name: string, email: string, password: string) => {
    try {
      const response = await authApi.register({ name, email, password });
      // We don't set user/token immediately to force verification flow
      // Or we can set it but handle navigation elsewhere
      // Let's return the user data so the screen can navigate
      return { emailVerified: response.user.emailVerified, user: response.user };
    } catch (error) {
      console.error("Sign up failed:", error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      setUser(null);
      setToken(null);
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("user");
    } catch (error) {
      console.error("Sign out failed:", error);
      throw error;
    }
  };

  const verifyEmail = async (email: string, otp: string) => {
    try {
      await authApi.verifyEmail({ email, otp });
      // Don't loadUser() here as we might not have a token yet
    } catch (error) {
      console.error("Email verification failed:", error);
      throw error;
    }
  };

  const resendOTP = async (email: string) => {
    try {
      await authApi.resendOTP({ email });
    } catch (error) {
      console.error("Resend OTP failed:", error);
      throw error;
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      await authApi.forgotPassword({ email });
    } catch (error) {
      console.error("Forgot password failed:", error);
      throw error;
    }
  };

  const changePassword = async (
    currentPassword: string,
    newPassword: string,
  ) => {
    try {
      await authApi.changePassword({ currentPassword, newPassword });
    } catch (error) {
      console.error("Change password failed:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        signIn,
        signUp,
        signOut,
        verifyEmail,
        resendOTP,
        forgotPassword,
        changePassword,
        loadUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

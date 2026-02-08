import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Update this to your backend URL
// For Android emulator: use 10.0.2.2 instead of localhost
// For iOS simulator: use localhost
// For physical device: use your computer's IP address
const API_URL = "http://192.168.18.91:5000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token to requests
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface User {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
}

export interface AuthResponse {
  user: User;
  token: string;
  message?: string;
}

export const authApi = {
  register: async (data: { email: string; password: string; name: string }) => {
    const response = await api.post<AuthResponse>("/auth/register", data);
    return response.data;
  },

  login: async (data: { email: string; password: string }) => {
    const response = await api.post<AuthResponse>("/auth/login", data);
    return response.data;
  },

  verifyEmail: async (data: { email: string; otp: string }) => {
    const response = await api.post("/auth/verify-email", data);
    return response.data;
  },

  resendOTP: async (data: { email: string }) => {
    const response = await api.post("/auth/resend-otp", data);
    return response.data;
  },

  forgotPassword: async (data: { email: string }) => {
    const response = await api.post("/auth/forgot-password", data);
    return response.data;
  },

  resetPassword: async (data: { token: string; newPassword: string }) => {
    const response = await api.post("/auth/reset-password", data);
    return response.data;
  },

  changePassword: async (data: {
    currentPassword: string;
    newPassword: string;
  }) => {
    const response = await api.post("/auth/change-password", data);
    return response.data;
  },

  me: async () => {
    const response = await api.get<{ user: User }>("/auth/me");
    return response.data;
  },
};

// Task types
export interface Task {
  id: string;
  userId: string;
  templateId?: string;
  date: string;
  name: string;
  startTime: string;
  endTime: string;
  category?: string;
  isCompleted: boolean;
  completedAt?: string;
  notes?: string;
  imageUrl?: string;
  aiData?: any;
  createdAt: string;
  updatedAt: string;
}

export interface TodayTasksResponse {
  date: string;
  dayOfWeek: string;
  tasks: Task[];
}

// Tasks API
export const tasksApi = {
  getToday: async () => {
    const response = await api.get<TodayTasksResponse>("/tasks/today");
    return response.data;
  },

  getByDate: async (date: string) => {
    const response = await api.get<TodayTasksResponse>(`/tasks/${date}`);
    return response.data;
  },

  complete: async (id: string, data: { isCompleted?: boolean; notes?: string }) => {
    const response = await api.patch<{ message: string; task: Task }>(`/tasks/${id}/complete`, data);
    return response.data;
  },

  update: async (id: string, data: { notes?: string; imageUrl?: string; aiData?: any }) => {
    const response = await api.patch<{ message: string; task: Task }>(`/tasks/${id}`, data);
    return response.data;
  },

  create: async (data: { name: string; date: string; startTime: string; endTime: string; category?: string }) => {
    const response = await api.post<{ message: string; task: Task }>("/tasks", data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete<{ message: string }>(`/tasks/${id}`);
    return response.data;
  },
};

// AI Analysis types
export interface FoodAnalysis {
  foodItems: Array<{ name: string; quantity: string }>;
  totalCalories: number;
  macros: {
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
  summary?: string;
}

export interface WorkoutAnalysis {
  workoutType: string;
  exercises: Array<{
    name: string;
    sets?: number;
    reps?: number;
    weight?: string;
    duration?: string;
    distance?: string;
  }>;
  totalDuration?: string;
  caloriesBurned: number;
  summary?: string;
}

// AI API
export const aiApi = {
  analyzeFood: async (base64Image: string) => {
    const response = await api.post<{ success: boolean; data: FoodAnalysis }>("/ai/analyze-food", {
      image: base64Image,
    });
    return response.data;
  },

  analyzeWorkout: async (base64Image: string) => {
    const response = await api.post<{ success: boolean; data: WorkoutAnalysis }>("/ai/analyze-workout", {
      image: base64Image,
    });
    return response.data;
  },

  analyzeGeneral: async (base64Image: string, prompt?: string) => {
    const response = await api.post<{ success: boolean; data: { analysis: string } }>("/ai/analyze-general", {
      image: base64Image,
      prompt,
    });
    return response.data;
  },

  generateSummary: async (date: string) => {
    const response = await api.post<{ dailyLog: any }>("/ai/generate-summary", { date });
    return response.data;
  },

  getJournal: async (date: string) => {
    const response = await api.get<{ journal: any }>(`/ai/journal/${date}`);
    return response.data;
  },

  getJournals: async () => {
    const response = await api.get<{ journals: any[] }>("/ai/journals");
    return response.data;
  },

  getConsistency: async () => {
    const response = await api.get<{ stats: any[] }>("/ai/stats/consistency");
    return response.data;
  },
};

export interface ScheduleTemplate {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  category?: string;
  description?: string;
  isRecurring: boolean;
  daysOfWeek: number[];
}

export const scheduleApi = {
  getTemplates: async () => {
    const response = await api.get<{ templates: ScheduleTemplate[] }>("/schedule/templates");
    return response.data;
  },

  createTemplate: async (data: Partial<ScheduleTemplate>) => {
    const response = await api.post<{ template: ScheduleTemplate }>("/schedule/templates", data);
    return response.data;
  },

  deleteTemplate: async (id: string) => {
    const response = await api.delete<{ message: string }>(`/schedule/templates/${id}`);
    return response.data;
  },

  updateTemplate: async (id: string, data: Partial<ScheduleTemplate>) => {
    const response = await api.put<{ template: ScheduleTemplate }>(`/schedule/templates/${id}`, data);
    return response.data;
  },

  deleteAllTemplates: async () => {
    const response = await api.delete<{ message: string; count: number }>("/schedule/templates");
    return response.data;
  },
};

// Health types
export interface HealthMetrics {
  id: string;
  userId: string;
  date: string;
  sleepDuration?: number;
  sleepQuality?: string;
  bedtime?: string;
  wakeTime?: string;
  restingHeartRate?: number;
  avgHeartRate?: number;
  maxHeartRate?: number;
  minHeartRate?: number;
  steps?: number;
  caloriesBurned?: number;
  activeMinutes?: number;
  distance?: number;
  weight?: number;
  bodyFat?: number;
  bmi?: number;
  caloriesConsumed?: number;
  proteinGrams?: number;
  carbsGrams?: number;
  fatGrams?: number;
  waterIntake?: number;
  moodScore?: number;
  energyLevel?: number;
  stressLevel?: number;
  source?: string;
}

export interface WeeklyStats {
  totalSteps: number;
  avgSteps: number;
  totalCaloriesBurned: number;
  avgSleepDuration: number;
  avgHeartRate: number;
  avgMoodScore: number;
  avgEnergyLevel: number;
  daysTracked: number;
}

export interface WeeklyStatsResponse {
  period: string;
  startDate: string;
  endDate: string;
  stats: WeeklyStats;
  dailyMetrics: Array<{
    date: string;
    steps?: number;
    sleepDuration?: number;
    avgHeartRate?: number;
    moodScore?: number;
    caloriesBurned?: number;
  }>;
}

// Health API
export const healthApi = {
  getToday: async () => {
    const response = await api.get<{ date: string; metrics: HealthMetrics | null }>("/health/today");
    return response.data;
  },

  getByDate: async (date: string) => {
    const response = await api.get<{ date: string; metrics: HealthMetrics | null }>(`/health/${date}`);
    return response.data;
  },

  save: async (data: Partial<HealthMetrics> & { date: string }) => {
    const response = await api.post<{ message: string; metrics: HealthMetrics }>("/health", data);
    return response.data;
  },

  getWeeklyStats: async () => {
    const response = await api.get<WeeklyStatsResponse>("/health/stats/weekly");
    return response.data;
  },

  syncGoogleFit: async (accessToken: string, startDate?: string, endDate?: string) => {
    const response = await api.post<{ message: string; syncedDates: string[]; daysProcessed: number }>(
      "/health/sync/google-fit",
      { accessToken, startDate, endDate }
    );
    return response.data;
  },

  delete: async (date: string) => {
    const response = await api.delete<{ message: string }>(`/health/${date}`);
    return response.data;
  },
};

export default api;

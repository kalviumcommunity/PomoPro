import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Platform } from "react-native";
import Constants from "expo-constants";

// Dynamically resolve API host
function getHostFromExpo() {
  const hostUri =
    Constants.expoConfig?.hostUri ||
    Constants.expoConfig?.developmentClient?.host;
  if (hostUri && typeof hostUri === "string") {
    return hostUri.split(":")[0]; // take only the IP part
  }
  return null;
}

function resolveApiHost() {
  // For web builds (including phone browsers), use the current page's host
  if (Platform.OS === "web") {
    try {
      if (typeof window !== "undefined" && window.location?.hostname) {
        return window.location.hostname;
      }
    } catch {}
  }
  const expoHost = getHostFromExpo();
  if (expoHost) return expoHost;

  if (Platform.OS === "android") return "10.0.2.2"; // Android Emulator
  return "localhost"; // iOS Simulator
}

const RESOLVED_HOST = resolveApiHost();
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? `http://${RESOLVED_HOST}:4000/api`;

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
axiosInstance.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error("Error getting auth token:", error);
    }
    return config;
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error("API Error:", error);

    if (error.response) {
      const errorMessage =
        error.response.data?.error?.message ||
        error.response.data?.message ||
        `HTTP error! status: ${error.response.status}`;

      if (error.response.status === 401) {
        AsyncStorage.removeItem("authToken").catch(console.error);
      }

      return Promise.reject(new Error(errorMessage));
    } else if (error.request) {
      return Promise.reject(
        new Error("Network error - please check your connection and try again")
      );
    } else {
      return Promise.reject(
        new Error(error.message || "An unexpected error occurred")
      );
    }
  }
);

class ApiService {
  constructor() {
    this.axios = axiosInstance;
  }

  async getAuthToken() {
    try {
      return await AsyncStorage.getItem("authToken");
    } catch (error) {
      console.error("Error getting auth token:", error);
      return null;
    }
  }

  async setAuthToken(token) {
    try {
      await AsyncStorage.setItem("authToken", token);
    } catch (error) {
      console.error("Error setting auth token:", error);
    }
  }

  async removeAuthToken() {
    try {
      await AsyncStorage.removeItem("authToken");
    } catch (error) {
      console.error("Error removing auth token:", error);
    }
  }

  // Auth endpoints
  async signup(userData) {
    return this.axios.post("/auth/signup", userData);
  }

  async login(credentials) {
    const response = await this.axios.post("/auth/login", credentials);
    if (response.token) {
      await this.setAuthToken(response.token);
    }
    return response;
  }

  async logout() {
    await this.removeAuthToken();
  }

  async getCurrentUser() {
    return this.axios.get("/auth/me");
  }

  // Task endpoints
  async getTasks(userId) {
    return this.axios.get(`/tasks/${userId}`);
  }

  async createTask(taskData) {
    return this.axios.post("/tasks/create", taskData);
  }

  async updateTask(taskId, updates) {
    return this.axios.patch(`/tasks/${taskId}`, updates);
  }

  async deleteTask(taskId) {
    return this.axios.delete(`/tasks/${taskId}`);
  }

  async incrementPomodoro(taskId) {
    return this.axios.post(`/tasks/${taskId}/increment-pomodoro`);
  }

  // Session endpoints
  async logSession(sessionData) {
    return this.axios.post("/sessions/log", sessionData);
  }

  async getUserSessions(userId, options = {}) {
    const params = new URLSearchParams();
    if (options.limit) params.append("limit", options.limit);
    if (options.offset) params.append("offset", options.offset);
    if (options.type) params.append("type", options.type);

    return this.axios.get(`/sessions/${userId}?${params.toString()}`);
  }

  async getSessionStats(userId, period = "week") {
    return this.axios.get(`/sessions/${userId}/stats?period=${period}`);
  }

  // Organization endpoints
  async createOrganization(orgData) {
    return this.axios.post("/org/create", orgData);
  }

  async joinOrganization(joinData) {
    return this.axios.post("/org/join", joinData);
  }

  async getOrganizations(userId) {
    return this.axios.get(`/org/${userId}`);
  }

  // Shared session endpoints
  async startSharedSession(sessionData) {
    return this.axios.post("/session/shared/start", sessionData);
  }
}

export default new ApiService();

import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const TOKEN_KEY = "token";
const USER_KEY = "user";

// Use hosted backend to avoid mobile local-network issues
const API = axios.create({
	baseURL: "http://localhost:4000/api",
	timeout: 15000,
	headers: { "Content-Type": "application/json" },
});

API.interceptors.request.use(
	async (config) => {
		try {
			const token = await AsyncStorage.getItem(TOKEN_KEY);
			if (token) config.headers.Authorization = `Bearer ${token}`;
		} catch (e) {
			// ignore
		}
		return config;
	},
	(error) => Promise.reject(error)
);

export async function initAuth() {
	try {
		const [token, userString] = await Promise.all([
			AsyncStorage.getItem(TOKEN_KEY),
			AsyncStorage.getItem(USER_KEY),
		]);
		return { token, user: userString ? JSON.parse(userString) : null };
	} catch (err) {
		console.error("Init auth error:", err);
		return { token: null, user: null };
	}
}

export async function register(name, email, password) {
	try {
		const res = await API.post("/users/register", { username: name, email, password });
		const { token, user } = res.data || {};
		if (token && user) {
			await AsyncStorage.setItem(TOKEN_KEY, token);
			await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
		}
		return { success: true, user };
	} catch (err) {
		return {
			success: false,
			message: err?.response?.data?.message || "Registration failed",
		};
	}
}

export async function login(email, password) {
	try {
		const res = await API.post("/users/login", { email, password });
		const { token, user } = res.data || {};
		await AsyncStorage.setItem(TOKEN_KEY, token);
		await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
		return { success: true, user };
	} catch (err) {
		return {
			success: false,
			message: err?.response?.data?.message || "Login failed",
		};
	}
}

export async function logout() {
	await AsyncStorage.removeItem(TOKEN_KEY);
	await AsyncStorage.removeItem(USER_KEY);
}

export async function getStoredAuth() {
	const token = await AsyncStorage.getItem(TOKEN_KEY);
	const userString = await AsyncStorage.getItem(USER_KEY);
	return { token, user: userString ? JSON.parse(userString) : null };
}



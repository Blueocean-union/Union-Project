// libs/api/http.ts
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL || "http://localhost:8000";

const http = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60_000,
});

http.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("@union/accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default http;

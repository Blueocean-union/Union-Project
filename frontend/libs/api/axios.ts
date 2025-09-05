// libs/axios.ts
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const api = axios.create({
  baseURL: 'http://52.78.209.115:8080', // 서버 주소 한 곳으로 통일
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 12000,
});

// 요청 인터셉터: accessToken 자동 주입
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('accessToken');
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

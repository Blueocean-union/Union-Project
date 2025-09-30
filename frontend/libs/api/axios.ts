import axios, { InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const api = axios.create({
  baseURL: 'http://52.78.209.115:8080',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 12000,
});

// 요청 인터셉터: accessToken 자동 주입
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig): Promise<InternalAxiosRequestConfig> => {
    const token = await AsyncStorage.getItem('accessToken');

    if (token) {
      config.headers = {
        ...(config.headers || {}),
        Authorization: `Bearer ${token}`,
      } as any;

      // multipart/form-data 처리
      if (config.headers['Content-Type'] === 'multipart/form-data') {
        delete config.headers['Content-Type']; // boundary 자동 추가
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error) => {
    if (error.response?.status === 401) {
      // 토큰 만료 시 자동 로그아웃
      await AsyncStorage.removeItem('accessToken');
      await AsyncStorage.removeItem('refreshToken');
    }
    return Promise.reject(error);
  }
);

export default api;
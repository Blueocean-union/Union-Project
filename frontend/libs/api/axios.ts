// libs/api/axios.ts
import axios, { InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const api = axios.create({
  baseURL: 'http://52.78.209.115:8080', // 서버 주소
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 12000,
});

// 요청 인터셉터: accessToken 자동 주입
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig): Promise<InternalAxiosRequestConfig> => {
    const token = await AsyncStorage.getItem('accessToken');
    console.log('🔑 Axios 인터셉터 - 토큰:', token ? '존재함' : '없음');

    if (token) {
      // headers가 undefined일 수 있으므로 보장 처리
      config.headers = {
        ...(config.headers || {}),
        Authorization: `Bearer ${token}`,
      } as any;

      // multipart/form-data 처리
      if (config.headers['Content-Type'] === 'multipart/form-data') {
        delete config.headers['Content-Type']; // boundary 자동 추가
      }
    }

    // --- 수정된 부분 ---
    // config.baseURL과 config.url이 undefined일 경우를 대비하여 안전하게 처리합니다.
    console.log('📡 요청 URL:', (config.baseURL ?? '') + (config.url ?? ''));
    console.log('📡 요청 헤더:', config.headers);
    // -------------------

    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터
api.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log('✅ API 응답 성공:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.log('❌ API 응답 에러:', error.response?.status, error.config?.url);
    console.log('❌ 에러 응답 데이터:', error.response?.data);
    return Promise.reject(error);
  }
);

export default api;
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
  console.log('🔧 Axios 인터셉터 - 토큰:', token ? '존재함' : '없음');
  if (token) {
    config.headers = config.headers ?? {};
    
    // multipart/form-data 요청의 경우 Content-Type을 자동으로 설정하지 않음
    if (config.headers['Content-Type'] !== 'multipart/form-data') {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      // multipart 요청의 경우 Authorization만 설정하고 Content-Type은 브라우저가 자동 설정하도록 함
      config.headers.Authorization = `Bearer ${token}`;
      delete config.headers['Content-Type']; // 브라우저가 자동으로 boundary 설정하도록 함
    }
    
    console.log('🔧 Authorization 헤더 설정:', `Bearer ${token.substring(0, 20)}...`);
  }
  console.log('🔧 요청 URL:', config.baseURL + config.url);
  console.log('🔧 요청 헤더:', config.headers);
  return config;
});

// 응답 인터셉터: 에러 처리
api.interceptors.response.use(
  (response) => {
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

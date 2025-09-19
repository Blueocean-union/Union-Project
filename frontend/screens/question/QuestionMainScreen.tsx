// libs/api/axios.ts
import axios, {
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
  AxiosRequestHeaders,
} from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const api = axios.create({
  baseURL: 'http://52.78.209.115:8080',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 12000,
});

// 요청 인터셉터
api.interceptors.request.use(
  // ✅ InternalAxiosRequestConfig 로 타입 고정
  async (config: InternalAxiosRequestConfig): Promise<InternalAxiosRequestConfig> => {
    const token = await AsyncStorage.getItem('accessToken');
    console.log('🔧 Axios 인터셉터 - 토큰:', token ? '존재함' : '없음');

    if (token) {
      const headers: AxiosRequestHeaders = (config.headers ??
        {}) as AxiosRequestHeaders;

      if (headers['Content-Type'] !== 'multipart/form-data') {
        headers['Authorization'] = `Bearer ${token}`;
      } else {
        headers['Authorization'] = `Bearer ${token}`;
        delete headers['Content-Type']; // multipart 는 브라우저가 자동 처리
      }

      config.headers = headers;

      console.log(
        '🔧 Authorization 헤더 설정:',
        `Bearer ${token.substring(0, 20)}...`
      );
    }

    console.log('🔧 요청 URL:', `${config.baseURL ?? ''}${config.url ?? ''}`);
    console.log('🔧 요청 헤더:', config.headers);

    return config; // ✅ Promise<InternalAxiosRequestConfig> 반환
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터
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

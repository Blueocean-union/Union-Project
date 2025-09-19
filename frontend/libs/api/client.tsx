import axios from 'axios';

// 기본 API URL을 설정합니다.
// Expo 환경에서는 Metro Bundler의 URL을 사용하거나, 실제 백엔드 서버 URL로 변경해야 합니다.
const baseURL = 'http://localhost:8080';

const client = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default client;

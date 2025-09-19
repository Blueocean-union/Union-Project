import axios from 'axios';

// 실제 백엔드 서버 주소로 변경
const baseURL = 'http://52.78.209.115:8080';

const client = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default client;


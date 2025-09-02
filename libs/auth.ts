import api from './api';

export const loginUser = async (email: string, password: string) => {
  const response = await api.post('/auth/signin', {
    email,
    password,
  });
  return response.data; // accessToken, refreshToken 포함
};

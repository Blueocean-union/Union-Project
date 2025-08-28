// 사용자 정보 타입

export type User = {
  id: string;
  name: string;
  email: string;
  username: string;
  token?: string; // 로그인 시 발급되는 토큰
};

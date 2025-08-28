// 공통 API 응답 타입

// 일반적인 단일 객체 응답
export type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
};

// 리스트 응답
export type ApiListResponse<T> = {
  success: boolean;
  data: T[];
  totalCount?: number;
  message?: string;
};

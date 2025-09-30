import api from './axios';
import { Quiz, RawQuizResponse } from "../../types/quiz";

// 파일 업로드 + 퀴즈 생성
export async function uploadAndCreateQuiz(formData: FormData): Promise<Quiz[]> {
  // model 파라미터를 쿼리에 추가 (기본값 사용)
  const response = await api.post<RawQuizResponse>(
    "/api/ai/pdfs/quiz?model=model", 
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data.items;
}

// 퀴즈 목록 불러오기
export async function fetchQuizzes(): Promise<Quiz[]> {
  try {
    const response = await api.get<RawQuizResponse>("/api/ai/pdfs/quiz");
    return response.data.items;
  } catch (error: any) {
    // 401이면 빈 배열 반환 (데이터 없음)
    if (error.response?.status === 401) {
      console.log('퀴즈 목록 없음 - 빈 배열 반환');
      return [];
    }
    throw error;
  }
}
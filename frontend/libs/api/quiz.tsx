import { Quiz, RawQuizResponse } from "../../types/quiz";
import { postForm, http } from "./client";

// 파일 업로드 + 퀴즈 생성
export async function uploadAndCreateQuiz(formData: FormData): Promise<Quiz[]> {
  const response = await postForm<RawQuizResponse>("/api/ai/pdfs/quiz", formData);
  return response.items;
}

// 퀴즈 목록 불러오기
export async function fetchQuizzes(): Promise<Quiz[]> {
  const response = await http<RawQuizResponse>("/api/ai/pdfs/quiz");
  return response.items;
}

import client from './client';

export type Answer = {
  id: number;
  content: string;
  writerName: string;
  writerId: number;
  createdAt: string;
  updatedAt: string;
  postId: number;
};

export type AnswerCreate = {
  content: string;
};

export type AnswerUpdate = {
  content: string;
};

// 답변 목록 조회
export const listAnswers = async (postId: number): Promise<Answer[]> => {
  const response = await client.get(`/api/comments?postId=${postId}`);
  return response.data;
};

// 답변 생성
export const createAnswer = async (postId: number, content: string): Promise<Answer> => {
  const response = await client.post(`/api/comments?postId=${postId}`, { content });
  return response.data;
};

// 답변 수정
export const updateAnswer = async (answerId: number, content: string): Promise<Answer> => {
  const response = await client.put(`/api/comments/${answerId}`, { content });
  return response.data;
};

// 답변 삭제
export const deleteAnswer = async (answerId: number): Promise<void> => {
  await client.delete(`/api/comments/${answerId}`);
};

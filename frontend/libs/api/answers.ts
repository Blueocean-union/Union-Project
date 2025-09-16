// frontend/libs/api/answers.ts
import api from './api';

export interface Answer {
  id: number;
  content: string;
  writerName: string;
  createdAt: string;
}

/** 답변 목록 */
export async function listAnswers(postId: number): Promise<Answer[]> {
  const res = await api.get('/api/comments', { params: { postId } });
  return res.data;
}

/** 답변 등록 */
export async function createAnswer(
  postId: number,
  body: { content: string }
): Promise<Answer> {
  const res = await api.post('/api/comments', body, { params: { postId } });
  return res.data;
}

/** 답변 수정 */
export async function updateAnswer(
  id: number,
  body: { content: string }
): Promise<Answer> {
  const res = await api.put(`/api/comments/${id}`, body);
  return res.data;
}

/** 답변 삭제 */
export async function deleteAnswer(id: number): Promise<void> {
  await api.delete(`/api/comments/${id}`);
}

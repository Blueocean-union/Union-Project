// frontend/libs/api/questionFolders.ts
import api from './api';

export interface QuestionFolder {
  id: number;
  name: string;
  createdAt: string;
  updatedAt?: string;
}

/** 질문방 폴더 전체 조회 */
export async function listQuestionFolders(): Promise<QuestionFolder[]> {
  const res = await api.get('/api/question-folders');
  return res.data;
}

/** 질문방 폴더 생성 */
export async function createQuestionFolder(body: { name: string }): Promise<QuestionFolder> {
  const res = await api.post('/api/question-folders', body);
  return res.data;
}

/** 질문방 폴더 수정 */
export async function updateQuestionFolder(id: number, body: { name: string }): Promise<QuestionFolder> {
  const res = await api.put(`/api/question-folders/${id}`, body);
  return res.data;
}

/** 질문방 폴더 삭제 */
export async function deleteQuestionFolder(id: number): Promise<void> {
  await api.delete(`/api/question-folders/${id}`);
}

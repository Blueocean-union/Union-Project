// 답변(댓글) API 래퍼
import api from './api';

export type Answer = {
  id: number;
  content: string;
  writerName: string;
  createdAt: string;
};

// 목록: GET /api/댓글  (쿼리: postId)
export async function listAnswers(postId: number) {
  const res = await api.get<Answer[]>('/댓글', { params: { postId } });
  return res.data;
}

// 등록: POST /api/댓글  (쿼리: postId, 바디: { content })
export async function createAnswer(postId: number, content: string) {
  const res = await api.post<number>('/댓글', { content }, { params: { postId } });
  // 서버가 생성 id를 반환한다고 스웨거에 보여서 number 반환 가정
  return res.data;
}

// 수정: PUT /api/댓글/{id}  (바디: { content })
export async function updateAnswer(id: number, content: string) {
  await api.put(`/댓글/${id}`, { content });
}

// 삭제: DELETE /api/댓글/{id}
export async function deleteAnswer(id: number) {
  await api.delete(`/댓글/${id}`);
}

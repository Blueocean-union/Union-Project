// 댓글 API
import api from './api';

export interface Comment {
  id: number;
  postId: number;
  content: string;
  writerName?: string;
  createdAt: string;
  updatedAt?: string;
}

// 댓글 목록 조회
export async function listComments(postId: number): Promise<Comment[]> {
  const res = await api.get(`/api/comments`, { params: { postId } });
  return res.data;
}

// 댓글 생성
export async function createComment(postId: number, body: { content: string }): Promise<Comment> {
  const res = await api.post(`/api/comments?postId=${postId}`, body);
  return res.data;
}

// 댓글 수정
export async function updateComment(id: number, body: { content: string }): Promise<Comment> {
  const res = await api.put(`/api/comments/${id}`, body);
  return res.data;
}

// 댓글 삭제
export async function deleteComment(id: number): Promise<void> {
  await api.delete(`/api/comments/${id}`);
}

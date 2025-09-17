// frontend/libs/api/posts.ts
import api from './api';

export interface Post {
  id: number;
  title: string;
  content: string;
  categoryId: number;
  // 화면에서 쓰는 필드들(옵셔널)
  categoryName?: string;
  writerName?: string;
  createdAt: string;
  updatedAt?: string;
  folderId?: number;
}

/** 카테고리별 질문 목록 조회 */
export async function listPosts(categoryId: number): Promise<Post[]> {
  const res = await api.get('/api/posts', { params: { categoryId } });
  return res.data;
}

/** 질문 상세 조회 */
export async function getPost(id: number): Promise<Post> {
  const res = await api.get(`/api/posts/${id}`);
  return res.data;
}

/** 질문 생성 */
export async function createPost(body: {
  title: string;
  content: string;
  categoryId: number;
}): Promise<Post> {
  const res = await api.post('/api/posts', body);
  return res.data;
}

/** 질문 수정 */
export async function updatePost(
  id: number,
  body: { title: string; content: string; categoryId: number }
): Promise<Post> {
  const res = await api.put(`/api/posts/${id}`, body);
  return res.data;
}

/** 질문 삭제 */
export async function deletePost(id: number): Promise<void> {
  await api.delete(`/api/posts/${id}`);
}

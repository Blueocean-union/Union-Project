// 질문방 CRUD (스웨거: /api/게시물)
import axios from '../axios';

export type Post = {
  id: number;
  title: string;
  content: string;
  categoryName: string;
  writerName: string;
  createdAt: string;
};

export async function listPosts(params: { categoryId: number }) {
  const res = await axios.get<Post[]>('/게시물', { params });
  return res.data; // 배열 반환
}

export async function getPost(id: number) {
  const res = await axios.get<Post>(`/게시물/${id}`);
  return res.data;
}

export async function createPost(body: { title: string; content: string; categoryId: number }) {
  // 스웨거 예시: 응답이 생성된 ID (number)
  const res = await axios.post<number>('/게시물', body);
  return res.data;
}

export async function updatePost(id: number, body: { title: string; content: string; categoryId: number }) {
  await axios.put(`/게시물/${id}`, body);
}

export async function deletePost(id: number) {
  await axios.delete(`/게시물/${id}`);
}

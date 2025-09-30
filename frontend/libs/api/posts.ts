import api from './axios';  

export type Post = {
  id: number;
  title: string;
  content: string;
  writerName: string;
  writerId: number;
  createdAt: string;
  updatedAt: string;
  categoryId: number;
  views: number;
};

export type PostCreate = {
  title: string;
  content: string;
  categoryId: number;
};

export type PostUpdate = {
  title: string;
  content: string;
};

// 질문 목록 조회
export const listPosts = async (categoryId?: number): Promise<Post[]> => {
  const url = categoryId ? `/api/posts?categoryId=${categoryId}` : '/api/posts';
  const response = await api.get(url);
  return response.data;
};

// 질문 상세 조회
export const getPost = async (postId: number): Promise<Post> => {
  const response = await api.get(`/api/posts/${postId}`);
  return response.data;
};

// 질문 생성
export const createPost = async (data: PostCreate): Promise<Post> => {
  const response = await api.post('/api/posts', data);
  return response.data;
};

// 질문 수정
export const updatePost = async (postId: number, data: PostUpdate): Promise<Post> => {
  const response = await api.put(`/api/posts/${postId}`, data);
  return response.data;
};

// 질문 삭제
export const deletePost = async (postId: number): Promise<void> => {
  await api.delete(`/api/posts/${postId}`);
};
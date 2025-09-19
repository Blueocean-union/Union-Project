// frontend/libs/api/categories.ts
import api from './api';

export interface Category {
  id: number;
  name: string;
}

export async function listCategories(): Promise<Category[]> {
  const res = await api.get('/api/categories');
  return res.data;
}

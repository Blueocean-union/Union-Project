// frontend/libs/api/folders.ts
import api from './api';

export interface Folder {
  id: number;
  name: string;
  createdAt: string;
  updatedAt?: string;
}

/** 폴더 전체 조회 */
export async function listFolders(): Promise<Folder[]> {
  const res = await api.get('/api/folders');
  return res.data;
}

/** 폴더 생성 */
export async function createFolder(body: { name: string }): Promise<Folder> {
  const res = await api.post('/api/folders', body);
  return res.data;
}

/** 폴더 수정 */
export async function updateFolder(id: number, body: { name: string }): Promise<Folder> {
  const res = await api.put(`/api/folders/${id}`, body);
  return res.data;
}

/** 폴더 삭제 */
export async function deleteFolder(id: number): Promise<void> {
  await api.delete(`/api/folders/${id}`);
}

import api from './axios';

export type Folder = {
  id: number;
  name: string;
  createdAt: string;
};

export async function listFolders(): Promise<Folder[]> {
  const res = await api.get<Folder[]>('/api/folders');
  return res.data;
}

export async function createFolder(body: { name: string }): Promise<Folder> {
  const res = await api.post<Folder>('/api/folders', body);
  return res.data;
}

export async function updateFolder(id: number, body: { name: string }): Promise<void> {
  await api.put(`/api/folders/${id}`, body);
}

export async function deleteFolder(id: number): Promise<void> {
  await api.delete(`/api/folders/${id}`);
}

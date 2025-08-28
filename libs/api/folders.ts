// 폴더 API 래퍼
import axios from '../axios';

export type Folder = {
  id: number;
  name: string;
  parentId: number | null;
  subfolders: string[]; // Swagger 예시 기준
};

// 하위 폴더 생성: POST /api/폴더  body: { parentId, name } -> number(새 ID)
export async function createSubfolder(body: { parentId: number; name: string }) {
  const res = await axios.post<number>('/폴더', body);
  return res.data;
}

// 폴더 정보 조회: GET /api/폴더/{id}
export async function getFolder(id: number) {
  const res = await axios.get<Folder>(`/폴더/${id}`);
  return res.data;
}

// 폴더 이름 수정: PATCH /api/폴더/{id}  body: { newName }
export async function renameFolder(id: number, newName: string) {
  await axios.patch(`/폴더/${id}`, { newName });
}

// 폴더 삭제: DELETE /api/폴더/{id}
export async function deleteFolder(id: number) {
  await axios.delete(`/폴더/${id}`);
}

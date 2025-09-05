// 파일 API 래퍼
import api from './api';

export type FileItem = {
  id: number;
  originalFileName: string;
  storedFileName: string;
  fileType: string;
  filePath: string;
  uploadedAt: string;
};

// 폴더 내 파일 목록: GET /api/파일/폴더/{folderId}
export async function listFilesInFolder(folderId: number) {
  const res = await api.get<FileItem[]>(`/파일/폴더/${folderId}`);
  return res.data;
}

// 업로드 (권장: multipart). 서버가 body에 folderId를 어떻게 받는지 명확치 않아
// 쿼리로 ?folderId=... 를 붙였습니다. 필요 시 form.append('folderId', ..)로 변경.
export async function uploadFileMultipart(
  folderId: number,
  file: { uri: string; name: string; type: string }
) {
  const form = new FormData();
  form.append('file', { uri: file.uri, name: file.name, type: file.type } as any);

  const res = await api.post<number>(`/파일?folderId=${folderId}`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data; // fileId
}

// 삭제: DELETE /api/파일/{fileId}
export async function removeFile(fileId: number) {
  await api.delete(`/파일/${fileId}`);
}

// 다운로드 URL 생성 (절대경로가 필요하면 api.defaults.baseURL 사용)
export function buildDownloadUrl(fileId: number) {
  const base = (api.defaults.baseURL || '').replace(/\/+$/, '');
  return `${base}/파일/${fileId}/다운로드`;
}

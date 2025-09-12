// libs/api/quiz.ts
import http from "./http";
import * as FileSystem from "expo-file-system";
import { RawQuizResponse, Quiz } from "../../types/quiz";

/** 서버 응답(JSON) → Quiz로 변환 */
function mapResponseToQuiz(data: RawQuizResponse): Quiz {
  const title = data?.title ?? "AI 생성 퀴즈";
  const items = Array.isArray(data?.questions)
    ? data.questions
    : Array.isArray(data?.items)
    ? data.items
    : [];

  const questions = items.map((q: any, idx: number) => ({
    id: q?.id ?? String(idx + 1),
    text: q?.text ?? q?.question ?? "",
    choices: (q?.choices ?? q?.options ?? []).map((t: any) => ({ text: String(t) })),
    answer: q?.answerIndex ?? q?.answer ?? undefined,
    explanation: q?.explanation ?? q?.reason ?? undefined,
  }));

  return { id: data?.id ?? Math.random().toString(36).slice(2, 10), title, questions };
}

export interface UploadParams {
  files: { uri: string; name?: string; mimeType?: string }[];
  model?: string;     // query
  keyNames?: string;  // body
}

/** POST /api/ai/pdfs/quiz (multipart/form-data) */
export async function uploadAndCreateQuiz(params: UploadParams): Promise<Quiz> {
  const form = new FormData();

  for (const f of params.files) {
    const info = await FileSystem.getInfoAsync(f.uri);
    if (!info.exists) continue;

    // RN: TS 시그니처 회피를 위해 any로 캐스팅
    const rnFile: any = {
      uri: f.uri,
      name: f.name ?? f.uri.split("/").pop() ?? "file.pdf",
      type: f.mimeType ?? "application/pdf",
    };
    form.append("files", rnFile);
  }

  if (params.keyNames) form.append("keyNames", params.keyNames);

  const res = await http.post(`/api/ai/pdfs/quiz`, form, {
    headers: { "Content-Type": "multipart/form-data" },
    params: { model: params.model },
  });

  return mapResponseToQuiz(res.data);
}

// frontend/libs/api/quiz.ts
import { postForm } from './client';
import type { QuizGenerateResponse, QuizItem } from '../../types/quiz';

export type PdfSource = {
  uri: string;
  name?: string;
  type?: string;
};

type GenerateParams = {
  files: PdfSource[];
  model?: string;
  keyNames?: string;
};

/** 서버 응답을 앱에서 쓰는 QuizItem[]으로 변환 */
export function normalizeQuizzes(raw: QuizGenerateResponse): QuizItem[] {
  const arr = Array.isArray(raw?.quizzes) ? raw.quizzes : [];
  return arr.map((q: any) => {
    const opts = [q.option1, q.option2, q.option3, q.option4].filter(Boolean);
    // 서버가 answer를 1~4로 주면 0-index로 변환
    const answer =
      typeof q.answer === 'number'
        ? (Number(q.answer) - 1 >= 0 ? Number(q.answer) - 1 : Number(q.answer))
        : undefined;
    return {
      question: String(q.question ?? ''),
      options: opts,
      difficulty: q.difficulty,
      answer_explanation: q.answer_explanation,
      correctIndex: typeof answer === 'number' ? answer : undefined,
    };
  });
}

/** POST /api/ai/pdfs/quiz  (multipart/form-data) */
export async function generateQuizFromPdfs({
  files,
  model,
  keyNames,
}: GenerateParams): Promise<QuizGenerateResponse> {
  if (!files?.length) throw new Error('PDF 파일이 없습니다.');

  const form = new FormData();

  for (const f of files) {
    const part: any = {
      uri: f.uri,
      name: f.name || 'file.pdf',
      type: f.type || 'application/pdf',
    };
    // RN 전용 file part – TS에서는 Blob이 아니라서 any로 처리
    form.append('files', part as any);
  }

  if (keyNames) form.append('keyNames', keyNames);

  return postForm<QuizGenerateResponse>('/api/ai/pdfs/quiz', form, { model });
}

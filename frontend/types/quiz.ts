// types/quiz.ts
export interface QuizFile {
  id: string;          // 서버가 리턴 안 해도 임시 id 용도로 사용
  filename: string;
  uploadedAt?: string;
}

export interface QuizChoice { text: string }

export interface QuizQuestion {
  id: string;
  text: string;
  choices: QuizChoice[];
  answer?: number;          // 정답 index (옵션)
  explanation?: string;     // 해설 (옵션)
}

export interface Quiz {
  id: string;
  title: string;
  questions: QuizQuestion[];
}

// 서버 원본 응답(JSON) — 매퍼에서 안전하게 처리하기 위해 any 허용
export type RawQuizResponse = any;

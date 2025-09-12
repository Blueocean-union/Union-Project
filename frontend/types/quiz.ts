// types/quiz.ts
export interface QuizChoice {
  text: string;
}

export interface QuizQuestion {
  id: string;
  text: string;
  choices: QuizChoice[];
  answer?: number;          // 정답 index (0-based)
  explanation?: string;     // 해설
  source?: string;          // 출처(파일명 등)
  difficulty?: number;      // 1~5 (별점)
}

export interface Quiz {
  id: string;
  title: string;
  questions: QuizQuestion[];
}

export type RawQuizResponse = any;

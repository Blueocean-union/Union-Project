// frontend/types/navigation.ts
import type { QuizItem } from './quiz';

export type QuizStackParamList = {
  QuizSelect: undefined;
  QuizRoom: { quizzes: QuizItem[] };
  QuizResult: { total: number; correct: number };
};

// 다른 스택 타입들이 이미 있다면 그대로 두고, 위 타입만 export에 포함하세요.

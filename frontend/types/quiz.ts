// types/quiz.ts
export type Choice = {
  id: string;
  text: string;
};

export type Question = {
  id: string;
  text: string;
  choices: Choice[];
  answer: number;          // 정답 인덱스 (0-3)
  explanation?: string;    // 기본 해설
  difficulty: number;      // 난이도 (1-5, 별표 개수)
  wrongExplanation?: string; // 틀렸을 때 추가 해설
};

export type Quiz = {
  id: string;
  title: string;
  questions: Question[];
  pdfFileName?: string;    // PDF 파일명
};

export type QuizResponse = {
  items: Quiz[];
};

// 사용자 답안 상태
export type AnswerStatus = 'correct' | 'incorrect' | 'unanswered';

export type UserAnswer = {
  questionId: string;
  selectedChoice: number;
  status: AnswerStatus;
};
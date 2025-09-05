// frontend/types/quiz.ts
export type QuizItem = {
  question: string;
  options: string[];
  difficulty?: string;
  answer_explanation?: string;
  correctIndex?: number; // 0-index
};

export type QuizQuestion = {
  id: string;
  questionText: string;
  options: Array<{ id: string; text: string }>;
  correctOptionId: string;
  explanation?: string;
};

export type QuizGenerateResponse = {
  quizzes: Array<
    {
      question?: string;
      difficulty?: string;
      option1?: string;
      option2?: string;
      option3?: string;
      option4?: string;
      answer_explanation?: string;
      answer?: number; // 서버가 1~4 등으로 줄 수 있음
    } & Record<string, any>
  >;
};

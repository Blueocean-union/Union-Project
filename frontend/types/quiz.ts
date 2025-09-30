export type Choice = {
  id: string;
  text: string;
};

export type Question = {
  id: string;
  text: string;
  choices: Choice[];
  answer: number;
  difficulty: number;
  explanation?: string;
  wrongExplanation?: string;
};

export type Quiz = {
  id: string;
  title: string;
  questions: Question[];
};

export type RawQuizResponse = {
  items: Quiz[];
};

export type UserAnswer = {
  questionId: string;
  selectedChoice?: number;
  status: 'correct' | 'incorrect' | 'unanswered';
};
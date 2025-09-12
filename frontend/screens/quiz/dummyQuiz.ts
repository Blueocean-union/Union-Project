export type Choice = {
  id: string;
  text: string;
};

export type Question = {
  id: string;
  text: string;
  choices: Choice[];
  answer: number;
  explanation?: string;
};

export type Quiz = {
  id: string;
  title: string;
  questions: Question[];
};

// API 응답 최상위 타입
export type RawQuizResponse = {
  items: Quiz[];
};

// 개별 선택지
export type Choice = {
  id: string;
  text: string;
};

// 문제
export type Question = {
  id: string;
  text: string;
  choices: Choice[];
  answer: number;          // 정답 인덱스
  explanation?: string;    // 해설 (옵션)
};

// 퀴즈
export type Quiz = {
  id: string;
  title: string;
  questions: Question[];
};

// API 응답 최상위
export type RawQuizResponse = {
  items: Quiz[];
};

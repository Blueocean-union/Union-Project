// 하나의 객관식 보기
export type QuizOption = {
  id: string;       // 예: 'a', 'b', 'c', 'd'
  text: string;     // 보기 내용
};

// 퀴즈 문제 하나
export type QuizQuestion = {
  id: string;                   // 문제 ID
  questionText: string;         // 문제 본문
  options: QuizOption[];        // 객관식 보기 리스트
  correctOptionId: string;      // 정답 ID
  explanation?: string;         // 해설 (선택 사항)
  difficulty?: number;          // 난이도 (1~5)
};

// 사용자의 퀴즈 응답
export type QuizAnswer = {
  questionId: string;
  selectedOptionId: string;
};

// 퀴즈 결과 요약
export type QuizResult = {
  total: number;                // 전체 문항 수
  correct: number;              // 맞은 개수
  wrong: number;                // 틀린 개수
  score: number;                // 퍼센트 점수 (예: 85)
};

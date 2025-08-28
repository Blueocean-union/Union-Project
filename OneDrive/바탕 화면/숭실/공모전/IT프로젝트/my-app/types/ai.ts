// 📁 my-app/types/ai.ts

export type AIQuestionType = 'text' | 'image';

export type AIQuestionRequest = {
  type: AIQuestionType;
  content: string; // 질문 텍스트 or 이미지 URL/base64
};

export type AIResponse = {
  answer: string;
  relatedTopics?: string[];
  createdAt: string;
};

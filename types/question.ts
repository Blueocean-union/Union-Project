export type Question = {
  id: number;
  memberId: number;
  title: string;
  content: string;
  createdAt?: string;
};

export type QuestionStackParamList = {
  QuestionCategory: undefined;
  QuestionList: { category: any };
  QuestionDetail: { question: Question };
  QuestionCreate: { categoryId: number };
  QuestionEdit: { question: Question };
};

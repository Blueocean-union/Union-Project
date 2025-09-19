// frontend/types/navigation.ts
import type { QuizItem } from './quiz';

export type QuizStackParamList = {
  QuizSelect: undefined;
  QuizRoom: { quizzes: QuizItem[] };
  QuizResult: { total: number; correct: number };
};

export type SubjectStackParamList = {
  SubjectList: undefined;
  SubjectInner: {
    subjectId: number;
    subjectName: string;
    subjectColor: string;
  };
  SubjectDetail: {
    subjectId: number;
    subjectName: string;
    subjectColor: string;
  };
  PDFDrawing: {
    file: {
      id: number;
      folderId: number;
      originalFileName: string;
      contentType: string;
      size: number;
      updatedAt: string;
      deleted: boolean;
    };
    fileUri: string;
    subjectColor: string;
  };
  FileSummury: {
    file: {
      id: number;
      folderId: number;
      originalFileName: string;
      contentType: string;
      size: number;
      updatedAt: string;
      deleted: boolean;
    };
    subjectColor: string;
  };
};

// 다른 스택 타입들이 이미 있다면 그대로 두고, 위 타입만 export에 포함하세요.

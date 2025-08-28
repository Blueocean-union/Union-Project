// 과목 정보, 진도율, 자료 목록 등

export type Subject = {
  id: string;
  title: string;
  progress: number; // 예: 0.75 = 75%
  color?: string;   // 카드 색상 등 UI용
};

export type SubjectFile = {
  id: string;
  name: string;
  type: 'pdf' | 'audio' | 'doc';
  url: string;
};

export type SubjectDetail = {
  id: string;
  description?: string;
  files: SubjectFile[];
};

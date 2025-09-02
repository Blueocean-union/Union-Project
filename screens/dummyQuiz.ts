
// screens/dummyQuiz.ts
import type { QuizQuestion } from './QuizRoomScreen';

export const dummyQuizData: QuizQuestion[] = [
  {
    id: 'q1',
    text: 'React의 상태관리 Hook은?',
    choices: [
      { id: 'a', text: 'useState' },
      { id: 'b', text: 'useStyle' },
      { id: 'c', text: 'useClass' },
    ],
    answerId: 'a',
  },
  {
    id: 'q2',
    text: 'TypeScript의 기본 파일 확장자?',
    choices: [
      { id: 'a', text: '.js' },
      { id: 'b', text: '.ts' },
      { id: 'c', text: '.tsx' },
    ],
    answerId: 'b',
  },
];

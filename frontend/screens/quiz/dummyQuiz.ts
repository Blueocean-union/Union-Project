// screens/quiz/dummyQuiz.ts
import { Quiz } from "../../types/quiz";
const dummy: Quiz = {
  id: "dummy",
  title: "샘플 퀴즈",
  questions: [
    {
      id: "1",
      text: "2+2?",
      choices: [{ text: "3" }, { text: "4" }, { text: "5" }],
      answer: 1,
      explanation: "2+2=4",
    },
  ],
};
export default dummy;

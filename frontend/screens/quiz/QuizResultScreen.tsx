// screens/quiz/QuizResultScreen.tsx
import React from "react";
import { View, Text, ScrollView } from "react-native";
import { Quiz, QuizQuestion } from "../../types/quiz";

type Props = { route: any; navigation: any };

export default function QuizResultScreen({ route }: Props) {
  const { quiz, userAnswers } = route.params as {
    quiz: Quiz;
    userAnswers: Record<string, number | undefined>;
  };

  const total = quiz.questions.length;
  const correct = quiz.questions.reduce(
    (acc: number, q: QuizQuestion) => acc + (q.answer === userAnswers[q.id] ? 1 : 0),
    0
  );

  return (
    <ScrollView contentContainerStyle={{ padding: 20, gap: 12 }}>
      <Text style={{ fontSize: 18, fontWeight: "bold" }}>{`정답: ${correct}/${total}`}</Text>
      {quiz.questions.map((q, i) => (
        <View key={q.id} style={{ paddingVertical: 10 }}>
          <Text style={{ fontWeight: "600" }}>{`${i + 1}. ${q.text}`}</Text>
          <Text style={{ opacity: 0.7 }}>
            당신의 선택: {userAnswers[q.id] !== undefined ? (userAnswers[q.id]! + 1) : "-"}
            {typeof q.answer === "number" ? ` / 정답: ${q.answer + 1}` : ""}
          </Text>
          {q.explanation ? <Text style={{ marginTop: 4, opacity: 0.7 }}>해설: {q.explanation}</Text> : null}
        </View>
      ))}
    </ScrollView>
  );
}

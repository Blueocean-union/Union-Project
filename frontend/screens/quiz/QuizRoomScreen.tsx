// screens/quiz/QuizRoomScreen.tsx
import React, { useState } from "react";
import { View, Text, Pressable, Alert, ScrollView } from "react-native";
import { Quiz, QuizQuestion } from "../../types/quiz";

type Props = { route: any; navigation: any };

export default function QuizRoomScreen({ route }: Props) {
  const { quiz } = route.params ?? {};
  const [answers, setAnswers] = useState<Record<string, number | undefined>>({});

  if (!quiz)
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text>퀴즈 불러오는 중…</Text>
      </View>
    );

  const submit = () => {
    const total = quiz.questions.length;
    const correct = quiz.questions.reduce(
      (acc: number, q: QuizQuestion) => acc + (q.answer === answers[q.id] ? 1 : 0),
      0
    );
    Alert.alert("결과", `${correct}/${total} 정답`);
    // navigation.navigate("QuizResult", { quiz, userAnswers: answers }); // 결과 화면 사용 시
  };

  const select = (q: QuizQuestion, idx: number) =>
    setAnswers((s) => ({ ...s, [q.id]: idx }));

  return (
    <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: "bold" }}>{quiz.title}</Text>

      {quiz.questions.map((q: QuizQuestion, qi: number) => (
        <View key={q.id} style={{ paddingVertical: 10 }}>
          <Text style={{ fontWeight: "600", marginBottom: 8 }}>
            {qi + 1}. {q.text}
          </Text>

          {q.choices.map((c, ci) => {
            const chosen = answers[q.id] === ci;
            return (
              <Pressable
                key={ci}
                onPress={() => select(q, ci)}
                style={{
                  padding: 10,
                  borderWidth: 1,
                  borderColor: chosen ? "#333" : "#ccc",
                  borderRadius: 8,
                  marginBottom: 8,
                }}
              >
                <Text>{c.text}</Text>
              </Pressable>
            );
          })}

          {typeof q.answer === "number" && answers[q.id] !== undefined && (
            <Text style={{ marginTop: 6, opacity: 0.7 }}>
              {answers[q.id] === q.answer
                ? "✅ 정답!"
                : `❌ 오답. 정답: ${q.answer + 1}`}
              {q.explanation ? ` / 해설: ${q.explanation}` : ""}
            </Text>
          )}
        </View>
      ))}

      <Pressable
        onPress={submit}
        style={{
          padding: 14,
          backgroundColor: "#222",
          borderRadius: 10,
          alignItems: "center",
          marginTop: 12,
        }}
      >
        <Text style={{ color: "white", fontWeight: "600" }}>제출</Text>
      </Pressable>
    </ScrollView>
  );
}

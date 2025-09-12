// screens/quiz/QuizRoomScreen.tsx
import React, { useState } from "react";
import {
  View, Text, Pressable, ScrollView, StyleSheet, SafeAreaView
} from "react-native";
import { Quiz, QuizQuestion } from "../../types/quiz";

type Props = { route: any; navigation: any };
const ABC = ["A", "B", "C", "D", "E", "F", "G"];

export default function QuizRoomScreen({ route }: Props) {
  const { quiz } = route.params ?? {};
  const [answers, setAnswers] = useState<Record<string, number | undefined>>({});

  if (!quiz)
    return (
      <SafeAreaView style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text>퀴즈 불러오는 중…</Text>
      </SafeAreaView>
    );

  const onChoose = (q: QuizQuestion, idx: number) =>
    setAnswers((s) => ({ ...s, [q.id]: idx }));

  const isCorrect = (q: QuizQuestion, idx?: number) =>
    typeof q.answer === "number" && idx !== undefined && q.answer === idx;

  const Star = ({ n = 0 }: { n?: number }) => (
    <Text style={{ color: "#9CA3AF", fontSize: 12 }}>
      {"★".repeat(n || 0)}{"☆".repeat(Math.max(0, 5 - (n || 0)))}
    </Text>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F3F4F6" }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={S.headerWrap}>
          <Text style={S.title}>{quiz.title}</Text>
        </View>

        {quiz.questions.map((q, qi) => {
          const selected = answers[q.id];
          const correct = isCorrect(q, selected);

          return (
            <View key={q.id} style={S.card}>
              <View style={S.cardHead}>
                <Text style={S.qTitle}>
                  {`Q${qi + 1}. `}{q.text}
                </Text>
                <Star n={q.difficulty ?? 0} />
              </View>

              <View style={{ marginTop: 8 }}>
                {q.choices.map((c, ci) => {
                  const chosen = selected === ci;
                  const showRight = typeof q.answer === "number" && q.answer === ci && selected !== undefined;
                  const showWrong = chosen && !showRight;

                  return (
                    <Pressable
                      key={ci}
                      onPress={() => onChoose(q, ci)}
                      style={[
                        S.choice,
                        chosen && { borderColor: "#3955FF" },
                        showRight && { backgroundColor: "#EDF5FF", borderColor: "#3955FF" },
                        showWrong && { backgroundColor: "#FEF2F2", borderColor: "#EF4444" },
                      ]}
                    >
                      <Text style={[S.choiceLabel, chosen && { color: "#3955FF" }]}>
                        {ABC[ci] || `${ci + 1}`}
                      </Text>
                      <Text style={S.choiceText}>{c.text}</Text>

                      {showRight && <Text style={S.markRight}>✔</Text>}
                      {showWrong && <Text style={S.markWrong}>✖</Text>}
                    </Pressable>
                  );
                })}
              </View>

              {/* 선택한 경우, 문제 바로 아래 해설/출처 표시 */}
              {selected !== undefined && (
                <View style={S.explainBox}>
                  {typeof q.answer === "number" && (
                    <Text style={S.explainTitle}>
                      {selected === q.answer ? "정답입니다! 🎉" : `오답입니다. 정답: ${ABC[q.answer] ?? q.answer + 1}`}
                    </Text>
                  )}
                  {!!q.explanation && (
                    <Text style={S.explainText}>{q.explanation}</Text>
                  )}
                  {!!q.source && (
                    <Text style={S.explainSource}>{`출처 : ${q.source}`}</Text>
                  )}
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const S = StyleSheet.create({
  headerWrap: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 10, backgroundColor: "#F3F4F6" },
  title: { fontSize: 30, fontWeight: "900", color: "#1F2937", letterSpacing: 1 },
  card: {
    marginHorizontal: 16, marginTop: 16, padding: 14, borderRadius: 16,
    backgroundColor: "white", borderWidth: 1, borderColor: "#E5E7EB",
    shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 10, shadowOffset: { width: 0, height: 4 },
  },
  cardHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 12 },
  qTitle: { fontSize: 18, fontWeight: "800", color: "#111827", flex: 1, lineHeight: 24 },
  choice: {
    marginTop: 8, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: "#E5E7EB",
    flexDirection: "row", alignItems: "center", gap: 10, position: "relative",
  },
  choiceLabel: { width: 22, textAlign: "center", fontWeight: "800", color: "#6B7280" },
  choiceText: { flex: 1, color: "#111827" },
  markRight: { position: "absolute", right: 12, top: 10, color: "#16A34A", fontSize: 16, fontWeight: "900" },
  markWrong: { position: "absolute", right: 12, top: 10, color: "#EF4444", fontSize: 16, fontWeight: "900" },
  explainBox: {
    marginTop: 12, padding: 12, borderRadius: 12, backgroundColor: "#F9FAFB", borderWidth: 1, borderColor: "#E5E7EB",
  },
  explainTitle: { fontWeight: "800", marginBottom: 6, color: "#111827" },
  explainText: { color: "#374151", lineHeight: 20 },
  explainSource: { marginTop: 6, color: "#9CA3AF", fontSize: 12, textAlign: "right" },
});

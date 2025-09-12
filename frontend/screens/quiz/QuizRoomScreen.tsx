import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { Quiz, Question, Choice } from "../../types/quiz";

type Props = {
  quiz: Quiz;
};

const QuizRoomScreen: React.FC<Props> = ({ quiz }) => {
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: string]: number }>({});

  const handleSelect = (question: Question, choice: Choice, choiceIndex: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [question.id]: choiceIndex,
    }));
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{quiz.title}</Text>

      {quiz.questions.map((q: Question, qi: number) => {
        const selected = selectedAnswers[q.id];
        return (
          <View key={qi} style={styles.card}>
            <Text style={styles.question}>
              Q{qi + 1}. {q.text}
            </Text>

            {q.choices.map((c: Choice, ci: number) => {
              const isSelected = selected === ci;
              const isCorrect = q.answer === ci;

              return (
                <TouchableOpacity
                  key={ci}
                  style={[
                    styles.choice,
                    isSelected && (isCorrect ? styles.correctChoice : styles.incorrectChoice),
                  ]}
                  onPress={() => handleSelect(q, c, ci)}
                >
                  <Text
                    style={[
                      styles.choiceText,
                      isSelected && (isCorrect ? styles.correctText : styles.incorrectText),
                    ]}
                  >
                    {String.fromCharCode(65 + ci)}. {c.text}
                  </Text>
                </TouchableOpacity>
              );
            })}

            {/* 정답 및 해설 */}
            {selected !== undefined && (
              <View style={styles.explanationBox}>
                <Text style={styles.explanation}>
                  정답: {String.fromCharCode(65 + q.answer)}. {q.choices[q.answer].text}
                </Text>
                {q.explanation && <Text style={styles.explanation}>{q.explanation}</Text>}
              </View>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f8f9fa",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  question: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  choice: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 8,
  },
  choiceText: {
    fontSize: 15,
  },
  correctChoice: {
    backgroundColor: "#e6f7e6",
    borderColor: "#28a745",
  },
  incorrectChoice: {
    backgroundColor: "#fdecea",
    borderColor: "#dc3545",
  },
  correctText: {
    color: "#28a745",
    fontWeight: "bold",
  },
  incorrectText: {
    color: "#dc3545",
    fontWeight: "bold",
  },
  explanationBox: {
    marginTop: 10,
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#f1f3f5",
  },
  explanation: {
    fontSize: 14,
    color: "#333",
    marginBottom: 4,
  },
});

export default QuizRoomScreen;

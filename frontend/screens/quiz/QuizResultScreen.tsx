import React from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { Quiz, UserAnswer } from "../../types/quiz";
import { Ionicons } from '@expo/vector-icons';

type Props = { 
  route: any; 
  navigation: any; 
};

export default function QuizResultScreen({ route, navigation }: Props) {
  const { quiz, userAnswers, totalQuestions, correctAnswers } = route.params as {
    quiz: Quiz;
    userAnswers: { [key: string]: UserAnswer };
    totalQuestions: number;
    correctAnswers: number;
  };

  const percentage = Math.round((correctAnswers / totalQuestions) * 100);
  
  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return "#28a745";
    if (percentage >= 60) return "#ffc107";
    return "#dc3545";
  };

  const getScoreMessage = (percentage: number) => {
    if (percentage >= 90) return "훌륭합니다! 🎉";
    if (percentage >= 80) return "잘했습니다! 👏";
    if (percentage >= 60) return "괜찮습니다! 👍";
    return "더 공부해보세요! 💪";
  };

  const renderStars = (difficulty: number) => {
    return (
      <View style={styles.starsContainer}>
        {Array.from({ length: 5 }, (_, i) => (
          <Ionicons
            key={i}
            name={i < difficulty ? "star" : "star-outline"}
            size={14}
            color="#FFD700"
          />
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#4A90E2" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>퀴즈 결과</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content}>
        {/* 점수 요약 */}
        <View style={styles.scoreCard}>
          <View style={styles.scoreCircle}>
            <Text style={[styles.scoreText, { color: getScoreColor(percentage) }]}>
              {percentage}%
            </Text>
            <Text style={styles.scoreSubtext}>
              {correctAnswers}/{totalQuestions}
            </Text>
          </View>
          <Text style={styles.scoreMessage}>{getScoreMessage(percentage)}</Text>
        </View>

        {/* 문제별 결과 */}
        <View style={styles.resultsSection}>
          <Text style={styles.sectionTitle}>문제별 결과</Text>
          
          {quiz.questions.map((question, index) => {
            const userAnswer = userAnswers[question.id];
            const isCorrect = userAnswer?.status === 'correct';
            const userChoice = userAnswer?.selectedChoice;
            
            return (
              <View key={question.id} style={styles.questionCard}>
                <View style={styles.questionHeader}>
                  <View style={styles.questionNumberSection}>
                    <View style={[
                      styles.questionNumber, 
                      isCorrect ? styles.correctNumber : styles.incorrectNumber
                    ]}>
                      <Text style={styles.questionNumberText}>Q{index + 1}</Text>
                      {isCorrect ? (
                        <Text style={styles.correctIcon}>○</Text>
                      ) : (
                        <Text style={styles.incorrectIcon}>✗</Text>
                      )}
                    </View>
                    {renderStars(question.difficulty)}
                  </View>
                </View>

                <Text style={styles.questionText}>{question.text}</Text>

                <View style={styles.answerSection}>
                  <View style={styles.answerRow}>
                    <Text style={styles.answerLabel}>당신의 선택:</Text>
                    <Text style={[
                      styles.answerText, 
                      isCorrect ? styles.correctAnswer : styles.incorrectAnswer
                    ]}>
                      {userChoice !== undefined 
                        ? `${String.fromCharCode(65 + userChoice)}. ${question.choices[userChoice].text}`
                        : "선택하지 않음"
                      }
                    </Text>
                  </View>
                  
                  {!isCorrect && (
                    <View style={styles.answerRow}>
                      <Text style={styles.answerLabel}>정답:</Text>
                      <Text style={[styles.answerText, styles.correctAnswer]}>
                        {String.fromCharCode(65 + question.answer)}. {question.choices[question.answer].text}
                      </Text>
                    </View>
                  )}
                </View>

                {question.explanation && (
                  <View style={styles.explanationContainer}>
                    <View style={styles.explanationHeader}>
                      <Ionicons name="bulb-outline" size={16} color="#4A90E2" />
                      <Text style={styles.explanationTitle}>해설</Text>
                    </View>
                    <Text style={styles.explanationText}>{question.explanation}</Text>
                  </View>
                )}

                {!isCorrect && question.wrongExplanation && (
                  <View style={styles.wrongExplanationContainer}>
                    <Text style={styles.wrongExplanationTitle}>💡 헷갈릴만한 이유</Text>
                    <Text style={styles.wrongExplanationText}>{question.wrongExplanation}</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => navigation.navigate("QuizRoom", { quiz })}
        >
          <Ionicons name="refresh" size={20} color="#4A90E2" />
          <Text style={styles.retryButtonText}>다시 풀기</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.homeButton}
          onPress={() => navigation.navigate("QuizSelect")}
        >
          <Ionicons name="home" size={20} color="#fff" />
          <Text style={styles.homeButtonText}>퀴즈 목록</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  headerRight: {
    width: 24,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  scoreCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  scoreCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#f8f9fa",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    borderWidth: 4,
    borderColor: "#e9ecef",
  },
  scoreText: {
    fontSize: 32,
    fontWeight: "bold",
  },
  scoreSubtext: {
    fontSize: 16,
    color: "#6c757d",
    marginTop: 4,
  },
  scoreMessage: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2c3e50",
  },
  resultsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 16,
  },
  questionCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  questionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  questionNumberSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  questionNumber: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: "#f8f9fa",
  },
  correctNumber: {
    backgroundColor: "#d4edda",
  },
  incorrectNumber: {
    backgroundColor: "#f8d7da",
  },
  questionNumberText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#495057",
    marginRight: 4,
  },
  correctIcon: {
    color: "#28a745",
    fontSize: 16,
    fontWeight: "bold",
  },
  incorrectIcon: {
    color: "#dc3545",
    fontSize: 14,
    fontWeight: "bold",
  },
  starsContainer: {
    flexDirection: "row",
  },
  questionText: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 16,
    color: "#2c3e50",
    lineHeight: 24,
  },
  answerSection: {
    marginBottom: 12,
  },
  answerRow: {
    flexDirection: "row",
    marginBottom: 8,
    flexWrap: "wrap",
  },
  answerLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6c757d",
    minWidth: 80,
  },
  answerText: {
    fontSize: 14,
    flex: 1,
    flexWrap: "wrap",
  },
  correctAnswer: {
    color: "#28a745",
  },
  incorrectAnswer: {
    color: "#dc3545",
  },
  explanationContainer: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#f8f9fa",
    borderLeftWidth: 4,
    borderLeftColor: "#4A90E2",
  },
  explanationHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  explanationTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#4A90E2",
    marginLeft: 4,
  },
  explanationText: {
    fontSize: 13,
    color: "#495057",
    lineHeight: 18,
  },
  wrongExplanationContainer: {
    marginTop: 8,
    padding: 10,
    borderRadius: 6,
    backgroundColor: "#fff3cd",
    borderWidth: 1,
    borderColor: "#ffeaa7",
  },
  wrongExplanationTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#856404",
    marginBottom: 4,
  },
  wrongExplanationText: {
    fontSize: 12,
    color: "#856404",
    lineHeight: 16,
  },
  footer: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e9ecef",
  },
  retryButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#4A90E2",
    borderRadius: 12,
    padding: 12,
  },
  retryButtonText: {
    color: "#4A90E2",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 6,
  },
  homeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4A90E2",
    borderRadius: 12,
    padding: 12,
  },
  homeButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 6,
  },
});
import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { QuizQuestion } from '../../types/quiz';

export default function QuizResultScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { quizData, userAnswers } = route.params as {
    quizData: QuizQuestion[];
    userAnswers: { [key: string]: string };
  };

  const renderItem = ({ item }: { item: QuizQuestion }) => {
    const userChoice = userAnswers[item.id];
    const isCorrect = userChoice === item.correctOptionId;
    const correctOption = item.options.find(o => o.id === item.correctOptionId)?.text;
    const userOption = item.options.find(o => o.id === userChoice)?.text;

    return (
      <View style={styles.resultBox}>
        <Text style={styles.question}>{item.questionText}</Text>
        <Text>내 답변: {userOption}</Text>
        <Text>정답: {correctOption}</Text>
        <Text style={{ color: isCorrect ? 'green' : 'red' }}>
          {isCorrect ? '정답입니다!' : '오답입니다'}
        </Text>
        {item.explanation && <Text>해설: {item.explanation}</Text>}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>퀴즈 결과</Text>
      <FlatList data={quizData} renderItem={renderItem} keyExtractor={(item: QuizQuestion) => item.id} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  resultBox: { padding: 12, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, marginBottom: 12 },
  question: { fontWeight: 'bold', marginBottom: 6 },
});

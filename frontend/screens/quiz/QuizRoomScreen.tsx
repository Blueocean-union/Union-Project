// screens/QuizRoomScreen.tsx
import React, { useMemo, useState } from 'react';
import { View, Text, Button, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

export type QuizQuestion = {
  id: string;
  text: string;
  choices: { id: string; text: string }[];
  answerId: string;
};

type RouteParams = { quizData: QuizQuestion[] };

export default function QuizRoomScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();

  const quizData: QuizQuestion[] = (route.params?.quizData ?? []) as QuizQuestion[];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [userAnswers, setUserAnswers] = useState<{ [key: string]: string }>({});

  const q = useMemo(() => quizData[currentIndex], [quizData, currentIndex]);

  const handleSelect = (id: string) => setSelectedId(id);

  const handleNext = () => {
    if (!q) return;
    setUserAnswers((prev) => ({ ...prev, [q.id]: selectedId ?? '' }));

    if (currentIndex < quizData.length - 1) {
      setSelectedId(null);
      setCurrentIndex((prev) => prev + 1);
    } else {
      navigation.navigate('QuizResult', { quizData, userAnswers });
    }
  };

  if (!q) {
    return (
      <View style={styles.container}>
        <Text>퀴즈 데이터가 없습니다.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.q}>{q.text}</Text>
      <View style={{ gap: 8 }}>
        {q.choices.map((c) => (
          <TouchableOpacity
            key={c.id}
            style={[
              styles.choice,
              selectedId === c.id && styles.choiceSelected,
            ]}
            onPress={() => handleSelect(c.id)}
          >
            <Text style={styles.choiceText}>{c.text}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={{ height: 12 }} />
      <Button title={currentIndex < quizData.length - 1 ? '다음' : '결과 보기'} onPress={handleNext} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12 },
  q: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  choice: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  choiceSelected: { borderColor: '#1a73e8' },
  choiceText: { fontSize: 16 },
});

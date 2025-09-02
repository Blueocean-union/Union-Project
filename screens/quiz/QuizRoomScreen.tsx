import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { QuizItem } from '../../types/quiz';

export default function QuizRoomScreen() {
  const nav = useNavigation<any>();
  const route = useRoute<any>();
  const quizzes: QuizItem[] = route.params?.quizzes || [];

  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [correct, setCorrect] = useState(0);

  const q = useMemo(() => quizzes[idx], [quizzes, idx]);

  const submit = () => {
    if (selected == null) {
      Alert.alert('선택', '보기를 선택해 주세요.');
      return;
    }
    const isCorrect =
      typeof q?.correctIndex === 'number' ? q.correctIndex === selected : false;
    if (isCorrect) setCorrect((c) => c + 1);

    if (idx + 1 >= quizzes.length) {
      nav.replace('QuizResult', { total: quizzes.length, correct: isCorrect ? correct + 1 : correct });
    } else {
      setIdx((i) => i + 1);
      setSelected(null);
    }
  };

  if (!q) {
    return (
      <View style={SS.container}>
        <Text>퀴즈가 없습니다.</Text>
      </View>
    );
  }

  return (
    <View style={SS.container}>
      <Text style={SS.number}>
        {idx + 1} / {quizzes.length}
      </Text>
      <Text style={SS.question}>{q.question}</Text>

      <View style={{ gap: 10, marginTop: 10 }}>
        {q.options.map((opt, i) => {
          const active = selected === i;
          return (
            <TouchableOpacity
              key={i}
              style={[SS.option, active && SS.optionActive]}
              onPress={() => setSelected(i)}
            >
              <Text style={[SS.optionText, active && { color: '#fff' }]}>{opt}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity onPress={submit} style={SS.submit}>
        <Text style={SS.submitText}>{idx + 1 >= quizzes.length ? '결과 보기' : '다음'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const SS = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f8fafc' },
  number: { color: '#64748b', marginBottom: 6 },
  question: { fontSize: 18, fontWeight: '700', marginBottom: 10 },
  option: {
    backgroundColor: '#e5e7eb',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  optionActive: { backgroundColor: '#4f6af3' },
  optionText: { color: '#111827', fontSize: 15 },
  submit: {
    marginTop: 24,
    backgroundColor: '#4f6af3',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});

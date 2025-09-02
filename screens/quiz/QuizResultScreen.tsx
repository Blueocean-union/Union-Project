import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRoute } from '@react-navigation/native';

export default function QuizResultScreen() {
  const route = useRoute<any>();
  const total: number = route.params?.total ?? 0;
  const correct: number = route.params?.correct ?? 0;

  return (
    <View style={S.container}>
      <Text style={S.title}>결과</Text>
      <Text style={S.score}>
        {correct} / {total}
      </Text>
    </View>
  );
}

const S = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f8fafc', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: '800', marginBottom: 8 },
  score: { fontSize: 28, fontWeight: '900', color: '#4f6af3', marginBottom: 20 },
});

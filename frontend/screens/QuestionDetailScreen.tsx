import React from 'react';
import { ScrollView, Text } from 'react-native';

export default function QuestionDetailScreen({ route }) {
  const { question } = route.params;

  return (
    <ScrollView style={{ flex: 1, padding: 24 }}>
      <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 8 }}>{question.title}</Text>
      <Text style={{ color: '#666', marginBottom: 16 }}>{question.date}</Text>
      <Text style={{ fontSize: 16, marginBottom: 24 }}>
        {question.preview} 질문에 대한 자세한 설명이 여기에 들어갑니다...
      </Text>
      <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>사용자 a</Text>
      <Text>→ 답변: 자료구조에서 POP을 하면 가장 마지막에 넣은 항목이 먼저 나옵니다.</Text>
    </ScrollView>
  );
}

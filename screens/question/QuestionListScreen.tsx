import React from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';

const questions = [
  { id: 'q1', title: '자료구조 스택 출력 문제', preview: '스택의 출력 순서가 왜 이렇게 되는지 모르겠어요', date: '2024.10.13' },
  { id: 'q2', title: 'IEEE754 부동소수점 질문', preview: '표현 방식이 이해 안 돼요', date: '2023.10.18' },
];

export default function QuestionListScreen({ route, navigation }) {
  const { category } = route.params;
  return (
    <View style={{ flex: 1, padding: 24 }}>
      <Text style={{ fontSize: 28, fontWeight: 'bold' }}>{category.title} 질문방</Text>
      <FlatList
        data={questions}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={{ padding: 16, borderBottomColor: '#ccc', borderBottomWidth: 1 }}
            onPress={() => navigation.navigate('QuestionDetail', { question: item })}
          >
            <Text style={{ fontWeight: 'bold' }}>{item.title}</Text>
            <Text>{item.preview}</Text>
            <Text style={{ color: '#999', fontSize: 12 }}>{item.date}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

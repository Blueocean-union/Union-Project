// screens/QuizSelectScreen.tsx
import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { dummyQuizData } from './dummyQuiz';

const fakeFiles = [
  { id: 'file1', name: '객체지향교재.pdf' },
  { id: 'file2', name: '9주차 자료.pdf' },
  { id: 'file3', name: 'OT 문제지.pdf' },
];

export default function QuizSelectScreen() {
  const navigation = useNavigation<any>();

  const handleCreateQuiz = (fileId: string) => {
    // 실제 fileId 기반 퀴즈 생성 API 요청 자리
    navigation.navigate('QuizRoom', { quizData: dummyQuizData });
  };

  return (
    <View style={S.container}>
      <FlatList
        data={fakeFiles}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={S.row} onPress={() => handleCreateQuiz(item.id)}>
            <Text style={S.name}>{item.name}</Text>
            <Button title="퀴즈 생성" onPress={() => handleCreateQuiz(item.id)} />
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
      />
    </View>
  );
}

const S = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#fff',
  },
  name: { fontSize: 16 },
});

import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Alert, Text } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { QuestionStackParamList } from './MainTabs';
import { updatePost } from '../libs/api/posts';

type Props = NativeStackScreenProps<QuestionStackParamList, 'QuestionEdit'>;

export default function QuestionEditScreen({ route, navigation }: Props) {
  const { question } = route.params;
  const [title, setTitle] = useState<string>(question?.title ?? '');
  const [content, setContent] = useState<string>(question?.content ?? '');

  const handleSubmit = async () => {
    try {
      await updatePost(Number(question.id), {
        title,
        content,
        // 서버 스펙상 categoryId가 필수라면, 기존 카테고리 id를 함께 넘겨야 함
        categoryId: (question as any).categoryId ?? 0,
      });
      Alert.alert('수정 완료', '질문이 수정되었습니다.');
      navigation.goBack();
    } catch (e) {
      console.error(e);
      Alert.alert('오류', '수정에 실패했습니다.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>질문 수정</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="제목"
      />
      <TextInput
        style={[styles.input, { height: 120 }]}
        value={content}
        onChangeText={setContent}
        placeholder="내용"
        multiline
      />
      <Button title="저장" onPress={handleSubmit} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, gap: 12, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: 'bold' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12 },
});

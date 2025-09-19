import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Alert, Text, TouchableOpacity } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { QuestionStackParamList } from './QuestionStack';
import { updatePost } from '../../libs/api/posts';

type Props = NativeStackScreenProps<QuestionStackParamList, 'QuestionEdit'>;

export default function QuestionEditScreen({ route, navigation }: Props) {
  const { question } = route.params;
  const [title, setTitle] = useState<string>(question?.title ?? '');
  const [content, setContent] = useState<string>(question?.content ?? '');

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('알림', '제목과 내용을 모두 입력해주세요.');
      return;
    }

    try {
      await updatePost(Number(question.id), {
        title,
        content,
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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>취소</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>질문 수정</Text>
        <Button title="저장" onPress={handleSubmit} />
      </View>
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
        textAlignVertical="top"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: '#4A90E2',
    fontSize: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
});

import React, { useState } from 'react';
import {
  View,
  Text,
  Button,
  StyleSheet,
  Alert,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { QuestionStackParamList } from './QuestionStack';
import { createPost } from '../../libs/api/posts';

type Props = NativeStackScreenProps<QuestionStackParamList, 'QuestionCreate'>;

export default function QuestionCreateScreen({ route, navigation }: Props) {
  const { category } = route.params ?? {};
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('알림', '제목과 내용을 모두 입력해주세요.');
      return;
    }

    if (!category || !category.id) {
      Alert.alert('알림', '카테고리를 선택해야 질문을 등록할 수 있습니다.');
      return;
    }

    try {
      await createPost({
        title,
        content,
        categoryId: category.id,
      });
      Alert.alert('등록 완료', '질문이 성공적으로 등록되었습니다.');
      navigation.goBack();
    } catch (e) {
      console.error(e);
      Alert.alert('오류', '질문 등록에 실패했습니다.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>취소</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>질문 등록</Text>
        <Button title="저장" onPress={handleSubmit} />
      </View>

      <Text style={styles.categoryInfo}>
        선택된 카테고리: {category?.title ?? '없음'}
      </Text>

      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="제목"
      />
      <TextInput
        style={[styles.input, { height: 200 }]}
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
  categoryInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
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

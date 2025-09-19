import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Alert, Text, TouchableOpacity } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { QuestionStackParamList } from './QuestionStack';
import { createAnswer, updateAnswer } from '../../libs/api/answers';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<QuestionStackParamList, 'AnswerWrite'>;

export default function AnswerWriteScreen({ route, navigation }: Props) {
  const { postId, answer } = route.params;
  const [content, setContent] = useState<string>(answer?.content ?? '');

  const handleSubmit = async () => {
    if (!content.trim()) {
      Alert.alert('알림', '내용을 입력해주세요.');
      return;
    }

    try {
      if (answer?.id) {
        await updateAnswer(answer.id, content); // 수정된 부분: { content } 대신 content 직접 전달
        Alert.alert('알림', '답변이 수정되었습니다.');
      } else {
        await createAnswer(postId, content); // 수정된 부분: { content } 대신 content 직접 전달
        Alert.alert('알림', '답변이 등록되었습니다.');
      }
      navigation.goBack();
    } catch (e) {
      console.error(e);
      Alert.alert('오류', '답변 처리 실패');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color="#999" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {answer ? '답변 수정' : '답변 작성'}
        </Text>
        <Button title="저장" onPress={handleSubmit} />
      </View>
      <TextInput
        style={styles.input}
        value={content}
        onChangeText={setContent}
        placeholder="내용을 입력하세요"
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
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    padding: 12,
    minHeight: 150,
    fontSize: 16,
  },
});

import React, { useState } from 'react';
import { View, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { createPost } from '../../libs/api/posts';

export default function QuestionWriteScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { categoryId } = route.params ?? {};

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('오류', '제목과 내용을 입력해주세요.');
      return;
    }
    try {
      await createPost({
        title,
        content,
        categoryId: categoryId ?? 0,
      });
      Alert.alert('등록 완료', '질문이 등록되었습니다.');
      navigation.goBack();
    } catch {
      Alert.alert('오류', '질문 등록 실패');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput placeholder="제목" value={title} onChangeText={setTitle} style={styles.input} />
      <TextInput
        placeholder="내용"
        value={content}
        onChangeText={setContent}
        style={styles.input}
        multiline
      />
      <Button title="등록" onPress={handleSubmit} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  input: { borderWidth: 1, borderColor: '#ccc', marginBottom: 12, padding: 8, borderRadius: 6 },
});

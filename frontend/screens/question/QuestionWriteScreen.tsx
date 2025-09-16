import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { createPost, updatePost, type Post } from '../../libs/api/posts';

interface RouteParams {
  question?: Post;       // 수정 모드일 경우 전달
  categoryId?: number;   // 새 글 작성 모드일 경우 전달
}

const categories = [
  { id: 1, name: 'IT/테크' },
  { id: 2, name: '사회/정치' },
  { id: 3, name: '경영/경제' },
  { id: 4, name: '법학' },
  { id: 5, name: '언어' },
  { id: 6, name: '전기/전자' },
];

export default function QuestionWriteScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const params = (route.params ?? {}) as RouteParams;

  const isEdit = !!params.question;
  const [title, setTitle] = useState(params.question?.title ?? '');
  const [content, setContent] = useState(params.question?.content ?? '');
  const [categoryId, setCategoryId] = useState<number>(
    params.question?.categoryId ?? params.categoryId ?? categories[0].id
  );

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('오류', '제목과 내용을 입력해주세요.');
      return;
    }

    try {
      if (isEdit && params.question) {
        await updatePost(params.question.id, { title, content, categoryId });
        Alert.alert('알림', '질문이 수정되었습니다.');
        navigation.goBack();
      } else {
        const newPost: Post = await createPost({ title, content, categoryId });
        Alert.alert('알림', '질문이 등록되었습니다.');
        navigation.goBack();
      }
    } catch (e) {
      Alert.alert('에러', '저장 중 문제가 발생했습니다.');
    }
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 4 }}>제목</Text>
      <TextInput
        value={title}
        onChangeText={setTitle}
        style={{ borderWidth: 1, borderRadius: 4, padding: 8, marginBottom: 16 }}
      />

      <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 4 }}>내용</Text>
      <TextInput
        value={content}
        onChangeText={setContent}
        multiline
        style={{
          borderWidth: 1,
          borderRadius: 4,
          padding: 8,
          height: 120,
          marginBottom: 16,
          textAlignVertical: 'top',
        }}
      />

      <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 4 }}>카테고리</Text>
      <Picker selectedValue={categoryId} onValueChange={(itemValue: number) => setCategoryId(itemValue)}>
        {categories.map(c => (
          <Picker.Item key={c.id} label={c.name} value={c.id} />
        ))}
      </Picker>

      <Button title={isEdit ? '수정 완료' : '등록'} onPress={handleSubmit} />
    </View>
  );
}

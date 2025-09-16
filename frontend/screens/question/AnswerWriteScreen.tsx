import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { createAnswer, updateAnswer } from '../../libs/api/answers';

interface RouteParams {
  postId: number;
  answerId?: number;
  initialContent?: string;
}

export default function AnswerWriteScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { postId, answerId, initialContent } = (route.params as RouteParams);

  const [content, setContent] = useState(initialContent ?? '');

  const handleSubmit = async () => {
    if (!content.trim()) {
      Alert.alert('오류', '내용을 입력해주세요.');
      return;
    }
    try {
      if (answerId) {
        await updateAnswer(answerId, { content });
        Alert.alert('알림', '답변이 수정되었습니다.');
      } else {
        await createAnswer(postId, { content });
        Alert.alert('알림', '답변이 등록되었습니다.');
      }
      navigation.goBack();
    } catch {
      Alert.alert('오류', answerId ? '답변 수정 실패' : '답변 등록 실패');
    }
  };

  return (
    <View style={{ flex: 1, padding: 24, backgroundColor: '#fff' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="black" />
        </TouchableOpacity>
        <Text style={{ fontSize: 28, fontWeight: 'bold', marginLeft: 16 }}>
          {answerId ? '답변 수정' : '답변 작성'}
        </Text>
      </View>
      <TextInput
        value={content}
        onChangeText={setContent}
        multiline
        placeholder="답변을 입력하세요"
        style={{ borderWidth: 1, borderRadius: 4, padding: 8, height: 120, textAlignVertical: 'top' }}
      />
      <Button title={answerId ? '수정 완료' : '등록'} onPress={handleSubmit} />
    </View>
  );
}

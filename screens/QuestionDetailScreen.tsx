// screens/QuestionDetailScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, Button, Alert, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { QuestionStackParamList } from './MainTabs';
import { getPost, deletePost } from '../libs/api/posts';
import AnswersSection from './AnswersSection';

type Props = NativeStackScreenProps<QuestionStackParamList, 'QuestionDetail'>;

export default function QuestionDetailScreen({ route, navigation }: Props) {
  const { question } = route.params;
  const [data, setData] = useState<any>(question ?? null);

  // ✅ 답변 섹션에서 쓸 postId (route → data 순으로 안전하게)
  const postId = Number(
    question?.id ??
    route?.params?.question?.id ??
    data?.id
  );

  useEffect(() => {
    (async () => {
      if (question?.id && !question?.content) {
        const fresh = await getPost(Number(question.id));
        setData(fresh);
      }
    })();
  }, [question?.id]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{data?.title ?? '제목'}</Text>
      {!!data?.content && <Text style={styles.content}>{data.content}</Text>}

      <Button
        title="수정"
        onPress={() => navigation.navigate('QuestionEdit', { question: data })}
      />

      <View style={{ height: 8 }} />

      <Button
        title="삭제"
        color="#c62828"
        onPress={() => {
          Alert.alert('삭제', '정말 삭제할까요?', [
            { text: '취소', style: 'cancel' },
            {
              text: '삭제',
              style: 'destructive',
              onPress: async () => {
                await deletePost(Number(data?.id));
                navigation.goBack();
              },
            },
          ]);
        }}
      />

      {/* ✅ 여기서부터 답변(댓글) 섹션 */}
      <View style={{ height: 16 }} />
      {Number.isFinite(postId) && <AnswersSection postId={postId} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
  content: { fontSize: 16, lineHeight: 22, marginBottom: 12 },
});

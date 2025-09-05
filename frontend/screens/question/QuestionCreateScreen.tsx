import React from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { QuestionStackParamList } from './QuestionStack';

type Props = NativeStackScreenProps<QuestionStackParamList, 'QuestionCreate'>;

export default function QuestionCreateScreen({ route, navigation }: Props) {
  // MainTabs에서 정의한 파라미터: categoryId 또는 category(둘 중 하나/둘 다 가능)
  const { categoryId, category } = (route.params as any) ?? {};

  return (
    <View style={styles.container}>
      <Text style={styles.title}>질문 등록</Text>

      <View style={styles.info}>
        <Text style={styles.label}>선택된 카테고리</Text>
        <Text>
          id: {categoryId ?? '-'} / obj: {category ? JSON.stringify(category) : '-'}
        </Text>
      </View>

      <Button
        title="임시 저장"
        onPress={() => Alert.alert('알림', '폼/유효성 로직은 이후에 연결')}
      />

      <View style={{ height: 12 }} />

      <Button title="목록으로" onPress={() => navigation.goBack()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 16 },
  info: { paddingVertical: 8, gap: 6 },
  label: { fontWeight: '600' },
});

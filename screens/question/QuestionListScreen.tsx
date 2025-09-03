import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { QuestionStackParamList } from './MainTabs';

type Props = NativeStackScreenProps<QuestionStackParamList, 'QuestionList'>;

export default function QuestionListScreen({ route, navigation }: Props) {
  // MainTabs 타입에 따라 두 형태 모두 허용
  const { categoryId, category } = route.params ?? {};

  return (
    <View style={styles.container}>
      <Text style={styles.title}>질문 목록</Text>

      <View style={styles.info}>
        <Text style={styles.label}>필터</Text>
        <Text>
          categoryId: {categoryId ?? '-'} / category: {category ? JSON.stringify(category) : '-'}
        </Text>
      </View>

      <Button
        title="이 카테고리로 질문 작성"
        onPress={() => navigation.navigate('QuestionCreate', { categoryId, category })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 16 },
  info: { paddingVertical: 8, gap: 6, marginBottom: 12 },
  label: { fontWeight: '600' },
});

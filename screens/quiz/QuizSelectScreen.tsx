import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
// import * as DocumentPicker from 'expo-document-picker';
import { useNavigation } from '@react-navigation/native';

import { generateQuizFromPdfs, normalizeQuizzes } from '../../libs/api/quiz';
import type { QuizItem } from '../../types/quiz';

export default function QuizSelectScreen() {
  // 타입 엄격하게 잡아두면 또 막힐 수 있어 일단 any로
  const nav = useNavigation<any>();
  const [loading, setLoading] = useState(false);
  const [picked, setPicked] = useState<{ name: string }[]>([]);

  const onPick = async () => {
    // 임시로 DocumentPicker 비활성화
    Alert.alert('알림', 'PDF 선택 기능이 준비 중입니다.');
    return;
    
    /*
    const res = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf'],
      multiple: true,
      copyToCacheDirectory: true,
    });
    if (!('assets' in res) || !res.assets) return;

    setPicked(res.assets.map((a) => ({ name: a.name || 'file.pdf' })));

    try {
      setLoading(true);

      const files = res.assets.map((a) => ({
        uri: a.uri,
        name: a.name || 'file.pdf',
        type: a.mimeType || 'application/pdf',
      }));

      // ✅ 시그니처: 객체로 넘긴다
      const raw = await generateQuizFromPdfs({
        files,
        // 필요하면 model/keyNames 추가
        // model: 'your-model',
        // keyNames: 'option1,option2,option3,option4',
      });

      const quizzes: QuizItem[] = normalizeQuizzes(raw);
      if (!quizzes.length) {
        Alert.alert('실패', '생성된 퀴즈가 없습니다.');
        return;
      }
      nav.navigate('QuizRoom', { quizzes });
    } catch (e: any) {
      console.warn(e);
      Alert.alert('오류', e?.message || '퀴즈 생성에 실패했습니다.');
    } finally {
      setLoading(false);
    }
    */
  };

  return (
    <View style={S.container}>
      <Text style={S.title}>PDF에서 퀴즈 생성</Text>
      <Text style={S.sub}>PDF를 선택하면 서버가 퀴즈를 만들어 줍니다.</Text>

      <TouchableOpacity style={S.primary} onPress={onPick} disabled={loading}>
        <Text style={S.primaryText}>{loading ? '생성 중…' : 'PDF 선택하기'}</Text>
      </TouchableOpacity>

      {!!picked.length && (
        <View style={{ marginTop: 14 }}>
          {picked.map((p, i) => (
            <Text key={i} style={{ color: '#6b7280' }}>
              • {p.name}
            </Text>
          ))}
        </View>
      )}

      {loading && <ActivityIndicator style={{ marginTop: 16 }} />}
    </View>
  );
}

const S = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f8fafc' },
  title: { fontSize: 20, fontWeight: '800', marginBottom: 6 },
  sub: { color: '#6b7280', marginBottom: 16 },
  primary: {
    backgroundColor: '#4f6af3',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});

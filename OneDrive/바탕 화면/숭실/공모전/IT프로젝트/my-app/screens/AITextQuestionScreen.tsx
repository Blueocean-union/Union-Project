import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';

type AITextResponse = {
  answer: string;
  relatedTopics?: string[];
};

export default function AITextQuestionScreen() {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<AITextResponse | null>(null);

  const askAI = async () => {
    setLoading(true);
    try {
      // TODO: 실제 API 연동
      const mock: AITextResponse = {
        answer: `질문: "${question}" 에 대한 임시 답변입니다.`,
        relatedTopics: ['키워드1', '키워드2'],
      };
      setTimeout(() => {
        setResponse(mock);
        setLoading(false);
      }, 600);
    } catch (e) {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>텍스트 질문</Text>
      <TextInput
        style={styles.input}
        placeholder="질문을 입력하세요"
        value={question}
        onChangeText={setQuestion}
      />
      <Button title="질문하기" onPress={askAI} disabled={!question.trim() || loading} />

      {loading && <Text style={styles.loading}>AI가 생각 중...</Text>}

      {response && (
        <View style={styles.responseBox}>
          <Text style={styles.answer}>{response.answer}</Text>

          // ✅ 문제가 된 두 줄만 교체
        {((response?.relatedTopics ?? []).length > 0) && (
          <Text style={styles.related}>
            📌 관련 주제: {(response?.relatedTopics ?? []).join(', ')}
          </Text>
        )}

        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
  },
  loading: { marginTop: 10, color: '#666' },
  responseBox: { marginTop: 16, gap: 8 },
  answer: { fontSize: 16, lineHeight: 22 },
  related: { marginTop: 6, color: '#444' },
});

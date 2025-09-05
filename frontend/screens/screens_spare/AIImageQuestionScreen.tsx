// 📁 my-app/screens/AIImageQuestionScreen.tsx

import React, { useState } from 'react';
import { View, Button, Text, Image, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { AIQuestionRequest, AIResponse } from '../types/ai';

export default function AIImageQuestionScreen() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [ocrText, setOcrText] = useState<string | null>(null);
  const [response, setResponse] = useState<AIResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      setImageUri(uri);
      handleFakeOCR(uri);
    }
  };

  const handleFakeOCR = (uri: string) => {
    setLoading(true);
    setTimeout(() => {
      const fakeExtractedText = '다형성과 캡슐화의 차이점은 무엇인가요?';
      setOcrText(fakeExtractedText);
      askAI(fakeExtractedText);
    }, 1500);
  };

  const askAI = (question: string) => {
    const requestBody: AIQuestionRequest = {
      type: 'image',
      content: question,
    };

    // GPT mock 응답
    setTimeout(() => {
      setResponse({
        answer: `AI 응답: "${question}"에 대한 설명입니다. 다형성은 ...`,
        relatedTopics: ['객체지향', '상속'],
        createdAt: new Date().toISOString(),
      });
      setLoading(false);
    }, 1200);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>AI 이미지 질문</Text>
      <Button title="이미지 선택" onPress={pickImage} />

      {imageUri && (
        <Image source={{ uri: imageUri }} style={styles.imagePreview} />
      )}

      {ocrText && (
        <Text style={styles.ocrText}>
          🔍 OCR 인식된 질문: {ocrText}
        </Text>
      )}

      {loading && <ActivityIndicator size="large" style={{ marginTop: 16 }} />}

      {response && (
        <View style={styles.responseBox}>
          <Text style={styles.answer}>{response.answer}</Text>
          {response.relatedTopics && (
            <Text style={styles.related}>
              📌 관련 주제: {response.relatedTopics.join(', ')}
            </Text>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  imagePreview: { width: '100%', height: 200, marginVertical: 12, borderRadius: 10 },
  ocrText: { marginVertical: 8, fontStyle: 'italic' },
  responseBox: { marginTop: 20, padding: 12, backgroundColor: '#f0f0f0', borderRadius: 8 },
  answer: { fontSize: 16 },
  related: { marginTop: 10, color: '#666' },
});

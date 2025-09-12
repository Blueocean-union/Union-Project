import React, { useState } from "react";
import { View, Text, Button, ScrollView } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { Quiz } from "../../types/quiz";
import { uploadAndCreateQuiz } from "../../libs/api/quiz";

export default function QuizSelectScreen() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);

  const handleUpload = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: "application/pdf",
      multiple: true,
    });

    if (!result.canceled) {
      const formData = new FormData();

      result.assets.forEach((file) => {
        formData.append("files", {
          uri: file.uri,
          name: file.name ?? "file.pdf",
          type: file.mimeType ?? "application/pdf",
        } as any);
      });

      const data = await uploadAndCreateQuiz(formData);
      setQuizzes(data);
    }
  };

  return (
    <ScrollView>
      <Button title="파일 업로드해서 퀴즈 만들기" onPress={handleUpload} />
      {quizzes.map((quiz) => (
        <View key={quiz.id} style={{ marginVertical: 10 }}>
          <Text style={{ fontWeight: "bold" }}>{quiz.title}</Text>
          <Text>{quiz.questions.length} 문제</Text>
        </View>
      ))}
    </ScrollView>
  );
}

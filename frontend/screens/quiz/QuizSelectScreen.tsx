// screens/quiz/QuizSelectScreen.tsx
import React, { useState } from "react";
import {
  View, Text, Button, Alert, FlatList, TouchableOpacity
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { uploadAndCreateQuiz } from "../../libs/api/quiz";
import { Quiz } from "../../types/quiz";

export default function QuizSelectScreen({ navigation }: any) {
  const [items, setItems] = useState<{ id: string; name: string }[]>([]);
  const [busy, setBusy] = useState(false);

  const handleUpload = async () => {
    try {
      const pick = await DocumentPicker.getDocumentAsync({
        multiple: true,
        type: [
          "application/pdf",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "text/plain",
        ],
        copyToCacheDirectory: true,
      });
      if (pick.canceled) return;

      setBusy(true);

      const files = pick.assets.map((a) => ({
        uri: a.uri,
        name: a.name,
        mimeType: a.mimeType ?? undefined,
      }));

      const quiz: Quiz = await uploadAndCreateQuiz({
        files,
        model: "gpt-4o-mini",                 // 서버가 허용하는 모델명으로 조정 가능
        keyNames: "question,options,answer,explanation",
      });

      navigation.navigate("QuizRoom", { quiz });
    } catch (e: any) {
      console.error(e);
      Alert.alert("업로드 실패", e?.message ?? "잠시 후 다시 시도해주세요.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={{ flex: 1, padding: 20, gap: 12 }}>
      <Button
        title={busy ? "업로드 중..." : "파일 업로드해서 퀴즈 만들기"}
        onPress={handleUpload}
        disabled={busy}
      />

      {/* (선택) 업로드 파일 저장/목록을 붙이고 싶을 때 사용할 리스트 */}
      <FlatList
        style={{ marginTop: 16 }}
        data={items}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => navigation.navigate("QuizRoom", { fileId: item.id })}
          >
            <Text>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

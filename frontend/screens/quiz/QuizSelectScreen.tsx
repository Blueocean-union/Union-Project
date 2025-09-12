// screens/quiz/QuizSelectScreen.tsx
import React, { useState } from "react";
import {
  View, Text, Alert, FlatList, TouchableOpacity, StyleSheet,
  TextInput, SafeAreaView
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { uploadAndCreateQuiz } from "../../libs/api/quiz";
import { Quiz } from "../../types/quiz";

const PDF_ICON = "📄"; // 간단 아이콘(필요시 SVG 교체)

export default function QuizSelectScreen({ navigation }: any) {
  const [picked, setPicked] = useState<{ uri: string; name: string; mimeType?: string }[]>([]);
  const [busy, setBusy] = useState(false);

  const openPicker = async () => {
    const res = await DocumentPicker.getDocumentAsync({
      multiple: true,
      type: [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain",
      ],
      copyToCacheDirectory: true,
    });
    if (res.canceled) return;
    setPicked(res.assets.map(a => ({ uri: a.uri, name: a.name, mimeType: a.mimeType ?? undefined })));
  };

  const createQuiz = async () => {
    try {
      if (picked.length === 0) {
        Alert.alert("알림", "먼저 파일을 선택해주세요.");
        return;
      }
      setBusy(true);
      const quiz: Quiz = await uploadAndCreateQuiz({
        files: picked,
        model: "gpt-4o-mini",
        keyNames: "question,options,answer,explanation,source,stars",
      });
      navigation.navigate("QuizRoom", { quiz });
    } catch (e: any) {
      console.error(e);
      Alert.alert("실패", e?.message ?? "퀴즈 생성에 실패했어요.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F3F4F6" }}>
      <View style={S.headerWrap}>
        <Text style={S.title}>객체지향프로그래밍 QUIZ</Text>
        <TextInput placeholder="검색" style={S.search} />
      </View>

      <FlatList
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
        data={picked}
        keyExtractor={(i) => i.uri}
        numColumns={4}
        ListEmptyComponent={
          <TouchableOpacity style={S.empty} onPress={openPicker}>
            <Text style={{ fontSize: 16, color: "#4B5563" }}>파일을 선택해 퀴즈를 생성하세요</Text>
          </TouchableOpacity>
        }
        renderItem={({ item }) => (
          <TouchableOpacity style={S.pdfCard} onPress={openPicker}>
            <Text style={{ fontSize: 38, marginBottom: 6 }}>{PDF_ICON}</Text>
            <Text numberOfLines={2} style={S.pdfName}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity style={[S.fab, busy && { opacity: 0.6 }]} onPress={createQuiz} disabled={busy}>
        <Text style={S.fabText}>{busy ? "생성 중..." : "생성하기"}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const S = StyleSheet.create({
  headerWrap: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 10, backgroundColor: "#F3F4F6" },
  title: { fontSize: 28, fontWeight: "900", color: "#1F2937", letterSpacing: 1 },
  search: {
    marginTop: 12, backgroundColor: "white", borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10,
    borderWidth: 1, borderColor: "#E5E7EB",
  },
  empty: {
    height: 280, borderRadius: 16, borderWidth: 1, borderColor: "#E5E7EB",
    backgroundColor: "white", alignItems: "center", justifyContent: "center", marginTop: 24,
  },
  pdfCard: {
    width: "22%", marginRight: "4%", marginBottom: 22, backgroundColor: "white",
    borderRadius: 14, borderWidth: 1, borderColor: "#E5E7EB", alignItems: "center", paddingVertical: 14,
    shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  pdfName: { fontSize: 12, textAlign: "center", color: "#374151" },
  fab: {
    position: "absolute", right: 20, bottom: 24, backgroundColor: "#3955FF",
    paddingHorizontal: 22, paddingVertical: 14, borderRadius: 12,
    shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 10, shadowOffset: { width: 0, height: 6 },
  },
  fabText: { color: "white", fontWeight: "700", fontSize: 16 },
});

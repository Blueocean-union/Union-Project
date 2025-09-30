import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { Ionicons } from "@expo/vector-icons";
import { Quiz } from "../../types/quiz";
import { uploadAndCreateQuiz, fetchQuizzes } from "../../libs/api/quiz";

type Props = {
  navigation: any;
};

export default function QuizSelectScreen({ navigation }: Props) {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadQuizzes();
  }, []);

  const loadQuizzes = async () => {
    try {
      setLoading(true);
      const data = await fetchQuizzes();
      setQuizzes(data);
    } catch (e: any) {
      console.error("퀴즈 목록 로드 실패:", e);
      setQuizzes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        multiple: false,
        copyToCacheDirectory: true,
      });

      console.log("DocumentPicker 결과:", result);

      if (result.canceled) {
        return;
      }

      if (!result.assets || result.assets.length === 0) {
        Alert.alert("알림", "파일이 선택되지 않았습니다.");
        return;
      }

      setUploading(true);

      const formData = new FormData();
      
      result.assets.forEach((file, index) => {
        console.log(`파일 ${index}:`, file);
        
        formData.append("files", {
          uri: file.uri,
          name: file.name || `file_${index}.pdf`,
          type: file.mimeType || "application/pdf",
        } as any);
      });

      console.log("FormData 준비 완료, API 호출 시작");

      const newQuizzes = await uploadAndCreateQuiz(formData);
      
      console.log("업로드 성공:", newQuizzes);

      Alert.alert(
        "업로드 완료",
        `${newQuizzes.length}개의 퀴즈가 생성되었습니다.`,
        [{ text: "확인", onPress: () => loadQuizzes() }]
      );
    } catch (e: any) {
      console.error("업로드 에러 전체:", e);
      console.error("에러 응답:", e.response?.data);
      
      const errorMessage = e.response?.data?.message || e.message || "파일 업로드에 실패했습니다.";
      
      Alert.alert("업로드 실패", errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const handleQuizPress = (quiz: Quiz) => {
    navigation.navigate("QuizRoom", { quiz });
  };

  const renderQuizCard = (quiz: Quiz, index: number) => (
    <TouchableOpacity
      key={quiz.id || index}
      style={styles.quizCard}
      onPress={() => handleQuizPress(quiz)}
    >
      <View style={styles.quizIconContainer}>
        <Ionicons name="document-text" size={32} color="#4A90E2" />
      </View>
      <View style={styles.quizContent}>
        <Text style={styles.quizTitle} numberOfLines={2}>
          {quiz.title}
        </Text>
        <View style={styles.quizMeta}>
          <View style={styles.metaItem}>
            <Ionicons name="help-circle-outline" size={16} color="#8E8E93" />
            <Text style={styles.metaText}>{quiz.questions.length}문제</Text>
          </View>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#4A90E2" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>퀴즈 선택</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={quizzes.length === 0 ? styles.emptyContent : undefined}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4A90E2" />
            <Text style={styles.loadingText}>퀴즈 목록을 불러오는 중...</Text>
          </View>
        ) : quizzes.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons name="folder-open-outline" size={64} color="#C7C7CC" />
            </View>
            <Text style={styles.emptyTitle}>아직 퀴즈가 없습니다</Text>
            <Text style={styles.emptySubtitle}>
              PDF 파일을 업로드하여{"\n"}첫 번째 퀴즈를 만들어보세요!
            </Text>
          </View>
        ) : (
          <View style={styles.quizList}>
            {quizzes.map((quiz, index) => renderQuizCard(quiz, index))}
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.uploadButton,
            uploading && styles.uploadButtonDisabled,
          ]}
          onPress={handleUpload}
          disabled={uploading}
        >
          {uploading ? (
            <>
              <ActivityIndicator size="small" color="#FFFFFF" />
              <Text style={styles.uploadButtonText}>업로드 중...</Text>
            </>
          ) : (
            <>
              <Ionicons name="cloud-upload" size={24} color="#FFFFFF" />
              <Text style={styles.uploadButtonText}>PDF 파일 업로드</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1C1C1E",
    flex: 1,
    textAlign: "center",
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  emptyContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#8E8E93",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#F2F2F7",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1C1C1E",
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#8E8E93",
    textAlign: "center",
    lineHeight: 20,
  },
  quizList: {
    padding: 16,
  },
  quizCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quizIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: "#E8F4FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  quizContent: {
    flex: 1,
  },
  quizTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1C1C1E",
    marginBottom: 6,
  },
  quizMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 13,
    color: "#8E8E93",
  },
  footer: {
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E5EA",
  },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#007AFF",
    borderRadius: 12,
    paddingVertical: 16,
    gap: 8,
  },
  uploadButtonDisabled: {
    opacity: 0.6,
  },
  uploadButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
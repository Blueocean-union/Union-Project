import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { QuestionStackParamList } from './QuestionStack';
import { createPost } from '../../libs/api/posts';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<QuestionStackParamList, 'QuestionCreate'>;

export default function QuestionCreateScreen({ route, navigation }: Props) {
  const { category } = route.params ?? {};
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('알림', '제목과 내용을 모두 입력해주세요.');
      return;
    }

    if (!category || !category.id) {
      Alert.alert('알림', '카테고리를 선택해야 질문을 등록할 수 있습니다.');
      return;
    }

    try {
      setIsSubmitting(true);
      await createPost({
        title,
        content,
        categoryId: category.id,
      });
      Alert.alert('등록 완료', '질문이 성공적으로 등록되었습니다.', [
        { text: '확인', onPress: () => navigation.goBack() }
      ]);
    } catch (e) {
      console.error(e);
      Alert.alert('오류', '질문 등록에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (title.trim() || content.trim()) {
      Alert.alert(
        '작성 취소',
        '작성 중인 내용이 있습니다. 정말 취소하시겠습니까?',
        [
          { text: '계속 작성', style: 'cancel' },
          { text: '취소', style: 'destructive', onPress: () => navigation.goBack() }
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
            <Ionicons name="close" size={24} color="#8E8E93" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>질문 작성</Text>
          <TouchableOpacity 
            style={[
              styles.submitButton,
              { opacity: isSubmitting || !title.trim() || !content.trim() ? 0.6 : 1 }
            ]}
            onPress={handleSubmit}
            disabled={isSubmitting || !title.trim() || !content.trim()}
          >
            <Text style={styles.submitButtonText}>등록</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {category && (
            <View style={styles.categoryInfo}>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryIcon}>{category.icon}</Text>
                <Text style={styles.categoryName}>{category.title}</Text>
              </View>
            </View>
          )}

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>제목</Text>
              <TextInput
                style={styles.titleInput}
                value={title}
                onChangeText={setTitle}
                placeholder="질문의 제목을 입력하세요"
                placeholderTextColor="#C7C7CC"
                maxLength={100}
              />
              <Text style={styles.characterCount}>{title.length}/100</Text>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>내용</Text>
              <TextInput
                style={styles.contentInput}
                value={content}
                onChangeText={setContent}
                placeholder="질문의 내용을 자세히 입력하세요"
                placeholderTextColor="#C7C7CC"
                multiline
                textAlignVertical="top"
                maxLength={1000}
              />
              <Text style={styles.characterCount}>{content.length}/1000</Text>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  cancelButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 18,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  categoryInfo: {
    marginBottom: 20,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  form: {
    flex: 1,
    gap: 20,
  },
  inputContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  titleInput: {
    fontSize: 16,
    color: '#1C1C1E',
    padding: 0,
    minHeight: 24,
  },
  contentInput: {
    fontSize: 16,
    color: '#1C1C1E',
    padding: 0,
    minHeight: 200,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'right',
    marginTop: 8,
  },
});


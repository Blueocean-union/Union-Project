import React, { useState } from 'react';
import { 
  View, 
  TextInput, 
  StyleSheet, 
  Alert, 
  Text, 
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { QuestionStackParamList } from './QuestionStack';
import { updatePost } from '../../libs/api/posts';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<QuestionStackParamList, 'QuestionEdit'>;

export default function QuestionEditScreen({ route, navigation }: Props) {
  const { question } = route.params;
  const [title, setTitle] = useState<string>(question?.title ?? '');
  const [content, setContent] = useState<string>(question?.content ?? '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('알림', '제목과 내용을 모두 입력해주세요.');
      return;
    }

    try {
      setIsSubmitting(true);
      await updatePost(Number(question.id), {
        title,
        content,
      });
      Alert.alert('수정 완료', '질문이 수정되었습니다.', [
        { text: '확인', onPress: () => navigation.goBack() }
      ]);
    } catch (e) {
      Alert.alert('오류', '수정에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    const hasChanges = 
      title.trim() !== question?.title?.trim() || 
      content.trim() !== question?.content?.trim();

    if (hasChanges) {
      Alert.alert(
        '수정 취소',
        '변경된 내용이 있습니다. 정말 취소하시겠습니까?',
        [
          { text: '계속 수정', style: 'cancel' },
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
          <Text style={styles.headerTitle}>질문 수정</Text>
          <TouchableOpacity 
            style={[
              styles.submitButton,
              { opacity: isSubmitting || !title.trim() || !content.trim() ? 0.6 : 1 }
            ]}
            onPress={handleSubmit}
            disabled={isSubmitting || !title.trim() || !content.trim()}
          >
            <Text style={styles.submitButtonText}>수정</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
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

            <View style={styles.infoContainer}>
              <View style={styles.infoItem}>
                <Ionicons name="information-circle-outline" size={16} color="#8E8E93" />
                <Text style={styles.infoText}>
                  작성자: {question?.writerName}
                </Text>
              </View>
              <View style={styles.infoItem}>
                <Ionicons name="time-outline" size={16} color="#8E8E93" />
                <Text style={styles.infoText}>
                  작성일: {new Date(question?.createdAt || '').toLocaleDateString('ko-KR')}
                </Text>
              </View>
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
  infoContainer: {
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#8E8E93',
  },
});


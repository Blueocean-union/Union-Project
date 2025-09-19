import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Alert,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { QuestionStackParamList, Post } from './QuestionStack';
import { getPost, deletePost } from '../../libs/api/posts';
import { listAnswers, createAnswer, updateAnswer, deleteAnswer, Answer } from '../../libs/api/answers';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<QuestionStackParamList, 'QuestionDetail'>;

export default function QuestionDetailScreen({ route, navigation }: Props) {
  const { question: initialQuestion } = route.params;
  const [data, setData] = useState<Post | null>(initialQuestion ?? null);
  const [loading, setLoading] = useState(false);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loadingAnswers, setLoadingAnswers] = useState(false);
  
  // 댓글 작성 관련 상태
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  
  // 댓글 수정 관련 상태
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editCommentText, setEditCommentText] = useState('');

  // 현재 사용자 ID (실제로는 로그인 정보에서 가져와야 함)
  const currentUserId = 1;

  useEffect(() => {
    loadQuestionAndAnswers();
  }, [initialQuestion?.id]);

  const loadQuestionAndAnswers = async () => {
    if (!initialQuestion?.id) return;

    setLoading(true);
    setLoadingAnswers(true);
    
    try {
      const [questionData, answersData] = await Promise.all([
        getPost(Number(initialQuestion.id)),
        listAnswers(Number(initialQuestion.id)),
      ]);
      
      setData(questionData);
      setAnswers(answersData);
    } catch (e) {
      console.error('데이터 로드 실패:', e);
      Alert.alert('오류', '질문 내용을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
      setLoadingAnswers(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('삭제', '정말 삭제할까요?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          try {
            if (data?.id) {
              await deletePost(data.id);
              navigation.goBack();
            }
          } catch (e) {
            console.error(e);
            Alert.alert('오류', '삭제에 실패했습니다.');
          }
        },
      },
    ]);
  };

  const handleSubmitComment = async () => {
    if (!commentText.trim()) {
      Alert.alert('알림', '댓글 내용을 입력해주세요.');
      return;
    }

    if (!data?.id) return;

    try {
      setSubmittingComment(true);
      await createAnswer(data.id, commentText);
      setCommentText('');
      setShowCommentInput(false);
      await listAnswers(data.id).then(setAnswers);
    } catch (e) {
      console.error(e);
      Alert.alert('오류', '댓글 등록에 실패했습니다.');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleEditComment = (answer: Answer) => {
    setEditingCommentId(answer.id);
    setEditCommentText(answer.content);
  };

  const handleSaveEditComment = async () => {
    if (!editCommentText.trim() || !editingCommentId) return;

    try {
      await updateAnswer(editingCommentId, editCommentText);
      setEditingCommentId(null);
      setEditCommentText('');
      if (data?.id) {
        await listAnswers(data.id).then(setAnswers);
      }
    } catch (e) {
      console.error(e);
      Alert.alert('오류', '댓글 수정에 실패했습니다.');
    }
  };

  const handleDeleteComment = (commentId: number) => {
    Alert.alert('삭제', '이 댓글을 삭제할까요?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteAnswer(commentId);
            if (data?.id) {
              await listAnswers(data.id).then(setAnswers);
            }
          } catch (e) {
            console.error(e);
            Alert.alert('오류', '댓글 삭제에 실패했습니다.');
          }
        },
      },
    ]);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR') + ' ' + date.toLocaleTimeString('ko-KR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const renderComment = (answer: Answer) => {
    const isEditing = editingCommentId === answer.id;
    const isMyComment = answer.writerId === currentUserId;

    return (
      <View key={answer.id} style={styles.commentCard}>
        <View style={styles.commentHeader}>
          <Text style={styles.commentAuthor}>{answer.writerName}</Text>
          <Text style={styles.commentDate}>{formatDate(answer.createdAt)}</Text>
        </View>

        {isEditing ? (
          <View style={styles.editContainer}>
            <TextInput
              style={styles.editInput}
              value={editCommentText}
              onChangeText={setEditCommentText}
              multiline
              placeholder="댓글을 수정하세요"
            />
            <View style={styles.editActions}>
              <TouchableOpacity
                style={[styles.editActionBtn, styles.saveBtn]}
                onPress={handleSaveEditComment}
              >
                <Text style={styles.saveBtnText}>저장</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.editActionBtn, styles.cancelBtn]}
                onPress={() => {
                  setEditingCommentId(null);
                  setEditCommentText('');
                }}
              >
                <Text style={styles.cancelBtnText}>취소</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <>
            <Text style={styles.commentContent}>{answer.content}</Text>
            {isMyComment && (
              <View style={styles.commentActions}>
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => handleEditComment(answer)}
                >
                  <Text style={styles.actionBtnText}>수정</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => handleDeleteComment(answer.id)}
                >
                  <Text style={[styles.actionBtnText, styles.deleteText]}>삭제</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
      </View>
    );
  };

  if (loading || !data) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A90E2" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={24} color="#4A90E2" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>질문 상세</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => navigation.navigate('QuestionEdit', { question: data })}
            >
              <Text style={styles.editButtonText}>수정</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDelete}
            >
              <Text style={styles.deleteButtonText}>삭제</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.questionCard}>
            <Text style={styles.questionTitle}>{data.title}</Text>
            <Text style={styles.questionContent}>{data.content}</Text>
            <View style={styles.questionMeta}>
              <Text style={styles.metaText}>작성자: {data.writerName}</Text>
              <Text style={styles.metaText}>작성일: {formatDate(data.createdAt)}</Text>
            </View>
          </View>

          <View style={styles.answersSection}>
            <View style={styles.answersSectionHeader}>
              <Text style={styles.sectionTitle}>답변 ({answers.length})</Text>
              {!showCommentInput && (
                <TouchableOpacity
                  style={styles.writeCommentBtn}
                  onPress={() => setShowCommentInput(true)}
                >
                  <Ionicons name="add" size={20} color="#FFFFFF" />
                  <Text style={styles.writeCommentBtnText}>답변 등록</Text>
                </TouchableOpacity>
              )}
            </View>

            {showCommentInput && (
              <View style={styles.commentInputContainer}>
                <View style={styles.commentInputHeader}>
                  <Text style={styles.commentInputTitle}>답변 작성</Text>
                  <TouchableOpacity
                    onPress={() => {
                      setShowCommentInput(false);
                      setCommentText('');
                    }}
                  >
                    <Ionicons name="close" size={24} color="#8E8E93" />
                  </TouchableOpacity>
                </View>
                <TextInput
                  style={styles.commentInput}
                  value={commentText}
                  onChangeText={setCommentText}
                  placeholder="답변을 입력하세요"
                  multiline
                  textAlignVertical="top"
                />
                <TouchableOpacity
                  style={[
                    styles.submitCommentBtn,
                    { opacity: submittingComment ? 0.6 : 1 }
                  ]}
                  onPress={handleSubmitComment}
                  disabled={submittingComment}
                >
                  {submittingComment ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.submitCommentBtnText}>등록</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {loadingAnswers ? (
              <View style={styles.loadingAnswers}>
                <ActivityIndicator size="small" color="#4A90E2" />
                <Text style={styles.loadingAnswersText}>답변을 불러오는 중...</Text>
              </View>
            ) : answers.length === 0 ? (
              <View style={styles.noAnswers}>
                <Ionicons name="chatbubble-outline" size={48} color="#C7C7CC" />
                <Text style={styles.noAnswersTitle}>아직 답변이 없습니다</Text>
                <Text style={styles.noAnswersSubtitle}>첫 번째 답변을 작성해보세요!</Text>
              </View>
            ) : (
              <View style={styles.answersList}>
                {answers.map(renderComment)}
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    flex: 1,
    textAlign: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  questionCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  questionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 12,
    lineHeight: 28,
  },
  questionContent: {
    fontSize: 16,
    color: '#3C3C43',
    lineHeight: 24,
    marginBottom: 16,
  },
  questionMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  metaText: {
    fontSize: 12,
    color: '#8E8E93',
  },
  answersSection: {
    margin: 16,
    marginTop: 0,
  },
  answersSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  writeCommentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    gap: 4,
  },
  writeCommentBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  commentInputContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  commentInputHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  commentInputTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    padding: 12,
    minHeight: 80,
    fontSize: 14,
    marginBottom: 12,
    textAlignVertical: 'top',
  },
  submitCommentBtn: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitCommentBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingAnswers: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  loadingAnswersText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  noAnswers: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noAnswersTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginTop: 12,
    marginBottom: 4,
  },
  noAnswersSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
  },
  answersList: {
    gap: 12,
  },
  commentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  commentDate: {
    fontSize: 12,
    color: '#8E8E93',
  },
  commentContent: {
    fontSize: 14,
    color: '#3C3C43',
    lineHeight: 20,
    marginBottom: 8,
  },
  commentActions: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
  },
  actionBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  actionBtnText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
  deleteText: {
    color: '#FF3B30',
  },
  editContainer: {
    gap: 12,
  },
  editInput: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    padding: 12,
    minHeight: 60,
    fontSize: 14,
    textAlignVertical: 'top',
  },
  editActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editActionBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  saveBtn: {
    backgroundColor: '#007AFF',
  },
  cancelBtn: {
    backgroundColor: '#8E8E93',
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  cancelBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});


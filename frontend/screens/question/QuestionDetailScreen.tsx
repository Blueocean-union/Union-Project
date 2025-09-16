import React, { useCallback, useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  FlatList, 
  Alert, 
  TouchableOpacity, 
  ScrollView,
  StyleSheet,
  SafeAreaView 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { getPost, deletePost, type Post } from '../../libs/api/posts';
import { listAnswers, createAnswer, updateAnswer, deleteAnswer, type Answer } from '../../libs/api/answers';

interface RouteParams {
  id: number;
}

export default function QuestionDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { id } = (route.params as RouteParams);

  const [post, setPost] = useState<Post | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [answerText, setAnswerText] = useState<string>('');
  const [editingAnswerId, setEditingAnswerId] = useState<number | null>(null);
  const [editingAnswerText, setEditingAnswerText] = useState<string>('');

  // 질문 + 답변 불러오기
  const loadDetail = async () => {
    try {
      const data = await getPost(id);
      setPost(data);
    } catch (e) {
      Alert.alert('오류', '질문을 불러오지 못했습니다.');
    }
    try {
      const ansData = await listAnswers(id);
      setAnswers(ansData);
    } catch (e) {
      Alert.alert('오류', '답변을 불러오지 못했습니다.');
    }
  };

  useFocusEffect(useCallback(() => { loadDetail(); }, [id]));

  // 질문 삭제
  const onDeleteQuestion = () => {
    Alert.alert('삭제', '이 질문을 삭제할까요?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          try {
            await deletePost(id);
            Alert.alert('알림', '질문이 삭제되었습니다.');
            navigation.goBack();
          } catch {
            Alert.alert('오류', '질문 삭제에 실패했습니다.');
          }
        }
      }
    ]);
  };

  // 답변 등록
  const submitAnswer = async () => {
    const content = answerText.trim();
    if (!content) return;
    try {
      await createAnswer(id, { content });
      setAnswerText('');
      const ansData = await listAnswers(id);
      setAnswers(ansData);
    } catch {
      Alert.alert('오류', '답변 등록에 실패했습니다.');
    }
  };

  // 답변 수정 시작
  const startEditAnswer = (answer: Answer) => {
    setEditingAnswerId(answer.id);
    setEditingAnswerText(answer.content);
  };

  const cancelEditAnswer = () => {
    setEditingAnswerId(null);
    setEditingAnswerText('');
  };

  const saveEditAnswer = async () => {
    if (!editingAnswerId) return;
    const content = editingAnswerText.trim();
    if (!content) return;
    try {
      await updateAnswer(editingAnswerId, { content });
      cancelEditAnswer();
      const ansData = await listAnswers(id);
      setAnswers(ansData);
    } catch {
      Alert.alert('오류', '답변 수정에 실패했습니다.');
    }
  };

  // 답변 삭제
  const onDeleteAnswer = (answerId: number) => {
    Alert.alert('삭제', '이 답변을 삭제할까요?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteAnswer(answerId);
            const ansData = await listAnswers(id);
            setAnswers(ansData);
          } catch {
            Alert.alert('오류', '답변 삭제에 실패했습니다.');
          }
        }
      }
    ]);
  };

  // 답변 작성 화면으로 이동
  const navigateToAnswerWrite = () => {
    navigation.navigate('AnswerWrite', { 
      questionId: id,
      questionTitle: post?.title || '',
      onAnswerAdded: loadDetail
    });
  };

  // 답변 렌더링
  const renderAnswerItem = ({ item }: { item: Answer }) => {
    const isEditing = item.id === editingAnswerId;
    return (
      <View style={styles.answerCard}>
        <View style={styles.answerHeader}>
          <View style={styles.answerUserInfo}>
            <View style={styles.userAvatar}>
              <Text style={styles.userAvatarText}>{item.writerName.charAt(0)}</Text>
            </View>
            <View>
              <Text style={styles.answerUserName}>{item.writerName}</Text>
              <Text style={styles.answerDate}>
                {new Date(item.createdAt).toLocaleDateString('ko-KR')}
              </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.moreButton}>
            <Ionicons name="ellipsis-vertical" size={16} color="#666" />
          </TouchableOpacity>
        </View>
        
        {!isEditing ? (
          <Text style={styles.answerContent}>{item.content}</Text>
        ) : (
          <>
            <TextInput
              style={styles.editTextInput}
              value={editingAnswerText}
              onChangeText={setEditingAnswerText}
              multiline
              placeholder="답변을 입력하세요..."
            />
            <View style={styles.editButtonContainer}>
              <TouchableOpacity style={styles.saveButton} onPress={saveEditAnswer}>
                <Text style={styles.saveButtonText}>저장</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={cancelEditAnswer}>
                <Text style={styles.cancelButtonText}>취소</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
        
        {!isEditing && (
          <View style={styles.answerActions}>
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={() => startEditAnswer(item)}
            >
              <Ionicons name="pencil-outline" size={14} color="#666" />
              <Text style={styles.actionButtonText}>수정</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={() => onDeleteAnswer(item.id)}
            >
              <Ionicons name="trash-outline" size={14} color="#ff4444" />
              <Text style={[styles.actionButtonText, { color: '#ff4444' }]}>삭제</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {post?.categoryName || 'IT/컴퓨터 질문방'}
        </Text>
        <View style={styles.headerActions}>
          {post && (
            <TouchableOpacity 
              style={styles.headerActionButton}
              onPress={() => navigation.navigate('QuestionWrite', { question: post })}
            >
              <Ionicons name="pencil-outline" size={20} color="#666" />
            </TouchableOpacity>
          )}
          <TouchableOpacity 
            style={styles.headerActionButton}
            onPress={onDeleteQuestion}
          >
            <Ionicons name="trash-outline" size={20} color="#ff4444" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 질문 카드 */}
        {post && (
          <View style={styles.questionCard}>
            <View style={styles.questionHeader}>
              <Text style={styles.questionTitle}>{post.title}</Text>
              <Text style={styles.questionMeta}>
                {post.writerName} · {new Date(post.createdAt).toLocaleDateString('ko-KR')}
              </Text>
            </View>
            <Text style={styles.questionContent}>{post.content}</Text>
            
            {/* 질문 액션 버튼들 */}
            <View style={styles.questionActions}>
              <TouchableOpacity style={styles.likeButton}>
                <Ionicons name="heart-outline" size={18} color="#666" />
                <Text style={styles.actionText}>좋아요</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.shareButton}>
                <Ionicons name="share-outline" size={18} color="#666" />
                <Text style={styles.actionText}>공유</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* 답변 섹션 */}
        <View style={styles.answerSection}>
          <View style={styles.answerSectionHeader}>
            <Text style={styles.answerSectionTitle}>
              답변 {answers.length}개
            </Text>
            <TouchableOpacity 
              style={styles.writeAnswerButton}
              onPress={navigateToAnswerWrite}
            >
              <Ionicons name="add" size={16} color="#007AFF" />
              <Text style={styles.writeAnswerButtonText}>답변 작성</Text>
            </TouchableOpacity>
          </View>

          {/* 답변 목록 */}
          {answers.length > 0 ? (
            <FlatList
              data={answers}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderAnswerItem}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          ) : (
            <View style={styles.emptyAnswers}>
              <Ionicons name="chatbubble-outline" size={48} color="#ccc" />
              <Text style={styles.emptyAnswersText}>아직 답변이 없습니다.</Text>
              <Text style={styles.emptyAnswersSubText}>
                첫 번째 답변을 작성해보세요!
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 12,
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerActionButton: {
    padding: 8,
    marginLeft: 4,
  },
  content: {
    flex: 1,
  },
  questionCard: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  questionHeader: {
    marginBottom: 16,
  },
  questionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    lineHeight: 28,
    marginBottom: 8,
  },
  questionMeta: {
    fontSize: 14,
    color: '#666',
  },
  questionContent: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    marginBottom: 20,
  },
  questionActions: {
    flexDirection: 'row',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f3f4',
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  answerSection: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  answerSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  answerSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  writeAnswerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  writeAnswerButtonText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
    marginLeft: 4,
  },
  answerCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  answerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  answerUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userAvatarText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  answerUserName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  answerDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  moreButton: {
    padding: 4,
  },
  answerContent: {
    fontSize: 15,
    lineHeight: 22,
    color: '#333',
    marginBottom: 12,
  },
  editTextInput: {
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    lineHeight: 22,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  editButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginRight: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  cancelButton: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
  answerActions: {
    flexDirection: 'row',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f3f4',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  actionButtonText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  separator: {
    height: 8,
  },
  emptyAnswers: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyAnswersText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
    fontWeight: '500',
  },
  emptyAnswersSubText: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 4,
  },
});
import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  RefreshControl,
} from 'react-native';
import {
  listAnswers,
  createAnswer,
  updateAnswer,
  deleteAnswer,
  type Answer,
} from '../../libs/api/answers';

type Props = { postId: number };

export default function AnswersSection({ postId }: Props) {
  const [items, setItems] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [text, setText] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const data = await listAnswers(postId);
      setItems(data);
    } catch (e) {
      console.log(e);
      Alert.alert('오류', '답변을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [postId]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await load();
    } finally {
      setRefreshing(false);
    }
  };

  const submit = async () => {
    const v = text.trim();
    if (!v) return;
    try {
      await createAnswer(postId, v);
      setText('');
      await load();
    } catch (e) {
      console.log(e);
      Alert.alert('오류', '등록에 실패했습니다.');
    }
  };

  const startEdit = (a: Answer) => {
    setEditingId(a.id);
    setEditingText(a.content);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingText('');
  };

  const saveEdit = async () => {
    if (editingId == null) return;
    const v = editingText.trim();
    if (!v) return;
    try {
      await updateAnswer(editingId, v);
      cancelEdit();
      await load();
    } catch (e) {
      console.log(e);
      Alert.alert('오류', '수정에 실패했습니다.');
    }
  };

  const remove = (id: number) => {
    Alert.alert('삭제', '이 답변을 삭제할까요?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteAnswer(id);
            await load();
          } catch (e) {
            console.log(e);
            Alert.alert('오류', '삭제에 실패했습니다.');
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }: { item: Answer }) => {
    const isEditing = editingId === item.id;
    return (
      <View style={styles.card}>
        <View style={styles.rowBetween}>
          <Text style={styles.writer}>{item.writerName}</Text>
          <Text style={styles.when}>
            {new Date(item.createdAt).toLocaleString()}
          </Text>
        </View>

        {!isEditing ? (
          <Text style={styles.content}>{item.content}</Text>
        ) : (
          <>
            <TextInput
              style={styles.input}
              value={editingText}
              onChangeText={setEditingText}
              multiline
            />
            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Button title="수정 완료" onPress={saveEdit} />
              </View>
              <View style={{ width: 100 }}>
                <Button title="취소" color="#777" onPress={cancelEdit} />
              </View>
            </View>
          </>
        )}

        {!isEditing && (
          <View style={[styles.row, { marginTop: 6 }]}>
            <View style={{ marginRight: 12 }}>
              <Button title="수정" onPress={() => startEdit(item)} />
            </View>
            <Button title="삭제" color="#c62828" onPress={() => remove(item.id)} />
          </View>
        )}
      </View>
    );
  };

  const ListHeader = useMemo(
    () => (
      <View style={styles.editor}>
        <Text style={styles.sectionTitle}>답변</Text>
        <TextInput
          placeholder="답변을 입력하세요"
          style={styles.input}
          value={text}
          onChangeText={setText}
          multiline
        />
        <Button title="등록" onPress={submit} />
      </View>
    ),
    [text]
  );

  return (
    <FlatList
      data={items}
      keyExtractor={(it) => String(it.id)}
      renderItem={renderItem}
      ListHeaderComponent={ListHeader}
      ListEmptyComponent={
        !loading ? <Text style={styles.empty}>아직 답변이 없습니다.</Text> : null
      }
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      contentContainerStyle={{ padding: 16, paddingTop: 0 }}
    />
  );
}

const styles = StyleSheet.create({
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
  editor: { marginTop: 8, marginBottom: 12 },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  empty: { textAlign: 'center', color: '#666', marginTop: 16 },
  card: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  writer: { fontWeight: '600' },
  when: { color: '#666', fontSize: 12 },
  content: { marginTop: 6, lineHeight: 20 },
});

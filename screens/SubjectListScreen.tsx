// screens/SubjectListScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { getSubjects } from '../libs/subject';
import SubjectCreateModal from './SubjectCreateModal';

export default function SubjectListScreen() {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const res = await getSubjects();
      // 응답 호환 처리
      const list =
        res?.data?.items ??
        res?.data?.data ??
        res?.data ??
        res?.items ??
        res ??
        [];
      setSubjects(list);
    } catch (e) {
      console.error('❌ 과목 목록 불러오기 실패:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>과목 선택</Text>
      {loading ? (
        <ActivityIndicator />
      ) : (
        <FlatList
          data={subjects}
          keyExtractor={(item) => String(item.id)}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchSubjects} />}
          renderItem={({ item }) => (
            <View style={[styles.subjectBox, { borderLeftColor: item.color || '#2b3f85' }]}>
              <Text style={styles.subjectTitle}>{item.name ?? item.title}</Text>
            </View>
          )}
        />
      )}

      <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.plus}>＋</Text>
      </TouchableOpacity>

      <SubjectCreateModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSuccess={fetchSubjects}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 16 },
  subjectBox: {
    padding: 16,
    borderLeftWidth: 6,
    marginBottom: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 6,
  },
  subjectTitle: { fontWeight: 'bold', fontSize: 16 },
  addButton: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    width: 56,
    height: 56,
    backgroundColor: '#4285F4',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  plus: { color: '#fff', fontSize: 32, lineHeight: 36 },
});

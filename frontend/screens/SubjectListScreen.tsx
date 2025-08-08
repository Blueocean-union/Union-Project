import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface Subject {
  id: number;
  name: string;
  color: string;
  isFavorite: boolean;
  createdAt: string;
}

interface Props {
  navigation: NativeStackNavigationProp<any>;
}

const week = [
  { day: '일', label: '' },
  { day: '월', label: '계획안 제출' },
  { day: '화', label: '9주차 풀이' },
  { day: '수', label: '' },
  { day: '목', label: '컴구 제출' },
  { day: '금', label: '보고서 작성' },
  { day: '토', label: '최종 제출' },
];

export default function SubjectListScreen({ navigation }: Props) {
  const [subjects, setSubjects] = useState<Subject[]>([]);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const token = await AsyncStorage.getItem('accessToken');
        if (!token) {
          Alert.alert('인증 오류', '로그인이 필요합니다.');
          return;
        }

        const res = await axios.get('http://52.78.209.115:8080/api/subjects', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = res.data;

        // ✅ 데이터 유효성 검사
        if (Array.isArray(data)) {
          setSubjects(data);
        } else {
          console.warn('❗ subjects 응답 형식이 배열이 아닙니다:', data);
          setSubjects([]);
        }
      } catch (err: any) {
        console.error('🔥 과목 목록 불러오기 실패:', err.message);
        setSubjects([]); // ✅ 실패 시에도 안전하게 빈 배열로 설정
        Alert.alert('오류', '과목 목록을 불러오는 데 실패했습니다.');
      }
    };

    fetchSubjects();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>과목 선택</Text>
      <Text style={styles.subtitle}>원하는 과목을 눌러 내용을 확인하세요</Text>

      <View style={styles.weekRow}>
        {week.map((item, idx) => (
          <View key={idx} style={styles.weekBox}>
            <Text style={styles.weekDay}>{item.day}</Text>
            <Text style={styles.weekLabel}>{item.label}</Text>
          </View>
        ))}
      </View>

      <FlatList
        data={subjects}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        contentContainerStyle={{ paddingVertical: 12 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.card, { backgroundColor: item.color || '#eef' }]}
            onPress={() => navigation.navigate('SubjectDetail', { subject: item })}
          >
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text style={styles.cardText}>
              생성일: {new Date(item.createdAt).toLocaleDateString()}
            </Text>
            {item.isFavorite && (
              <Text style={styles.favorite}>⭐ 즐겨찾기</Text>
            )}
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={{ textAlign: 'center', color: '#999', marginTop: 30 }}>
            불러올 과목이 없습니다.
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: 'bold' },
  subtitle: { fontSize: 14, color: '#666', marginBottom: 12 },
  weekRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  weekBox: { alignItems: 'center', flex: 1 },
  weekDay: { fontWeight: 'bold', marginBottom: 4 },
  weekLabel: { fontSize: 12, color: 'red', textAlign: 'center' },
  card: {
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    width: '48%',
  },
  cardTitle: { fontWeight: 'bold', fontSize: 16, color: '#1e1e1e' },
  cardText: { marginTop: 4, fontSize: 13, color: '#333' },
  favorite: { marginTop: 4, color: '#f39c12', fontWeight: 'bold' },
});

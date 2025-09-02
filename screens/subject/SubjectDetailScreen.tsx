// screens/SubjectDetailScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { SubjectStackParamList } from './SubjectStack';

type Props = NativeStackScreenProps<SubjectStackParamList, 'SubjectDetail'>;

export default function SubjectDetailScreen({ route }: Props) {
  const { subject } = route.params;
  const screenWidth = Dimensions.get('window').width;

  return (
    <View style={styles.container}>
      {/* 제목과 날짜 */}
      <View style={styles.header}>
        <Text style={styles.title}>{subject.title}</Text>
        <Text style={styles.date}>6월 30일 월요일</Text>
      </View>

      {/* 진행률 바 */}
      <View style={styles.progressWrapper}>
        <View style={styles.progressBarBackground}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${subject.progress * 100}%` },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {(subject.progress * 100).toFixed(1)}% 회독 ({subject.reviewCount} /{' '}
          {subject.totalCount})
        </Text>
      </View>

      {/* 콘텐츠 */}
      <View style={styles.contentWrapper}>
        {/* 자료 */}
        <View style={styles.column}>
          <Text style={styles.sectionTitle}>📚 자료</Text>
          <View>
            {subject.files.map((file: any, idx: number) => (
              <Text key={idx} style={styles.item}>
                {file}
              </Text>
            ))}
          </View>
        </View>

        {/* 일정 */}
        <View style={styles.column}>
          <Text style={styles.sectionTitle}>📅 일정</Text>
          <View>
            {subject.schedule.length > 0 ? (
              subject.schedule.map((s: any, i: number) => (
                <Text key={i} style={styles.item}>
                  {s.done ? '✅' : '⭕'} {s.title} ({s.date})
                </Text>
              ))
            ) : (
              <Text style={{ color: '#aaa', marginTop: 4 }}>일정이 없어요</Text>
            )}
          </View>
        </View>

        {/* 달력 */}
        <View style={[styles.column, { alignItems: 'center' }]}>
          <Text style={styles.sectionTitle}>📆 달력</Text>
          <Text style={styles.calendar}>일\n월\n화\n수\n목\n금\n토</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { marginBottom: 12 },
  title: { fontSize: 20, fontWeight: '700' },
  date: { marginTop: 4, color: '#666' },
  progressWrapper: { marginVertical: 12 },
  progressBarBackground: {
    height: 10,
    borderRadius: 6,
    backgroundColor: '#eee',
    overflow: 'hidden',
  },
  progressBarFill: { height: 10, backgroundColor: '#4caf50' },
  progressText: { marginTop: 6, color: '#444' },
  contentWrapper: { flexDirection: 'row', gap: 16, marginTop: 8 },
  column: { flex: 1 },
  sectionTitle: { fontWeight: '700', marginBottom: 6 },
  item: { paddingVertical: 4, color: '#333' },
  calendar: { marginTop: 8, color: '#666', textAlign: 'center' },
});

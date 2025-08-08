import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';

export default function SubjectDetailScreen({ route }) {
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
          <View style={[styles.progressBarFill, { width: `${subject.progress * 100}%` }]} />
        </View>
        <Text style={styles.progressText}>
          {(subject.progress * 100).toFixed(1)}% | 회독 {subject.reviewCount} / {subject.totalCount}
        </Text>
      </View>

      {/* 콘텐츠 본문 */}
      <View style={styles.contentWrapper}>
        {/* 자료 */}
        <View style={styles.column}>
          <Text style={styles.sectionTitle}>📚 자료</Text>
          {subject.files.map((file, idx) => (
            <Text key={idx} style={styles.item}>• {file}</Text>
          ))}
        </View>

        {/* 일정 */}
        <View style={styles.column}>
          <Text style={styles.sectionTitle}>🗓 일정</Text>
          {subject.schedule.length > 0 ? (
            subject.schedule.map((s, i) => (
              <Text key={i} style={styles.item}>
                {s.done ? '✅' : '⭕'} {s.title} ({s.date})
              </Text>
            ))
          ) : (
            <Text style={{ color: '#aaa', marginTop: 4 }}>비어있음</Text>
          )}
        </View>

        {/* 달력 */}
        <View style={[styles.column, { alignItems: 'center' }]}>
          <Text style={styles.sectionTitle}>📅 달력</Text>
          <Text style={styles.calendar}>
            일{'\n'}월{'\n'}화{'\n'}수{'\n'}목{'\n'}금{'\n'}토
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 24 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1e1e1e' },
  date: { fontSize: 14, color: '#666' },

  progressWrapper: { marginVertical: 16 },
  progressBarBackground: { height: 8, backgroundColor: '#ddd', borderRadius: 4 },
  progressBarFill: { height: 8, backgroundColor: '#2b3f85', borderRadius: 4 },
  progressText: { marginTop: 8, fontSize: 14, color: '#444' },

  contentWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    flex: 1,
  },
  column: {
    flex: 1,
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
  },
  sectionTitle: { fontWeight: 'bold', fontSize: 16, marginBottom: 8 },
  item: { marginBottom: 6, fontSize: 14, color: '#333' },

  calendar: {
    fontSize: 16,
    textAlign: 'center',
    color: '#555',
    lineHeight: 28,
  },
});

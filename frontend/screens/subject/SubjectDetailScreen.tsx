// screens/SubjectDetailScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import SubjectFileStorage from './SubjectFileStorage';
import type { SubjectStackParamList } from '../MainTabs';

type Props = NativeStackScreenProps<SubjectStackParamList, 'SubjectDetail'>;

export default function SubjectDetailScreen({ route, navigation }: Props) {
  const { subject } = route.params;
  const subjectColor = subject.color || '#2b3f85';
  const screenWidth = Dimensions.get('window').width;
  
  // 현재 날짜 가져오기
  const getCurrentDate = () => {
    const today = new Date();
    const month = today.getMonth() + 1;
    const date = today.getDate();
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    const dayName = dayNames[today.getDay()];
    return `${month}월 ${date}일 ${dayName}요일`;
  };

  return (
    <View style={styles.container}>
      {/* 푸른색 배경 헤더 */}
      <View style={[styles.headerBackground, { backgroundColor: subjectColor }]}>
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{subject.title}</Text>
          <TouchableOpacity style={styles.addButton}>
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.headerDate}>{getCurrentDate()}</Text>
      </View>

      {/* 진행률 바 */}
      <View style={styles.progressWrapper}>
        <View style={styles.progressBarBackground}>
          <View
            style={[
              styles.progressBarFill,
              { 
                width: `${subject.progress * 100}%`,
                backgroundColor: subjectColor
              },
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
          <SubjectFileStorage 
            subjectId={subject.id}
            folderId={subject.folderId || 1} // 기본 폴더 ID
            subjectColor={subjectColor}
            navigation={navigation}
          />
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
  container: { flex: 1 },
  headerBackground: { 
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
    flex: 1,
    textAlign: 'center',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerDate: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    textAlign: 'center',
  },
  progressWrapper: { marginVertical: 20, paddingHorizontal: 16 },
  progressBarBackground: {
    height: 10,
    borderRadius: 6,
    backgroundColor: '#eee',
    overflow: 'hidden',
  },
  progressBarFill: { height: 10, backgroundColor: '#4caf50' },
  progressText: { marginTop: 6, color: '#444' },
  contentWrapper: { flexDirection: 'row', gap: 16, marginTop: 8, paddingHorizontal: 16 },
  column: { flex: 1 },
  sectionTitle: { fontWeight: '700', marginBottom: 6 },
  item: { paddingVertical: 4, color: '#333' },
  calendar: { marginTop: 8, color: '#666', textAlign: 'center' },
});

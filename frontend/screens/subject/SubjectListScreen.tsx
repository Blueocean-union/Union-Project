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
  ScrollView,
  Alert,
  ActionSheetIOS,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { getSubjects, deleteSubject as deleteSubjectAPI } from '../../libs/api/subject';
import SubjectCreateModal from './SubjectCreateModal';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { SubjectStackParamList } from '../MainTabs';

type Props = NativeStackScreenProps<SubjectStackParamList, 'SubjectList'>;

// 헥스 색상 유효성 검사 함수
const isValidHex = (s: string) => /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(s);

export default function SubjectListScreen({ navigation }: Props) {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  
  // 캘린더 관련 상태
  const [schedules, setSchedules] = useState<{ [key: string]: any[] }>({});
  const [currentWeek, setCurrentWeek] = useState(new Date());

  // 주간 일정 가져오기
  const fetchWeekSchedules = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const startOfWeek = new Date(currentWeek);
      startOfWeek.setDate(currentWeek.getDate() - currentWeek.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);

      const res = await axios.get(
        `http://52.78.209.115:8080/api/schedules/week?startDate=${startOfWeek.toISOString().split('T')[0]}&endDate=${endOfWeek.toISOString().split('T')[0]}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const grouped: { [key: string]: any[] } = {};
      res.data.forEach((item: any) => {
        const date = new Date(item.startDate);
        const key = `${date.getMonth()}-${date.getDate()}`;
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push({
          ...item,
          color: categoryColorMap[item.category]?.bg || '#EEE',
          textColor: categoryColorMap[item.category]?.text || '#000',
        });
      });
      setSchedules(grouped);
    } catch (err) {
      console.error('주간 일정 불러오기 실패:', err);
    }
  };

  const categoryColorMap: Record<string, { bg: string, text: string }> = {
    '과제': { bg: '#E8F5E8', text: '#2D5D2D' },
    '시험': { bg: '#FFF3E0', text: '#EF6C00' },
    '발표': { bg: '#E3F2FD', text: '#1565C0' },
    '기타': { bg: '#F5F5F5', text: '#616161' }
  };

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      console.log('🔄 과목 목록 불러오기 시작...');
      const res = await getSubjects();
      console.log('📡 API 응답:', res);
      
      // 응답 호환 처리
      const list =
        res?.data?.items ??
        res?.data?.data ??
        res?.data ??
        res?.items ??
        res ??
        [];
      
      console.log('📋 처리된 과목 목록:', list);
      console.log('📊 과목 개수:', Array.isArray(list) ? list.length : '배열이 아님');
      
      // 배열인지 확인 후 설정
      if (Array.isArray(list)) {
        setSubjects(list);
      } else {
        console.warn('⚠️ API 응답이 배열이 아닙니다:', list);
        setSubjects([]);
      }
    } catch (e: any) {
      console.error('❌ 과목 목록 불러오기 실패:', e);
      console.error('❌ 에러 상세:', e.response?.data || e.message);
    } finally {
      setLoading(false);
    }
  };

  // ActionSheet를 사용한 과목 삭제 함수
  const showSubjectOptions = (subjectId: number, subjectName: string) => {
    console.log('🔍 showSubjectOptions 함수 호출됨:', { subjectId, subjectName });
    console.log('🌐 현재 플랫폼:', Platform.OS);
    
    if (Platform.OS === 'ios') {
      // iOS 네이티브에서만 ActionSheet 사용
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['취소', '과목 삭제하기'],
          destructiveButtonIndex: 1,
          cancelButtonIndex: 0,
          title: `${subjectName} 과목 관리`,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            deleteSubject(subjectId, subjectName);
          }
        }
      );
    } else {
      // Android, 웹, 기타 플랫폼에서는 Alert 사용
      console.log('📱 Alert 사용:', `${subjectName} 과목 관리`);
      
      // 웹에서 테스트를 위해 먼저 간단한 confirm 사용
      if (Platform.OS === 'web') {
        console.log('🌐 웹 환경에서 confirm 사용');
        const result = window.confirm(`${subjectName} 과목을 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`);
        if (result) {
          console.log('🗑️ 삭제 확인됨 - 바로 삭제 진행');
          // 웹에서는 바로 삭제 실행 (Alert.alert 제거)
          executeDelete(subjectId, subjectName);
        } else {
          console.log('❌ 삭제 취소됨');
        }
      } else {
        Alert.alert(
          `${subjectName} 과목 관리`,
          '선택하세요',
          [
            { 
              text: '취소', 
              style: 'cancel',
              onPress: () => console.log('❌ 취소 선택됨')
            },
            { 
              text: '과목 삭제하기', 
              style: 'destructive',
              onPress: () => {
                console.log('🗑️ 삭제 선택됨');
                deleteSubject(subjectId, subjectName);
              }
            },
          ]
        );
      }
    }
  };

  // 실제 삭제 실행 함수 (API 호출만)
  const executeDelete = async (subjectId: number, subjectName: string) => {
    try {
      console.log('🌐 API 호출:', `DELETE /api/subjects/${subjectId}`);
      
      await deleteSubjectAPI(subjectId);
      console.log('✅ 과목 삭제 성공');
      
      // 웹에서는 alert 대신 console.log 사용
      if (Platform.OS === 'web') {
        console.log('🎉 삭제 완료:', subjectName);
        alert('과목이 성공적으로 삭제되었습니다.');
      } else {
        Alert.alert('삭제 완료', '과목이 성공적으로 삭제되었습니다.');
      }
      
      await fetchSubjects(); // 목록 새로고침
    } catch (e: any) {
      console.error('❌ 과목 삭제 실패:', e);
      console.error('❌ 에러 상세:', e.response?.data || e.message);
      console.error('❌ 에러 상태:', e.response?.status);
      
      const errorMessage = e.response?.data?.message || e.message || '알 수 없는 오류가 발생했습니다.';
      
      // 웹에서는 alert 대신 console.log 사용
      if (Platform.OS === 'web') {
        console.error('❌ 삭제 실패:', errorMessage);
        alert(`과목 삭제에 실패했습니다.\n\n${errorMessage}`);
      } else {
        Alert.alert('오류', `과목 삭제에 실패했습니다.\n\n${errorMessage}`);
      }
    }
  };

  // 실제 삭제 실행 함수 (Alert 포함)
  const deleteSubject = async (subjectId: number, subjectName: string) => {
    console.log('🗑️ 과목 삭제 시작:', subjectId, subjectName);
    
    // 최종 확인 다이얼로그
    Alert.alert(
      '과목 삭제 확인', 
      `"${subjectName}" 과목을 정말 삭제할까요?\n\n이 작업은 되돌릴 수 없습니다.`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: () => executeDelete(subjectId, subjectName),
        },
      ]
    );
  };

  // 토큰 확인 함수
  const checkAuthToken = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      console.log('🔑 현재 토큰 상태:', token ? '토큰 있음' : '토큰 없음');
      if (token) {
        console.log('🔑 토큰 길이:', token.length);
        console.log('🔑 토큰 시작:', token.substring(0, 20) + '...');
      }
      return token;
    } catch (e) {
      console.error('❌ 토큰 확인 실패:', e);
      return null;
    }
  };

  useEffect(() => {
    checkAuthToken();
    fetchSubjects();
    fetchWeekSchedules();
  }, [currentWeek]);

  // 주간 캘린더 렌더링
  const renderWeekCalendar = () => {
    const startOfWeek = new Date(currentWeek);
    startOfWeek.setDate(currentWeek.getDate() - currentWeek.getDay());
    
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      weekDays.push(date);
    }

    return (
      <View style={styles.calendarContainer}>
        <View style={styles.calendarHeader}>
          <Text style={styles.calendarTitle}>이번 주 일정</Text>
        </View>
        <View style={styles.weekDaysContainer}>
          {weekDays.map((date, index) => {
            const key = `${date.getMonth()}-${date.getDate()}`;
            const daySchedules = schedules[key] || [];
            const isToday = date.toDateString() === new Date().toDateString();
            
            return (
              <View key={index} style={styles.dayColumn}>
                <Text style={[styles.dayLabel, isToday && styles.todayLabel]}>
                  {date.getDate()}일 ({['일', '월', '화', '수', '목', '금', '토'][date.getDay()]})
                </Text>
                <View style={styles.scheduleList}>
                  {daySchedules.slice(0, 2).map((schedule, idx) => (
                    <View key={idx} style={[styles.scheduleItem, { backgroundColor: schedule.color }]}>
                      <Text style={[styles.scheduleText, { color: schedule.textColor }]} numberOfLines={1}>
                        {schedule.title}
                      </Text>
                    </View>
                  ))}
                  {daySchedules.length > 2 && (
                    <Text style={styles.moreText}>+{daySchedules.length - 2}개</Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#1A346F" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>과목 선택</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <Ionicons name="add" size={24} color="#1A346F" />
        </TouchableOpacity>
      </View>
      
      <Text style={styles.subtitle}>원하는 과목을 눌러 내용을 확인하세요</Text>

      {/* 주간 캘린더 */}
      {renderWeekCalendar()}

      {/* 과목 목록 */}
      <View style={styles.subjectsContainer}>
        <Text style={styles.sectionTitle}>과목 목록</Text>
        {loading ? (
          <ActivityIndicator />
        ) : (
          <View style={styles.subjectsList}>
            {subjects && Array.isArray(subjects) ? subjects.map((item) => (
              <TouchableOpacity 
                key={item.id} 
                style={[styles.subjectCard, { borderLeftColor: isValidHex(item.color) ? item.color : '#2b3f85' }]}
                onPress={() => {
                  console.log('🔘 과목 카드 클릭됨:', item.id, item.name ?? item.title);
                  navigation.navigate('SubjectInner', {
                    subjectId: item.id,
                    subjectName: item.name ?? item.title,
                    subjectColor: isValidHex(item.color) ? item.color : '#2b3f85'
                  });
                }}
                activeOpacity={0.7}
              >
                <View style={styles.subjectHeader}>
                  <View style={styles.subjectTitleContainer}>
                    <Ionicons 
                      name="book" 
                      size={20} 
                      color={item.color || '#2b3f85'} 
                      style={styles.subjectIcon}
                    />
                    <Text style={styles.subjectTitle}>{item.name ?? item.title}</Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.moreButton}
                    onPress={(e) => {
                      e.stopPropagation(); // 카드 클릭 이벤트 방지
                      console.log('🔘 ... 버튼 클릭됨:', item.id, item.name ?? item.title);
                      showSubjectOptions(item.id, item.name ?? item.title);
                    }}
                  >
                    <Ionicons name="ellipsis-horizontal" size={20} color="#666" />
                  </TouchableOpacity>
                </View>
                
                {/* 진행률 바 */}
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View 
                      style={[
                        styles.progressFill, 
                        { 
                          width: `${(item.progress || 0.75) * 100}%`,
                          backgroundColor: isValidHex(item.color) ? item.color : '#2b3f85'
                        }
                      ]} 
                    />
                  </View>
                  <Text style={styles.progressText}>
                    진도 {Math.round((item.progress || 0.75) * 100)}% | 회독 {item.reviewCount || 3}회 / 총 {item.totalCount || 4}회
                  </Text>
                </View>

                {/* 다음 일정 */}
                {item.nextSchedule && (
                  <Text style={styles.nextSchedule}>
                    다음 일정: {item.nextSchedule}
                  </Text>
                )}
              </TouchableOpacity>
            )) : (
              <Text style={styles.emptyText}>과목이 없습니다</Text>
            )}
          </View>
        )}
      </View>

      <SubjectCreateModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSuccess={fetchSubjects}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A346F',
  },
  addButton: {
    padding: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginVertical: 12,
    paddingHorizontal: 20,
  },
  
  // 캘린더 스타일
  calendarContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  calendarHeader: {
    marginBottom: 12,
  },
  calendarTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A346F',
  },
  weekDaysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayColumn: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 2,
  },
  dayLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  todayLabel: {
    color: '#1A346F',
    fontWeight: 'bold',
  },
  scheduleList: {
    minHeight: 40,
    width: '100%',
  },
  scheduleItem: {
    padding: 4,
    borderRadius: 4,
    marginBottom: 2,
  },
  scheduleText: {
    fontSize: 10,
    textAlign: 'center',
  },
  moreText: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
    marginTop: 2,
  },

  // 과목 목록 스타일
  subjectsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A346F',
    marginBottom: 16,
  },
  subjectsList: {
    gap: 12,
  },
  subjectCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  subjectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  subjectTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  subjectIcon: {
    marginRight: 8,
  },
  subjectTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  moreButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
  },
  progressContainer: {
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    marginBottom: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
  },
  nextSchedule: {
    fontSize: 12,
    color: '#1A346F',
    fontStyle: 'italic',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
});
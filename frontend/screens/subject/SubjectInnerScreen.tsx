import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { getSubject, updateSubject } from '../../libs/api/subject';
import SubjectFileStorage from './SubjectFileStorage';

type Props = {
  route: { params: { subjectId: number; subjectName: string; subjectColor: string } };
  navigation: any;
};

export default function SubjectInnerScreen({ route, navigation }: Props) {
  const { subjectId, subjectName, subjectColor } = route.params;
  const [subject, setSubject] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [schedules, setSchedules] = useState<{ [key: string]: any[] }>({});
  const [currentWeek, setCurrentWeek] = useState(new Date());

  // 과목 상세 정보 가져오기
  const fetchSubject = async () => {
    setLoading(true);
    try {
      console.log('🔄 과목 상세 정보 불러오기 시작:', subjectId);
      
      // 토큰 확인
      const token = await AsyncStorage.getItem('accessToken');
      console.log('🔑 토큰 상태:', token ? '존재함' : '없음');
      if (token) {
        console.log('🔑 토큰 길이:', token.length);
        console.log('🔑 토큰 시작:', token.substring(0, 20) + '...');
        console.log('🔑 토큰 형식:', token.startsWith('Bearer ') ? 'Bearer 포함' : 'Bearer 없음');
        
        // 토큰 유효성 테스트 (간단한 API 호출)
        try {
          console.log('🧪 토큰 유효성 테스트 시작...');
          const testResponse = await fetch('http://52.78.209.115:8080/api/subjects', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
          console.log('🧪 테스트 응답 상태:', testResponse.status);
          if (testResponse.status === 401) {
            console.log('❌ 토큰이 유효하지 않습니다!');
          }
        } catch (testError) {
          console.log('❌ 토큰 테스트 실패:', testError);
        }
      }
      
      const data = await getSubject(subjectId);
      console.log('📡 과목 상세 API 응답:', data);
      
      // API 응답이 있으면 사용, 없으면 기본값 사용
      const subjectData = data || {
        id: subjectId,
        name: subjectName,
        color: subjectColor,
        progress: 0,
        reviewCount: 0,
        totalCount: 0,
        materials: [],
        schedules: []
      };
      
      setSubject(subjectData);
    } catch (e: any) {
      console.error('❌ 과목 상세 정보 불러오기 실패:', e);
      console.error('❌ 에러 타입:', e.constructor.name);
      console.error('❌ 에러 메시지:', e.message);
      console.error('❌ 에러 코드:', e.code);
      console.error('❌ 에러 응답:', e.response?.data);
      console.error('❌ 에러 상태:', e.response?.status);
      console.log('📝 기본값으로 설정:', { subjectId, subjectName, subjectColor });
      
      // API가 없을 경우 기본값 설정
      setSubject({
        id: subjectId,
        name: subjectName,
        color: subjectColor,
        progress: 0,
        reviewCount: 0,
        totalCount: 0,
        materials: [],
        schedules: []
      });
    } finally {
      setLoading(false);
    }
  };

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
        // 해당 과목의 일정만 필터링
        if (item.subjectId === subjectId) {
          const date = new Date(item.startDate);
          const key = `${date.getMonth()}-${date.getDate()}`;
          if (!grouped[key]) grouped[key] = [];
          grouped[key].push({
            ...item,
            color: subjectColor,
          });
        }
      });
      console.log('📅 필터링된 일정:', grouped);
      setSchedules(grouped);
    } catch (err) {
      console.error('주간 일정 불러오기 실패:', err);
    }
  };

  useEffect(() => {
    fetchSubject();
    fetchWeekSchedules();
  }, [subjectId, currentWeek]);

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

    // 현재 월 가져오기
    const currentMonth = startOfWeek.getMonth() + 1;

    return (
      <View style={styles.calendarContainer}>
        <Text style={styles.calendarTitle}>{currentMonth}월</Text>
        {weekDays.map((date, index) => {
          const key = `${date.getMonth()}-${date.getDate()}`;
          const daySchedules = schedules[key] || [];
          const hasSchedule = daySchedules.length > 0;
          const isToday = date.toDateString() === new Date().toDateString();
          
          return (
            <View key={index} style={styles.dayRow}>
              <Text style={[styles.dayLabel, isToday && styles.todayLabel]}>
                {['일', '월', '화', '수', '목', '금', '토'][date.getDay()]} {date.getDate()}
              </Text>
              <View style={styles.scheduleIndicator}>
                {hasSchedule && (
                  <View style={[styles.scheduleDot, { backgroundColor: subjectColor }]} />
                )}
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  // 현재 날짜 포맷팅
  const getCurrentDate = () => {
    const today = new Date();
    const month = today.getMonth() + 1;
    const date = today.getDate();
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    const dayName = dayNames[today.getDay()];
    return `${month}월 ${date}일 ${dayName}요일`;
  };


  const handleAddSchedule = () => {
    console.log('📅 일정 버튼 누름');
    if (Platform.OS === 'web') {
      alert('일정 추가 기능');
    } else {
      Alert.alert('일정 추가', '일정 추가 기능을 구현하시겠습니까?');
    }
  };

  const handleEditSubject = () => {
    console.log('✏️ 과목 수정 버튼 누름');
    if (Platform.OS === 'web') {
      const newName = prompt('과목 이름을 수정하세요:', subjectName);
      if (newName && newName !== subjectName) {
        updateSubjectInfo({ name: newName });
      }
    } else {
      Alert.prompt(
        '과목 수정',
        '과목 이름을 수정하세요:',
        [
          { text: '취소', style: 'cancel' },
          { 
            text: '수정', 
            onPress: (newName) => {
              if (newName && newName !== subjectName) {
                updateSubjectInfo({ name: newName });
              }
            }
          }
        ],
        'plain-text',
        subjectName
      );
    }
  };

  const updateSubjectInfo = async (data: { name?: string; color?: string; isFavorite?: boolean }) => {
    try {
      console.log('🔄 과목 정보 업데이트:', data);
      await updateSubject(subjectId, data);
      console.log('✅ 과목 정보 업데이트 성공');
      
      if (Platform.OS === 'web') {
        alert('과목 정보가 수정되었습니다.');
      } else {
        Alert.alert('수정 완료', '과목 정보가 수정되었습니다.');
      }
      
      // 정보 새로고침
      await fetchSubject();
    } catch (e: any) {
      console.error('❌ 과목 정보 업데이트 실패:', e);
      const errorMessage = e.response?.data?.message || e.message || '알 수 없는 오류가 발생했습니다.';
      
      if (Platform.OS === 'web') {
        alert(`과목 정보 수정에 실패했습니다.\n\n${errorMessage}`);
      } else {
        Alert.alert('오류', `과목 정보 수정에 실패했습니다.\n\n${errorMessage}`);
      }
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={subjectColor} />
        <Text style={styles.loadingText}>로딩중...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#1A346F" />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: subjectColor }]}>{subjectName}</Text>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={handleEditSubject}
        >
          <Ionicons name="create-outline" size={20} color="#1A346F" />
        </TouchableOpacity>
      </View>

      {/* 진행률 박스 */}
      <View style={styles.progressBox}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { 
                width: `${(subject?.progress || 0) * 100}%`,
                backgroundColor: subjectColor
              }
            ]} 
          />
        </View>
        <View style={styles.progressInfo}>
          <Text style={[styles.progressPercent, { color: subjectColor }]}>
            {Math.round((subject?.progress || 0) * 100)}%
          </Text>
          <Text style={[styles.progressText, { color: subjectColor }]}>
            회독 {subject?.reviewCount || 0}회 / 총 {subject?.totalCount || 0}회
          </Text>
        </View>
      </View>

      {/* 메인 콘텐츠 - 3개 박스 */}
      <View style={styles.mainContent}>
        {/* 자료 섹션 */}
        <View style={styles.section}>
          <SubjectFileStorage 
            subjectId={subjectId}
            folderId={subjectId} // 과목 ID를 폴더 ID로 사용
            subjectColor={subjectColor}
          />
        </View>

        {/* 일정 섹션 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="calendar" size={20} color={subjectColor} />
            <Text style={[styles.sectionTitle, { color: subjectColor }]}>일정</Text>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={handleAddSchedule}
            >
              <Ionicons name="add" size={20} color={subjectColor} />
            </TouchableOpacity>
          </View>
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>비어있음</Text>
          </View>
        </View>

        {/* 캘린더 섹션 */}
        <View style={styles.calendarSection}>
          {renderWeekCalendar()}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
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
  editButton: {
    padding: 8,
  },
  progressBox: {
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
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginBottom: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressPercent: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A346F',
  },
  progressText: {
    fontSize: 14,
    color: '#1A346F',
  },
  mainContent: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
  },
  section: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16, // 두 섹션 모두 동일한 패딩
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A346F',
    flex: 1,
  },
  addButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
  },
  calendarSection: {
    width: 80,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  calendarContainer: {
    alignItems: 'center',
  },
  calendarTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1A346F',
    marginBottom: 8,
  },
  dayRow: {
    alignItems: 'center',
    marginBottom: 8,
  },
  dayLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  todayLabel: {
    color: '#1A346F',
    fontWeight: 'bold',
  },
  scheduleIndicator: {
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scheduleDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});

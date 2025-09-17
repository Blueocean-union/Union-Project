import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import 'react-native-url-polyfill/auto';
import AddScheduleModal from './AddScheduleModal'; // 새로 추가

export default function CalendarAppScreen() {
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(today.getDate());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth()); // 0-based
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [schedules, setSchedules] = useState<{ [key: string]: any[] }>({});
  const [todaySchedules, setTodaySchedules] = useState<any[]>([]);
  const [isLoadingMonth, setIsLoadingMonth] = useState(false);
  const [isLoadingToday, setIsLoadingToday] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false); // 새로 추가

  const months = [
    '1월', '2월', '3월', '4월', '5월', '6월',
    '7월', '8월', '9월', '10월', '11월', '12월'
  ];
  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

  const getDaysInMonth = (month: number, year: number) => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let day = 1; day <= daysInMonth; day++) days.push(day);
    return days;
  };

  const days = getDaysInMonth(currentMonth, currentYear);

  useEffect(() => {
    fetchSchedulesByMonth(currentYear, currentMonth + 1);
  }, [currentYear, currentMonth]);

  useEffect(() => {
    // 오늘 날짜가 선택된 경우 오늘의 일정을 가져옴
    const isToday = selectedDate === today.getDate() && 
                   currentMonth === today.getMonth() && 
                   currentYear === today.getFullYear();
    
    if (isToday) {
      fetchTodaySchedules();
    }
  }, [selectedDate, currentMonth, currentYear]);

  const fetchTodaySchedules = async () => {
    try {
      setIsLoadingToday(true);
      const token = await AsyncStorage.getItem('accessToken');
      const res = await axios.get(
        'http://52.78.209.115:8080/api/schedules/today',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const schedulesWithColors = res.data.map((item: any) => ({
        ...item,
        color: categoryColorMap[item.category]?.bg || '#F5F5F5',
        textColor: categoryColorMap[item.category]?.text || '#333',
        iconColor: categoryColorMap[item.category]?.icon || '#666'
      }));

      setTodaySchedules(schedulesWithColors);
    } catch (err) {
      console.error('오늘의 일정 불러오기 실패:', err);
      setTodaySchedules([]);
    } finally {
      setIsLoadingToday(false);
    }
  };

  const fetchSchedulesByMonth = async (year: number, month: number) => {
    try {
      setIsLoadingMonth(true);
      const token = await AsyncStorage.getItem('accessToken');
      const res = await axios.get(
        `http://52.78.209.115:8080/api/schedules/month?year=${year}&month=${month}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const grouped: { [key: string]: any[] } = {};
      res.data.forEach((item: any) => {
        const start = new Date(item.startDate);
        const end = new Date(item.endDate);
        const scheduleStart = new Date(start);
        const scheduleEnd = new Date(end);

        while (scheduleStart <= scheduleEnd) {
          const d = scheduleStart.getDate();
          const m = scheduleStart.getMonth();
          const key = `${m}-${d}`;
          if (!grouped[key]) grouped[key] = [];
          grouped[key].push({
            ...item,
            color: categoryColorMap[item.category]?.bg || '#F5F5F5',
            textColor: categoryColorMap[item.category]?.text || '#333',
            iconColor: categoryColorMap[item.category]?.icon || '#666'
          });
          scheduleStart.setDate(scheduleStart.getDate() + 1);
        }
      });
      setSchedules(grouped);
    } catch (err) {
      console.error('월간 일정 불러오기 실패:', err);
      setSchedules({});
    } finally {
      setIsLoadingMonth(false);
    }
  };

  // 일정이 추가된 후 실행되는 함수
  const handleScheduleAdded = async () => {
    // 월간 일정과 오늘 일정을 다시 불러옴
    await fetchSchedulesByMonth(currentYear, currentMonth + 1);
    
    const isToday = selectedDate === today.getDate() && 
                   currentMonth === today.getMonth() && 
                   currentYear === today.getFullYear();
    
    if (isToday) {
      await fetchTodaySchedules();
    }
  };

  const categoryColorMap: Record<string, { bg: string, text: string, icon: string }> = {
    '과제': { bg: '#E8F5E8', text: '#2D5D2D', icon: '#4CAF50' },
    '시험': { bg: '#FFF3E0', text: '#EF6C00', icon: '#FB8C00' },
    '발표': { bg: '#E3F2FD', text: '#1565C0', icon: '#2196F3' },
    '기타': { bg: '#F5F5F5', text: '#616161', icon: '#9E9E9E' }
  };

  const getDateSchedules = (date: number) => {
    const key = `${currentMonth}-${date}`;
    return schedules[key] || [];
  };

  // 연속된 일정들을 그룹핑하는 함수
  const getConsecutiveScheduleGroups = () => {
    const groups: { [key: string]: { schedule: any, startDay: number, endDay: number, row: number } } = {};
    const usedRows: { [key: number]: boolean[] } = {}; // 각 날짜별로 사용된 행들을 추적
    
    // 현재 달의 모든 날짜에 대해 일정을 확인
    days.forEach((day, dayIndex) => {
      if (!day) return;
      
      const daySchedules = getDateSchedules(day);
      if (!usedRows[day]) usedRows[day] = [];
      
      daySchedules.forEach(schedule => {
        const scheduleKey = `${schedule.title}-${schedule.startDate}`;
        
        if (!groups[scheduleKey]) {
          // 새로운 일정 그룹 생성
          let availableRow = 0;
          // 사용 가능한 행 찾기
          while (usedRows[day] && usedRows[day][availableRow]) {
            availableRow++;
          }
          
          groups[scheduleKey] = {
            schedule,
            startDay: day,
            endDay: day,
            row: availableRow
          };
          
          // 해당 행을 사용 중으로 표시
          if (!usedRows[day]) usedRows[day] = [];
          usedRows[day][availableRow] = true;
        } else if (groups[scheduleKey].endDay === day - 1) {
          // 연속된 일정인 경우 끝 날짜 업데이트
          groups[scheduleKey].endDay = day;
          
          // 연속된 날짜의 같은 행을 사용 중으로 표시
          if (!usedRows[day]) usedRows[day] = [];
          usedRows[day][groups[scheduleKey].row] = true;
        }
      });
    });
    
    return Object.values(groups);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    }
  };

  const getSelectedDateSchedules = () => {
    // 오늘 날짜가 선택된 경우 오늘의 일정 API 결과 사용
    const isToday = selectedDate === today.getDate() && 
                   currentMonth === today.getMonth() && 
                   currentYear === today.getFullYear();
    
    if (isToday) {
      return todaySchedules;
    }
    
    // 다른 날짜는 월간 일정에서 가져옴
    return getDateSchedules(selectedDate);
  };

  // 날짜의 인덱스를 구하는 함수
  const getDayIndex = (day: number) => {
    return days.findIndex(d => d === day);
  };

  // 연속 일정 바를 렌더링하는 함수
  const renderConsecutiveSchedules = () => {
    const scheduleGroups = getConsecutiveScheduleGroups();
    
    return scheduleGroups.map((group, groupIndex) => {
      const startIndex = getDayIndex(group.startDay);
      const endIndex = getDayIndex(group.endDay);
      
      if (startIndex === -1 || endIndex === -1) return null;
      
      const startRow = Math.floor(startIndex / 7);
      const endRow = Math.floor(endIndex / 7);
      
      // 여러 주에 걸친 일정의 경우 각 주별로 분할해서 렌더링
      const segments = [];
      
      for (let row = startRow; row <= endRow; row++) {
        const rowStartIndex = row * 7;
        const rowEndIndex = (row + 1) * 7 - 1;
        
        const segmentStartIndex = Math.max(startIndex, rowStartIndex);
        const segmentEndIndex = Math.min(endIndex, rowEndIndex);
        
        const segmentStartCol = segmentStartIndex % 7;
        const segmentEndCol = segmentEndIndex % 7;
        
        const left = (segmentStartCol * 14.28) + 2;
        const width = ((segmentEndCol - segmentStartCol + 1) * 14.28) - 4;
        const top = (row * 67) + 35 + (group.row * 18);
        
        segments.push(
          <View
            key={`${groupIndex}-${row}`}
            style={[
              styles.consecutiveSchedule,
              {
                position: 'absolute',
                left: `${left}%`,
                width: `${width}%`,
                top: top,
                backgroundColor: group.schedule.color,
                borderRadius: group.startDay === group.endDay ? 2 : 
                  (segmentStartCol === startIndex % 7 && segmentEndCol === endIndex % 7) ? 2 :
                  (segmentStartCol === startIndex % 7) ? '2px 0 0 2px' :
                  (segmentEndCol === endIndex % 7) ? '0 2px 2px 0' : 0
              }
            ]}
          >
            <Text style={[
              styles.schedulePreviewText,
              { color: group.schedule.textColor }
            ]} numberOfLines={1}>
              {group.schedule.title}
            </Text>
          </View>
        );
      }
      
      return segments;
    });
  };

  const renderScheduleItem = (schedule: any, key: string) => (
    <View key={key} style={[styles.scheduleItem, { backgroundColor: schedule.color }]}>
      <View style={styles.scheduleHeader}>
        <Text style={[styles.categoryText, { color: schedule.textColor }]}>
          {schedule.category}
        </Text>
      </View>
      <View style={styles.scheduleContent}>
        <View style={styles.timeContainer}>
          <Ionicons name="time-outline" size={16} color="#666" />
          <Text style={styles.timeText}>
            {schedule.startTime || new Date(schedule.startDate).toLocaleTimeString('ko-KR', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Text>
        </View>
        <Text style={[styles.titleText, { color: schedule.textColor }]}>
          {schedule.title}
        </Text>
        {schedule.description && (
          <Text style={[styles.descriptionText, { color: schedule.textColor }]}>
            {schedule.description}
          </Text>
        )}
      </View>
    </View>
  );

  // 선택된 날짜를 Date 객체로 반환하는 함수
  const getSelectedDateAsDateObject = () => {
    return new Date(currentYear, currentMonth, selectedDate);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#EEEFF6" />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#3F4E7C" />
          <Text style={styles.headerTitle}>일정</Text>
        </TouchableOpacity>
        <Text style={styles.yearText}>{currentYear}년</Text>
      </View>

      <View style={styles.mainContent}>
        {/* 왼쪽 캘린더 섹션 */}
        <View style={styles.leftSection}>
          <View style={styles.calendarContainer}>
            <View style={styles.monthHeader}>
              <TouchableOpacity onPress={() => navigateMonth('prev')}>
                <Ionicons name="chevron-back" size={20} color="#666" />
              </TouchableOpacity>
              <Text style={styles.monthText}>{months[currentMonth]}</Text>
              <TouchableOpacity onPress={() => navigateMonth('next')}>
                <Ionicons name="chevron-forward" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.weekDaysContainer}>
              {weekDays.map((day: string, index: number) => (
                <View key={index} style={styles.weekDayCell}>
                  <Text style={[
                    styles.weekDayText,
                    index === 0 && { color: '#FF5252' },
                    index === 6 && { color: '#2196F3' }
                  ]}>
                    {day}
                  </Text>
                </View>
              ))}
            </View>

            <View style={styles.calendarGrid}>
              {days.map((day: number | null, index: number) => (
                <TouchableOpacity
                  key={index}
                  style={styles.dayCell}
                  onPress={() => day && setSelectedDate(day)}
                  disabled={!day}
                >
                  {day && (
                    <>
                      {/* 선택된 날짜에 빨간 원 배경 */}
                      {day === selectedDate && (
                        <View style={styles.selectedDayCircle} />
                      )}
                      <Text style={[
                        styles.dayText,
                        // 선택된 날짜에는 흰색 글자
                        day === selectedDate && styles.selectedDayText,
                        // 일요일은 빨간색, 토요일은 파란색 (선택되지 않은 경우에만)
                        day !== selectedDate && index % 7 === 0 && { color: '#FF5252' },
                        day !== selectedDate && index % 7 === 6 && { color: '#2196F3' }
                      ]}>
                        {day}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              ))}
              
              {/* 연속 일정 바들 렌더링 */}
              {renderConsecutiveSchedules()}
            </View>
          </View>
        </View>

        {/* 오른쪽 일정 섹션 */}
        <View style={styles.rightSection}>
          <View style={styles.scheduleSection}>
            <View style={styles.scheduleSectionHeader}>
              <Text style={styles.scheduleSectionTitle}>
                {currentMonth + 1}월 {selectedDate}일 일정
              </Text>
              <TouchableOpacity 
                style={styles.addButton}
                onPress={() => setShowAddModal(true)}
              >
                <Ionicons name="add" size={18} color="white" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.scheduleScrollView}>
              {isLoadingToday || isLoadingMonth ? (
                <View style={styles.loadingContainer}>
                  <Text style={styles.loadingText}>일정을 불러오는 중...</Text>
                </View>
              ) : getSelectedDateSchedules().length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>예정된 일정이 없습니다.</Text>
                </View>
              ) : (
                getSelectedDateSchedules().map((schedule: any, index: number) => 
                  renderScheduleItem(schedule, `schedule-${index}`)
                )
              )}
            </ScrollView>
          </View>
        </View>
      </View>

      {/* 일정 추가 모달 */}
      <AddScheduleModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        selectedDate={getSelectedDateAsDateObject()}
        onScheduleAdded={handleScheduleAdded}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EEEFF6',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#EEEFF6',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#3B4B87',
    marginLeft: 10,
  },
  yearText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#3B4B87',
  },
  mainContent: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: 30,
    paddingTop: 10,
    gap: 30,
  },
  leftSection: {
    flex: 1,
  },
  rightSection: {
    flex: 1,
  },
  calendarContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 40,
    paddingTop:30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    height: 550,
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  monthText: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#333',
  },
  weekDaysContainer: {
    flexDirection: 'row',
    marginBottom: -5,
  },
  weekDayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  weekDayText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#666',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    position: 'relative',
  },
  dayCell: {
    width: '14.28%',
    height: 67,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 10,
    position: 'relative',
  },
  selectedDayCircle: {
    position: 'absolute',
    top: 9,
    width: 26,
    height: 26,
    borderRadius: 15,
    backgroundColor: '#FF5722',
    zIndex: 1,
  },
  dayText: {
    fontSize: 16,
    fontWeight: "500",
    color: '#333',
    zIndex: 2,
  },
  selectedDayText: {
    color: 'white',
    fontWeight: '600',
  },
  consecutiveSchedule: {
    height: 14,
    justifyContent: 'center',
    paddingHorizontal: 4,
    zIndex: 2,
  },
  schedulePreview: {
    position: 'absolute',
    left: 2,
    right: 2,
    height: 15,
    borderRadius: 2,
    zIndex: 2,
  },
  schedulePreviewText: {
    fontSize: 8,
    fontWeight: '500',
    textAlign: 'center',
    paddingHorizontal: 2,
  },
  scheduleSection: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    height: 550,
  },
  scheduleSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  scheduleSectionTitle: {
    paddingLeft:10,
    fontSize: 35,
    fontWeight: 'bold',
    color: '#3F4E7C',
  },
  addButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#3F4E7C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scheduleScrollView: {
    flex: 1,
  },
  scheduleItem: {
    borderRadius: 12,
    padding: 8,
    minHeight: 70,
    marginBottom: 12,
  },
  scheduleHeader: {
    marginBottom: 5,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '500',
  },
  scheduleContent: {
    gap: 3,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 12,
    color: '#666',
  },
  titleText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  descriptionText: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    paddingTop:150,
    fontSize: 24,
    color: '#b4b4b4ff',
    fontWeight: '500',
  },
});
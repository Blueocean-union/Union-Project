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

export default function CalendarAppScreen() {
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(today.getDate());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth()); // 0-based
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [schedules, setSchedules] = useState<{ [key: string]: any[] }>({});

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

  const fetchSchedulesByMonth = async (year: number, month: number) => {
    try {
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
            color: categoryColorMap[item.category]?.bg || '#EEE',
            textColor: categoryColorMap[item.category]?.text || '#000',
            iconColor: categoryColorMap[item.category]?.icon || '#000'
          });
          scheduleStart.setDate(scheduleStart.getDate() + 1);
        }
      });
      setSchedules(grouped);
    } catch (err) {
      console.error('월간 일정 불러오기 실패:', err);
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

  const hasSchedule = (date: number) => {
    const key = `${currentMonth}-${date}`;
    return schedules[key] && schedules[key].length > 0;
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
    return getDateSchedules(selectedDate);
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
          <Text style={styles.timeText}>{schedule.startTime || '11:30'}</Text>
        </View>
        <Text style={[styles.titleText, { color: schedule.textColor }]}>
          {schedule.title}
        </Text>
      </View>
    </View>
  );

  // 예시 데이터 (실제 프로덕션에서는 제거)
  const sampleSchedules = [
    {
      id: 'sample-1',
      title: '어버이날',
      category: '기타',
      startDate: '',
      endDate: '',
      color: '#E8B4F0',
      textColor: '#333'
    },
    {
      id: 'sample-2',
      title: '컴퓨터그래픽 프로젝트 팀 제출',
      category: '과제',
      startDate: '',
      endDate: '',
      startTime: '11:30',
      color: '#E8F5E8',
      textColor: '#333'
    },
    {
      id: 'sample-3',
      title: '선형대수 필기',
      category: '시험',
      startDate: '',
      endDate: '',
      startTime: '13:00',
      color: '#E3F2FD',
      textColor: '#333'
    }
  ];

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
                      {hasSchedule(day) && (
                        <View style={styles.scheduleIndicator} />
                      )}
                    </>
                  )}
                </TouchableOpacity>
              ))}
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
              <TouchableOpacity style={styles.addButton}>
                <Ionicons name="add" size={18} color="white" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.scheduleScrollView}>
              {/* 예시 일정들 */}
              {sampleSchedules.map((schedule, index) => (
                <View key={`sample-${index}`} style={[styles.scheduleItem, { backgroundColor: schedule.color }]}>
                  {schedule.category === '기타' && schedule.title === '어버이날' ? (
                    <View style={styles.scheduleHeader}>
                      <Text style={styles.categoryBadge}>{schedule.title}</Text>
                    </View>
                  ) : (
                    <View style={styles.scheduleContent}>
                      <View style={styles.timeContainer}>
                        <Ionicons 
                          name={schedule.category === '과제' ? "calendar-outline" : "time-outline"} 
                          size={16} 
                          color="#666" 
                        />
                        <Text style={styles.timeText}>{schedule.startTime}</Text>
                      </View>
                      <Text style={styles.titleText}>{schedule.title}</Text>
                    </View>
                  )}
                </View>
              ))}

              {/* 동적 일정들 */}
              {getSelectedDateSchedules().map((schedule: any, index: number) => 
                renderScheduleItem(schedule, `dynamic-${index}`)
              )}
            </ScrollView>
          </View>
        </View>
      </View>
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    height: 550, // 캘린더 고정 높이 설정
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28,
  },
  monthText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  weekDaysContainer: {
    flexDirection: 'row',
    marginBottom: -10,
  },
  weekDayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  weekDayText: {
    fontSize: 20,
    fontWeight: '500',
    color: '#666',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    height: 67, // 날짜 셀 높이 축소
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  selectedDayCircle: {
    position: 'absolute',
    width: 38,
    height: 38,
    borderRadius: 30,  // 완전한 원형
    backgroundColor: '#FF5722',  // 빨간 원
    zIndex: 1,  // 글자보다 뒤에 위치
  },
  dayText: {
    fontSize: 20,
    fontWeight: "400",
    color: '#333',
    zIndex: 2,  // 원보다 앞에 위치
  },
  selectedDayText: {
    color: 'white',  // 흰색 글자
    fontWeight: '600',
  },
  scheduleIndicator: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#FF5722',
    position: 'absolute',
    bottom: 6,
    zIndex: 2,  // 원보다 앞에 위치
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
    height: 550, // 일정 섹션도 캘린더와 동일한 높이로 설정
  },
  scheduleSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  scheduleSectionTitle: {
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
    height: 70,
    marginBottom: 12,
  },
  scheduleHeader: {
    marginBottom: 5,
  },
  categoryBadge: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
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
});
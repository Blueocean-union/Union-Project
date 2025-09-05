import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
// import Svg, { Circle } from 'react-native-svg'; // SVG 패키지가 없어서 주석 처리

interface Subject {
  id: number;
  name: string;
  color: string;
  isFavorite: boolean;
  createdAt: string;
  progress?: number;
}

interface Schedule {
  id: number;
  title: string;
  category: string;
  startDate: string;
  endDate: string;
  description: string;
  isCompleted: boolean;
  createdAt: string;
}

const API_BASE = 'http://52.78.209.115:8080/api';

const getSubjects = async (): Promise<Subject[]> => {
  try {
    const response = await fetch(`${API_BASE}/subjects`, {
      headers: { 'accept': '*/*' },
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    const progressData = [65, 45, 80, 90];
    return data.map((subject: Subject, index: number) => ({
      ...subject,
      progress: progressData[index % progressData.length] || 0
    }));
  } catch (error) {
    console.error('⚠ 과목 목록 조회 실패:', error);
    return [];
  }
};

const getTodaySchedules = async (): Promise<Schedule[]> => {
  try {
    const response = await fetch(`${API_BASE}/schedules/today`, {
      headers: { 'accept': '*/*' },
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('⚠ 오늘의 일정 조회 실패:', error);
    return [];
  }
};

const CircularProgress = ({ percentage, title, size = 100 }: { percentage: number; title: string; size?: number }) => {
  return (
    <View style={styles.progressContainer}>
      <View style={[styles.circularProgress, { width: size, height: size }]}>
        <Text style={styles.progressPercentage}>{percentage}%</Text>
        <Text style={styles.progressSubjectName}>{title}</Text>
      </View>
    </View>
  );
};

const CalendarDay = ({ day, isToday, isSelected, isWeekend, onPress }: { 
  day: number; isToday: boolean; isSelected: boolean; isWeekend: boolean; onPress: () => void;
}) => (
  <TouchableOpacity 
    style={[styles.calendarDay, (isToday || isSelected) && styles.selectedDay]}
    onPress={onPress}
  >
    <Text style={[
      styles.calendarDayText,
      (isToday || isSelected) && styles.selectedText,
      isWeekend && !isToday && !isSelected && styles.weekendText
    ]}>
      {day}
    </Text>
  </TouchableOpacity>
);

const TaskSection = ({ title, icon, schedules, onToggle, loading }: {
  title: string; icon: string; schedules: Schedule[]; onToggle: (id: number) => void; loading?: boolean;
}) => (
  <View style={title === '예정' ? styles.taskLeftColumn : styles.taskRightColumn}>
    <View style={styles.taskHeader}>
      <Ionicons name={icon as any} size={25} color="#CBCDDB" />
      <Text style={styles.taskHeaderText}>{title}</Text>
    </View>
    {loading ? (
      <View style={styles.taskLoadingContainer}>
        <ActivityIndicator size="small" color="#CBCDDB" />
        <Text style={styles.taskLoadingText}>일정을 불러오는 중...</Text>
      </View>
    ) : (
      schedules.map(schedule => (
        <View key={schedule.id} style={styles.taskItem}>
          <TouchableOpacity onPress={() => onToggle(schedule.id)}>
            <Ionicons 
              name={schedule.isCompleted ? "checkmark-circle" : "radio-button-off-outline"} 
              size={19} color="#CBCDDB" 
            />
          </TouchableOpacity>
          <Text style={styles.taskText}>{schedule.title}</Text>
        </View>
      ))
    )}
  </View>
);

const MainScreen = () => {
  const navigation = useNavigation<any>();
  const [currentDate, setCurrentDate] = useState(new Date(2025, 4, 9));
  const [selectedDate, setSelectedDate] = useState<number | null>(9);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [schedulesLoading, setSchedulesLoading] = useState(true);

  const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];

  useEffect(() => {
    loadSubjects();
    loadSchedules();
  }, []);

  const loadSubjects = async () => {
    setLoading(true);
    const subjectData = await getSubjects();
    setSubjects(subjectData);
    setLoading(false);
  };

  const loadSchedules = async () => {
    setSchedulesLoading(true);
    const scheduleData = await getTodaySchedules();
    setSchedules(scheduleData);
    setSchedulesLoading(false);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + (direction === 'prev' ? -1 : 1));
    setCurrentDate(newDate);
    setSelectedDate(null);
  };

  const toggleTodo = (id: number) => {
    setSchedules(schedules.map(schedule => 
      schedule.id === id ? { ...schedule, isCompleted: !schedule.isCompleted } : schedule
    ));
  };

  const handleLogout = () => {
    navigation.navigate('Logout');
  };

  const renderCalendar = () => {
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
    const today = new Date();
    const isCurrentMonth = currentDate.getFullYear() === today.getFullYear() && 
                          currentDate.getMonth() === today.getMonth();

    return (
      <View style={styles.calendar}>
        <View style={styles.calendarNavigation}>
          <TouchableOpacity onPress={() => navigateMonth('prev')}>
            <Ionicons name="chevron-back" size={20} color="#3B4B87" />
          </TouchableOpacity>
          <Text style={styles.calendarTitle}>
            {currentDate.getFullYear()}년 {monthNames[currentDate.getMonth()]}
          </Text>
          <TouchableOpacity onPress={() => navigateMonth('next')}>
            <Ionicons name="chevron-forward" size={20} color="#3B4B87" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.calendarHeader}>
          {days.map((day, index) => (
            <Text key={index} style={[styles.dayHeader, (index === 0 || index === 6) && styles.weekendHeader]}>
              {day}
            </Text>
          ))}
        </View>

        <View style={styles.calendarGrid}>
          {Array.from({ length: firstDayOfMonth }, (_, index) => (
            <View key={`empty-${index}`} style={styles.calendarDay} />
          ))}
          {Array.from({ length: daysInMonth }, (_, index) => {
            const date = index + 1;
            const dayOfWeek = (firstDayOfMonth + index) % 7;
            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
            const isToday = isCurrentMonth && date === today.getDate();
            const isSelected = date === selectedDate;
            
            return (
              <CalendarDay
                key={date}
                day={date}
                isToday={isToday}
                isSelected={isSelected}
                isWeekend={isWeekend}
                onPress={() => setSelectedDate(date)}
              />
            );
          })}
        </View>
      </View>
    );
  };

  const renderProgressSection = () => {
    if (loading) {
      return (
        <View style={styles.progressSection}>
          <View style={styles.progressBox}>
            <ActivityIndicator size="large" color="#3B4B87" />
            <Text style={styles.loadingText}>과목 정보를 불러오는 중...</Text>
          </View>
        </View>
      );
    }

    if (subjects.length === 0) {
      return (
        <View style={styles.progressSection}>
          <View style={styles.progressBox}>
            <Text style={styles.noDataText}>등록된 과목이 없습니다.</Text>
            <TouchableOpacity style={styles.refreshButton} onPress={loadSubjects}>
              <Text style={styles.refreshButtonText}>새로고침</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.progressSection}>
        <View style={styles.progressBox}>
          {subjects.slice(0, 4).map((subject) => (
            <CircularProgress 
              key={subject.id}
              percentage={subject.progress || 0} 
              title={subject.name} 
              size={140}
            />
          ))}
        </View>
      </View>
    );
  };

  const pendingSchedules = schedules.filter(s => !s.isCompleted);
  const completedSchedules = schedules.filter(s => s.isCompleted);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#EEEFF6" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Union</Text>
        <View style={styles.headerRight}>
          <Text style={styles.headerUser}>사용자명</Text>
          <TouchableOpacity onPress={handleLogout}>
            <Ionicons name="person-circle-outline" size={48} color="#3B4B87" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.taskAndCalendarSection}>
        <View style={styles.taskContainer}>
          <TaskSection 
            title="예정" 
            icon="calendar-outline" 
            schedules={pendingSchedules}
            onToggle={toggleTodo}
            loading={schedulesLoading}
          />
          <View style={styles.verticalDivider} />
          <TaskSection 
            title="완료됨" 
            icon="checkmark-circle" 
            schedules={completedSchedules}
            onToggle={toggleTodo}
          />
        </View>
        {renderCalendar()}
      </View>

      {renderProgressSection()}

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, 
    backgroundColor: '#EEEFF6', 
    paddingBottom: 80 },
  header: { flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 70, 
    paddingVertical: 10, 
    backgroundColor: '#EEEFF6' },
  headerTitle: { fontSize: 64, 
    fontWeight: 'bold', 
    color: '#3B4B87' },
  headerRight: { flexDirection: 'row', 
    alignItems: 'center', 
    gap: 8 },
  headerUser: { fontSize: 32, 
    fontWeight: 'bold', 
    color: '#3B4B87' },
  taskAndCalendarSection: { paddingHorizontal: 70, marginBottom: 5, flexDirection: 'row', gap: 35 },
  taskContainer: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, flexDirection: 'row', flex: 3, height: 280 },
  taskLeftColumn: { flex: 1, paddingLeft: 15, paddingRight: 15 },
  taskRightColumn: { flex: 1, paddingLeft: 15 },
  verticalDivider: { width: 1, backgroundColor: '#E5E7EB', marginHorizontal: 10 },
  taskHeader: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, gap: 8, marginBottom: 4 },
  taskHeaderText: { fontSize: 20, color: '#CBCDDB', fontWeight: '600' },
  taskItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, gap: 8 },
  taskText: { fontSize: 16, color: '#CBCDDB', fontWeight: '500' },
  taskLoadingContainer: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 8 },
  taskLoadingText: { fontSize: 14, color: '#9CA3AF' },
  calendar: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 20, flex: 1, height: 280 },
  calendarNavigation: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, paddingHorizontal: 8 },
  calendarTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F2937', textAlign: 'center' },
  calendarHeader: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 10, paddingHorizontal: 8 },
  dayHeader: { fontSize: 15, color: '#6B7280', letterSpacing: 0.1, fontWeight: '600', width: 24, textAlign: 'center' },
  weekendHeader: { color: '#EF4444' },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 8 },
  calendarDay: { width: '14.28%', height: 26, alignItems: 'center', justifyContent: 'center', marginVertical: 2 },
  calendarDayText: { fontSize: 15, letterSpacing: 0.1, color: '#1F2937' },
  selectedDay: { backgroundColor: '#EF4444', borderRadius: 14 },
  selectedText: { color: '#FFFFFF', fontWeight: 'bold' },
  weekendText: { color: '#EF4444' },
  progressSection: { paddingVertical: 20, paddingHorizontal: 70 },
  progressBox: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 12, padding: 20, minHeight: 200 },
  progressContainer: { alignItems: 'center', marginHorizontal: 5, justifyContent: 'center' },
  circularProgress: { 
    backgroundColor: '#FFFFFF', 
    borderRadius: 70, 
    alignItems: 'center', 
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#3B4B87',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  progressPercentage: { fontSize: 24, fontWeight: 'bold', color: '#3B4B87', marginBottom: 4 },
  progressSubjectName: { fontSize: 16, fontWeight: 'bold', color: '#3B4B87', textAlign: 'center', lineHeight: 18 },
  loadingText: { fontSize: 16, color: '#6B7280', marginLeft: 10 },
  noDataText: { fontSize: 18, color: '#6B7280', textAlign: 'center', marginBottom: 10 },
  refreshButton: { backgroundColor: '#3B4B87', paddingHorizontal: 20, paddingVertical: 8, borderRadius: 8 },
  refreshButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  activeNavText: { color: '#3B4B87', fontWeight: '600' },
});

export default MainScreen;
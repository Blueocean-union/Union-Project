// screens/CalendarAppScreen.tsx
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { CommonStyles } from '../styles/CommonStyles';

export const CalendarAppScreen: React.FC = () => {
  const [currentMonth, setCurrentMonth] = React.useState(0);
  const [currentYear] = React.useState(new Date().getFullYear());

  const months = [
    '1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'
  ];
  const weekDays = ['일','월','화','수','목','금','토'];
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  const navigateMonth = (dir: 'prev' | 'next') => {
    setCurrentMonth((prev) => {
      if (dir === 'prev') return (prev + 11) % 12;
      return (prev + 1) % 12;
    });
  };

  return (
    <SafeAreaView style={CommonStyles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigateMonth('prev')} style={styles.backButton}>
          <Text>{'<'}</Text>
        </TouchableOpacity>

        <View style={{ alignItems: 'center' }}>
          <Text style={styles.headerTitle}>일정</Text>
          <Text style={styles.headerYear}>{currentYear}년</Text>
        </View>

        <TouchableOpacity onPress={() => navigateMonth('next')} style={styles.backButton}>
          <Text>{'>'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.mainContent}>
        <View style={styles.calendarContainer}>
          <View style={styles.calendarHeader}>
            <TouchableOpacity onPress={() => navigateMonth('prev')}>
              <Text>{'<'}</Text>
            </TouchableOpacity>
            <Text style={styles.monthTitle}>{months[currentMonth]}</Text>
            <TouchableOpacity onPress={() => navigateMonth('next')}>
              <Text>{'>'}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.weekDays}>
            {weekDays.map((w) => (
              <Text key={w} style={styles.weekDayText}>
                {w}
              </Text>
            ))}
          </View>

          <ScrollView style={styles.calendarScrollView}>
            <View style={styles.calendarGrid}>
              {days.map((d, i) => (
                <View key={i} style={styles.dateCell}>
                  <Text style={styles.dateNumber}>{d}</Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>

        <View style={styles.sidePanel}>
          <Text style={styles.sidePanelTitle}>메모</Text>
          {/* 오른쪽 패널 컨텐츠 */}
        </View>
      </View>
    </SafeAreaView>
  );
};

// 🚫 CommonStyles에 없는 키들만 로컬 정의
const styles = StyleSheet.create({
  header: {
    height: 56,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  headerYear: { marginTop: 2, color: '#666' },

  mainContent: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: 12,
    gap: 12,
  },
  calendarContainer: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
  },
  calendarHeader: {
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  monthTitle: { fontSize: 16, fontWeight: '700' },
  weekDays: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  weekDayText: { width: 32, textAlign: 'center', color: '#888' },
  calendarScrollView: { marginTop: 8 },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dateCell: {
    width: 42,
    height: 42,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateNumber: { color: '#333' },
  sidePanel: {
    width: 140,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
  },
  sidePanelTitle: { fontWeight: '700', marginBottom: 8 },
});

// screens/schedule/CalendarAppScreen.tsx
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
  Alert,
  Platform,
} from 'react-native';
import 'react-native-url-polyfill/auto';
import { CommonStyles } from '../../styles/CommonStyles';

type RawSchedule = {
  id: number | string;
  title: string;
  description?: string | null;
  category?: string | null;     // '과제' | '시험' | '발표' | '기타' | 기타
  startDate: string;            // ISO string
  endDate: string;              // ISO string
};

type DaySchedule = RawSchedule & {
  color: string;
  textColor: string;
  iconColor: string;
};

type SchedulesByDayKey = Record<string, DaySchedule[]>; // key = YYYY-MM-DD

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  (process.env as any).REACT_NATIVE_API_BASE_URL ||
  (Platform.OS === 'android' ? 'http://10.0.2.2:8080' : 'http://localhost:8080');

const months = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];
const weekDays = ['일','월','화','수','목','금','토'];

const categoryColorMap: Record<string, { bg: string; text: string; icon: string }> = {
  '과제': { bg: '#E8F5E8', text: '#2D5D2D', icon: '#4CAF50' },
  '시험': { bg: '#FFF3E0', text: '#EF6C00', icon: '#FB8C00' },
  '발표': { bg: '#E3F2FD', text: '#1565C0', icon: '#2196F3' },
  '기타': { bg: '#F5F5F5', text: '#616161', icon: '#9E9E9E' },
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(n, max));
}

function pad2(n: number) {
  return n < 10 ? `0${n}` : `${n}`;
}

function dayKey(y: number, m0: number, d: number) {
  // m0: 0-based month
  return `${y}-${pad2(m0 + 1)}-${pad2(d)}`;
}

function daysInMonth(y: number, m0: number) {
  return new Date(y, m0 + 1, 0).getDate();
}

function buildMonthMatrix(y: number, m0: number): (number | null)[] {
  const firstDow = new Date(y, m0, 1).getDay();
  const dim = daysInMonth(y, m0);
  const arr: (number | null)[] = [];
  for (let i = 0; i < firstDow; i++) arr.push(null);
  for (let d = 1; d <= dim; d++) arr.push(d);
  return arr;
}

export default function CalendarAppScreen() {
  const today = useMemo(() => new Date(), []);
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth()); // 0-based
  const [selectedDate, setSelectedDate] = useState(today.getDate());
  const [schedules, setSchedules] = useState<SchedulesByDayKey>({});
  const [loading, setLoading] = useState(false);

  const monthDays = useMemo(
    () => buildMonthMatrix(currentYear, currentMonth),
    [currentYear, currentMonth]
  );

  // 현재 월/년 바뀔 때 selectedDate 유효 범위로 보정
  useEffect(() => {
    const dim = daysInMonth(currentYear, currentMonth);
    setSelectedDate((d) => clamp(d, 1, dim));
  }, [currentYear, currentMonth]);

  const getDateSchedules = useCallback(
    (date: number) => schedules[dayKey(currentYear, currentMonth, date)] || [],
    [schedules, currentYear, currentMonth]
  );

  const hasSchedule = useCallback(
    (date: number) => getDateSchedules(date).length > 0,
    [getDateSchedules]
  );

  const navigateMonth = useCallback((direction: 'prev' | 'next') => {
    setSchedules({}); // 월 이동 시 깔끔히 비우고 새로 불러오기
    setSelectedDate(1); // 월 이동 시 1일로 이동 (원하면 유지해도 됨)
    if (direction === 'prev') {
      setCurrentMonth((m) => (m === 0 ? 11 : m - 1));
      setCurrentYear((y) => (currentMonth === 0 ? y - 1 : y));
    } else {
      setCurrentMonth((m) => (m === 11 ? 0 : m + 1));
      setCurrentYear((y) => (currentMonth === 11 ? y + 1 : y));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentMonth]);

  const colorize = (item: RawSchedule): DaySchedule => {
    const cat = (item.category || '기타').trim();
    const map = categoryColorMap[cat] || { bg: '#EEE', text: '#000', icon: '#000' };
    return { ...item, color: map.bg, textColor: map.text, iconColor: map.icon };
    // iconColor는 현재 UI에서 사용 안하지만 남겨둠
  };

  const fetchSchedulesByMonth = useCallback(async (y: number, m0: number) => {
    // 서버 API는 1-based month를 받음
    const month1 = m0 + 1;
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        setSchedules({});
        return;
      }
      const { data } = await axios.get<RawSchedule[]>(
        `${API_BASE_URL}/api/schedules/month?year=${y}&month=${month1}`,
        { headers: { Authorization: `Bearer ${token}` }, timeout: 15000 }
      );

      // 일자별로 확장/분해 (범위 일정은 모든 날짜에 분배)
      const grouped: SchedulesByDayKey = {};
      for (const raw of data || []) {
        // 문자열 파싱 → Date
        const start = new Date(raw.startDate);
        const end = new Date(raw.endDate);

        // 안전장치: start > end 인 경우 swap
        const s = isNaN(start.getTime()) ? new Date() : start;
        const e = isNaN(end.getTime()) ? s : end;
        const from = s <= e ? s : e;
        const to = s <= e ? e : s;

        const walker = new Date(from.getFullYear(), from.getMonth(), from.getDate());
        const until = new Date(to.getFullYear(), to.getMonth(), to.getDate());

        const colored = colorize(raw);

        while (walker.getTime() <= until.getTime()) {
          const k = dayKey(walker.getFullYear(), walker.getMonth(), walker.getDate());
          if (!grouped[k]) grouped[k] = [];
          grouped[k].push(colored);

          walker.setDate(walker.getDate() + 1);
        }
      }

      setSchedules(grouped);
    } catch (err: any) {
      console.error('월간 일정 불러오기 실패:', err?.message || err);
      Alert.alert('오류', '일정을 불러오는 중 문제가 발생했어요.');
      setSchedules({});
    } finally {
      setLoading(false);
    }
  }, []);

  // 월 변경 시 일정 로드
  useEffect(() => {
    fetchSchedulesByMonth(currentYear, currentMonth);
  }, [currentYear, currentMonth, fetchSchedulesByMonth]);

  return (
    <SafeAreaView style={CommonStyles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F5F5" />
      {/* 헤더 */}
      <View style={CommonStyles.header}>
        <TouchableOpacity style={CommonStyles.backButton} disabled>
          <Ionicons name="chevron-back" size={35} color="#1A346F" />
        </TouchableOpacity>
        <Text style={CommonStyles.headerTitle}>일정</Text>
        <Text style={CommonStyles.headerYear}>{currentYear}년</Text>
      </View>

      {/* 메인 */}
      <View style={CommonStyles.mainContent}>
        {/* 왼쪽 달력 */}
        <View style={CommonStyles.calendarContainer}>
          <View style={CommonStyles.calendarHeader}>
            <TouchableOpacity onPress={() => navigateMonth('prev')}>
              <Ionicons name="chevron-back" size={20} color="#1A346F" />
            </TouchableOpacity>
            <Text style={CommonStyles.monthTitle}>{months[currentMonth]}</Text>
            <TouchableOpacity onPress={() => navigateMonth('next')}>
              <Ionicons name="chevron-forward" size={20} color="#1A346F" />
            </TouchableOpacity>
          </View>

          <View style={CommonStyles.weekDaysContainer}>
            {weekDays.map((day, idx) => (
              <View key={day} style={CommonStyles.weekDayCell}>
                <Text
                  style={[
                    CommonStyles.weekDayText,
                    idx === 0 && CommonStyles.sundayText,
                    idx === 6 && CommonStyles.saturdayText,
                  ]}
                >
                  {day}
                </Text>
              </View>
            ))}
          </View>

          <ScrollView style={CommonStyles.calendarScrollView}>
            <View style={CommonStyles.calendarGrid}>
              {monthDays.map((d, idx) => {
                const isSelected = d === selectedDate;
                const isSunday = idx % 7 === 0;
                const isSaturday = idx % 7 === 6;
                return (
                  <TouchableOpacity
                    key={`${idx}-${d ?? 'x'}`}
                    style={[
                      CommonStyles.dateCell,
                      isSelected && CommonStyles.selectedDateCell,
                    ]}
                    onPress={() => d && setSelectedDate(d)}
                    disabled={!d}
                  >
                    {d && (
                      <View style={CommonStyles.dateCellContent}>
                        <View style={isSelected ? CommonStyles.selectedDateBackground : null}>
                          <Text
                            style={[
                              CommonStyles.dateText,
                              isSelected && CommonStyles.selectedDateText,
                              !isSelected && isSunday && CommonStyles.sundayText,
                              !isSelected && isSaturday && CommonStyles.saturdayText,
                            ]}
                          >
                            {d}
                          </Text>
                        </View>

                        {/* 일정 박스 */}
                        {!!d && hasSchedule(d) && (
                          <View style={CommonStyles.scheduleBoxContainer}>
                            {getDateSchedules(d).slice(0, 3).map((sch, i) => (
                              <View
                                key={`${sch.id}-${i}`}
                                style={[CommonStyles.scheduleBox, { backgroundColor: sch.color }]}
                              >
                                <Text
                                  numberOfLines={1}
                                  style={[CommonStyles.scheduleBoxText, { color: sch.textColor }]}
                                >
                                  {sch.title}
                                </Text>
                              </View>
                            ))}
                            {getDateSchedules(d).length > 3 && (
                              <View style={CommonStyles.moreScheduleBox}>
                                <Text style={CommonStyles.moreScheduleText}>
                                  +{getDateSchedules(d).length - 3}개
                                </Text>
                              </View>
                            )}
                          </View>
                        )}
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </View>

        {/* 오른쪽 일정 상세 리스트 */}
        <View style={CommonStyles.scheduleContainer}>
          <Text style={CommonStyles.scheduleTitle}>
            {currentMonth + 1}월 {selectedDate}일 일정
          </Text>

          <ScrollView style={CommonStyles.scheduleList}>
            {getDateSchedules(selectedDate).map((schedule) => (
              <View
                key={schedule.id}
                style={[CommonStyles.scheduleItem, { backgroundColor: schedule.color }]}
              >
                <View style={CommonStyles.scheduleContent}>
                  <Text style={[CommonStyles.scheduleItemTitle, { color: schedule.textColor }]}>
                    {schedule.title}
                  </Text>
                  <Text style={[CommonStyles.scheduleTime, { color: schedule.textColor }]}>
                    {schedule.startDate} ~ {schedule.endDate}
                  </Text>
                  {!!schedule.description && (
                    <Text style={{ color: schedule.textColor }}>{schedule.description}</Text>
                  )}
                </View>
              </View>
            ))}

            {getDateSchedules(selectedDate).length === 0 && !loading && (
              <View style={CommonStyles.noScheduleContainer}>
                <Text style={CommonStyles.noScheduleText}>일정이 없습니다.</Text>
              </View>
            )}

            {loading && (
              <View style={CommonStyles.noScheduleContainer}>
                <Text style={CommonStyles.noScheduleText}>불러오는 중…</Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
}

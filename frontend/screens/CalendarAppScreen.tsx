import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import 'react-native-url-polyfill/auto';
import { CommonStyles } from '../styles/CommonStyles';

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

  return (
    <SafeAreaView style={CommonStyles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F5F5" />
      {/* 헤더 */}
      <View style={CommonStyles.header}>
        <TouchableOpacity style={CommonStyles.backButton}>
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
            {weekDays.map((day, index) => (
              <View key={index} style={CommonStyles.weekDayCell}>
                <Text style={[
                  CommonStyles.weekDayText,
                  index === 0 && CommonStyles.sundayText,
                  index === 6 && CommonStyles.saturdayText
                ]}>
                  {day}
                </Text>
              </View>
            ))}
          </View>

          <ScrollView style={CommonStyles.calendarScrollView}>
            <View style={CommonStyles.calendarGrid}>
              {days.map((day, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    CommonStyles.dateCell,
                    day === selectedDate && CommonStyles.selectedDateCell
                  ]}
                  onPress={() => day && setSelectedDate(day)}
                  disabled={!day}
                >
                  {day && (
                    <View style={CommonStyles.dateCellContent}>
                      <View style={day === selectedDate ? CommonStyles.selectedDateBackground : null}>
                        <Text style={[
                          CommonStyles.dateText,
                          day === selectedDate && CommonStyles.selectedDateText,
                          index % 7 === 0 && day !== selectedDate && CommonStyles.sundayText,
                          index % 7 === 6 && day !== selectedDate && CommonStyles.saturdayText
                        ]}>
                          {day}
                        </Text>
                      </View>
                      {hasSchedule(day) && (
                        <View style={CommonStyles.scheduleBoxContainer}>
                          {getDateSchedules(day).slice(0, 3).map((schedule, idx) => (
                            <View key={idx} style={[
                              CommonStyles.scheduleBox,
                              { backgroundColor: schedule.color }
                            ]}>
                              <Text style={[
                                CommonStyles.scheduleBoxText,
                                { color: schedule.textColor }
                              ]} numberOfLines={1}>
                                {schedule.title}
                              </Text>
                            </View>
                          ))}
                          {getDateSchedules(day).length > 3 && (
                            <View style={CommonStyles.moreScheduleBox}>
                              <Text style={CommonStyles.moreScheduleText}>
                                +{getDateSchedules(day).length - 3}개
                              </Text>
                            </View>
                          )}
                        </View>
                      )}
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* 오른쪽 일정 */}
        <View style={CommonStyles.scheduleContainer}>
          <Text style={CommonStyles.scheduleTitle}>
            {currentMonth + 1}월 {selectedDate}일 일정
          </Text>
          <ScrollView style={CommonStyles.scheduleList}>
            {getDateSchedules(selectedDate).map((schedule: any) => (
              <View key={schedule.id} style={[
                CommonStyles.scheduleItem,
                { backgroundColor: schedule.color }
              ]}>
                <View style={CommonStyles.scheduleContent}>
                  <Text style={[
                    CommonStyles.scheduleItemTitle,
                    { color: schedule.textColor }
                  ]}>
                    {schedule.title}
                  </Text>
                  <Text style={[
                    CommonStyles.scheduleTime,
                    { color: schedule.textColor }
                  ]}>
                    {schedule.startDate} ~ {schedule.endDate}
                  </Text>
                  {schedule.description && (
                    <Text style={{ color: schedule.textColor }}>
                      {schedule.description}
                    </Text>
                  )}
                </View>
              </View>
            ))}
            {getDateSchedules(selectedDate).length === 0 && (
              <View style={CommonStyles.noScheduleContainer}>
                <Text style={CommonStyles.noScheduleText}>일정이 없습니다.</Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
}

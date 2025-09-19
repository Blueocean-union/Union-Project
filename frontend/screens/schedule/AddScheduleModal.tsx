import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

interface AddScheduleModalProps {
  visible: boolean;
  onClose: () => void;
  selectedDate: Date;
  onScheduleAdded: () => void;
}

const AddScheduleModal: React.FC<AddScheduleModalProps> = ({
  visible,
  onClose,
  selectedDate,
  onScheduleAdded,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('기타');
  const [startDate, setStartDate] = useState(selectedDate);
  const [endDate, setEndDate] = useState(selectedDate);
  const [startTime, setStartTime] = useState(() => {
    const now = new Date();
    now.setMinutes(0, 0, 0);
    return now;
  });
  const [endTime, setEndTime] = useState(() => {
    const now = new Date();
    now.setHours(now.getHours() + 1, 0, 0, 0);
    return now;
  });

  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const categories = ['과제', '시험', '발표', '기타'];

  const categoryColorMap: Record<string, { bg: string, text: string, icon: string }> = {
    '과제': { bg: '#E8F5E8', text: '#2D5D2D', icon: '#4CAF50' },
    '시험': { bg: '#FFF3E0', text: '#EF6C00', icon: '#FB8C00' },
    '발표': { bg: '#E3F2FD', text: '#1565C0', icon: '#2196F3' },
    '기타': { bg: '#F5F5F5', text: '#616161', icon: '#9E9E9E' }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory('기타');
    setStartDate(selectedDate);
    setEndDate(selectedDate);
    const now = new Date();
    now.setMinutes(0, 0, 0);
    setStartTime(now);
    const endTime = new Date();
    endTime.setHours(now.getHours() + 1, 0, 0, 0);
    setEndTime(endTime);
    setShowStartDatePicker(false);
    setShowEndDatePicker(false);
    setShowStartTimePicker(false);
    setShowEndTimePicker(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const formatDate = (date: Date) => {
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
  };

  const formatTime = (time: Date) => {
    return time.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const validateDateTime = () => {
    const startDateTime = new Date(startDate);
    startDateTime.setHours(startTime.getHours(), startTime.getMinutes(), 0, 0);

    const endDateTime = new Date(endDate);
    endDateTime.setHours(endTime.getHours(), endTime.getMinutes(), 0, 0);

    if (startDateTime >= endDateTime) {
      Alert.alert('알림', '종료 시간은 시작 시간보다 늦어야 합니다.');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('알림', '제목을 입력해주세요.');
      return;
    }

    if (!validateDateTime()) {
      return;
    }

    try {
      setIsLoading(true);
      const token = await AsyncStorage.getItem('accessToken');

      const startDateTime = new Date(startDate);
      startDateTime.setHours(startTime.getHours(), startTime.getMinutes(), 0, 0);

      const endDateTime = new Date(endDate);
      endDateTime.setHours(endTime.getHours(), endTime.getMinutes(), 0, 0);

      const scheduleData = {
        title: title.trim(),
        category,
        startDate: startDateTime.toISOString().split('T')[0],
        endDate: endDateTime.toISOString().split('T')[0],
        description: description.trim()
      };

      const response = await axios.post(
        'http://52.78.209.115:8080/api/schedules',
        scheduleData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      Alert.alert('성공', '일정이 추가되었습니다.', [
        {
          text: '확인',
          onPress: () => {
            onScheduleAdded();
            handleClose();
          }
        }
      ]);
    } catch (error) {
      Alert.alert('오류', '일정 추가에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // DateTimePicker 핸들러들
  const onStartDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowStartDatePicker(false);
    }
    if (selectedDate && event.type === 'set') {
      setStartDate(selectedDate);
      if (selectedDate > endDate) {
        setEndDate(selectedDate);
      }
      if (Platform.OS === 'ios') {
        setShowStartDatePicker(false);
      }
    }
  };

  const onEndDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowEndDatePicker(false);
    }
    if (selectedDate && event.type === 'set' && selectedDate >= startDate) {
      setEndDate(selectedDate);
      if (Platform.OS === 'ios') {
        setShowEndDatePicker(false);
      }
    }
  };

  const onStartTimeChange = (event: DateTimePickerEvent, selectedTime?: Date) => {
    if (Platform.OS === 'android') {
      setShowStartTimePicker(false);
    }
    if (selectedTime && event.type === 'set') {
      setStartTime(selectedTime);
      if (startDate.getTime() === endDate.getTime()) {
        const newEndTime = new Date(selectedTime);
        newEndTime.setHours(selectedTime.getHours() + 1);
        if (selectedTime >= endTime) {
          setEndTime(newEndTime);
        }
      }
      if (Platform.OS === 'ios') {
        setShowStartTimePicker(false);
      }
    }
  };

  const onEndTimeChange = (event: DateTimePickerEvent, selectedTime?: Date) => {
    if (Platform.OS === 'android') {
      setShowEndTimePicker(false);
    }
    if (selectedTime && event.type === 'set') {
      setEndTime(selectedTime);
      if (Platform.OS === 'ios') {
        setShowEndTimePicker(false);
      }
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>새 일정</Text>
            <TouchableOpacity
              onPress={handleSave}
              style={[styles.saveButton, isLoading && styles.disabledButton]}
              disabled={isLoading}
            >
              <Text style={styles.saveButtonText}>
                {isLoading ? '저장중...' : '저장'}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.inputSection}>
              <Text style={styles.label}>제목</Text>
              <TextInput
                style={styles.titleInput}
                value={title}
                onChangeText={setTitle}
                placeholder="일정 제목을 입력하세요"
                placeholderTextColor="#999"
                maxLength={50}
              />
            </View>

            <View style={styles.inputSection}>
              <Text style={styles.label}>카테고리</Text>
              <View style={styles.categoryContainer}>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryChip,
                      { backgroundColor: categoryColorMap[cat].bg },
                      category === cat && styles.selectedCategoryChip
                    ]}
                    onPress={() => setCategory(cat)}
                  >
                    <Text
                      style={[
                        styles.categoryText,
                        { color: categoryColorMap[cat].text }
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.dateTimeSection}>
              <Text style={styles.label}>날짜</Text>
              <View style={styles.dateRow}>
                <TouchableOpacity
                  style={[styles.dateButton, showStartDatePicker && styles.activeButton]}
                  onPress={() => setShowStartDatePicker(!showStartDatePicker)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="calendar-outline" size={20} color="#666" />
                  <Text style={styles.dateText}>{formatDate(startDate)}</Text>
                </TouchableOpacity>
                <Text style={styles.dateSeparator}>~</Text>
                <TouchableOpacity
                  style={[styles.dateButton, showEndDatePicker && styles.activeButton]}
                  onPress={() => setShowEndDatePicker(!showEndDatePicker)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="calendar-outline" size={20} color="#666" />
                  <Text style={styles.dateText}>{formatDate(endDate)}</Text>
                </TouchableOpacity>
              </View>

              {/* 인라인 DatePicker 표시 */}
              {showStartDatePicker && (
                <View style={styles.inlinePickerContainer}>
                  <Text style={styles.pickerTitle}>시작 날짜 선택</Text>
                  <DateTimePicker
                    value={startDate}
                    mode="date"
                    display="compact"
                    onChange={onStartDateChange}
                    minimumDate={new Date()}
                    style={styles.inlinePicker}
                  />
                </View>
              )}

              {showEndDatePicker && (
                <View style={styles.inlinePickerContainer}>
                  <Text style={styles.pickerTitle}>종료 날짜 선택</Text>
                  <DateTimePicker
                    value={endDate}
                    mode="date"
                    display="compact"
                    onChange={onEndDateChange}
                    minimumDate={startDate}
                    style={styles.inlinePicker}
                  />
                </View>
              )}
            </View>

            <View style={styles.dateTimeSection}>
              <Text style={styles.label}>시간</Text>
              <View style={styles.dateRow}>
                <TouchableOpacity
                  style={[styles.timeButton, showStartTimePicker && styles.activeButton]}
                  onPress={() => setShowStartTimePicker(!showStartTimePicker)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="time-outline" size={20} color="#666" />
                  <Text style={styles.timeText}>{formatTime(startTime)}</Text>
                </TouchableOpacity>
                <Text style={styles.timeSeparator}>~</Text>
                <TouchableOpacity
                  style={[styles.timeButton, showEndTimePicker && styles.activeButton]}
                  onPress={() => setShowEndTimePicker(!showEndTimePicker)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="time-outline" size={20} color="#666" />
                  <Text style={styles.timeText}>{formatTime(endTime)}</Text>
                </TouchableOpacity>
              </View>

              {/* 인라인 TimePicker 표시 */}
              {showStartTimePicker && (
                <View style={styles.inlinePickerContainer}>
                  <Text style={styles.pickerTitle}>시작 시간 선택</Text>
                  <DateTimePicker
                    value={startTime}
                    mode="time"
                    display="compact"
                    onChange={onStartTimeChange}
                    style={styles.inlinePicker}
                  />
                </View>
              )}

              {showEndTimePicker && (
                <View style={styles.inlinePickerContainer}>
                  <Text style={styles.pickerTitle}>종료 시간 선택</Text>
                  <DateTimePicker
                    value={endTime}
                    mode="time"
                    display="compact"
                    onChange={onEndTimeChange}
                    style={styles.inlinePicker}
                  />
                </View>
              )}
            </View>

            <View style={styles.inputSection}>
              <Text style={styles.label}>설명 (선택사항)</Text>
              <TextInput
                style={styles.descriptionInput}
                value={description}
                onChangeText={setDescription}
                placeholder="일정에 대한 자세한 설명을 입력하세요"
                placeholderTextColor="#999"
                multiline
                numberOfLines={4}
                maxLength={200}
                textAlignVertical="top"
              />
              <Text style={styles.characterCount}>{description.length}/200</Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  closeButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  saveButton: {
    backgroundColor: '#3F4E7C',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    padding: 20,
  },
  inputSection: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  titleInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#FAFAFA',
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedCategoryChip: {
    borderColor: '#3F4E7C',
    borderWidth: 2,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
  },
  dateTimeSection: {
    marginBottom: 24,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    backgroundColor: '#FAFAFA',
    gap: 8,
  },
  timeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    backgroundColor: '#FAFAFA',
    gap: 8,
  },
  activeButton: {
    borderColor: '#3F4E7C',
    backgroundColor: '#F8F9FF',
  },
  dateSeparator: {
    marginHorizontal: 12,
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  timeSeparator: {
    marginHorizontal: 12,
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  dateText: {
    fontSize: 14,
    color: '#333',
  },
  timeText: {
    fontSize: 14,
    color: '#333',
  },
  descriptionInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#FAFAFA',
    minHeight: 100,
  },
  characterCount: {
    textAlign: 'right',
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  inlinePickerContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#F8F9FF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E3E8FF',
  },
  pickerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3F4E7C',
    marginBottom: 8,
    textAlign: 'center',
  },
  inlinePicker: {
    alignSelf: 'center',
  },
});

export default AddScheduleModal;
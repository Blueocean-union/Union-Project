import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

interface TemporaryAudioProps {
  visible: boolean;
  onClose: () => void;
  subjectColor: string;
}

export default function TemporaryAudio({ visible, onClose, subjectColor }: TemporaryAudioProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // 타이머 시작
  const startTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    intervalRef.current = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
  };

  // 타이머 정지
  const stopTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // 녹음 시작
  const startRecording = () => {
    setIsRecording(true);
    setIsPaused(false);
    setRecordingTime(0);
    startTimer();
    
    // 펄스 애니메이션 시작
    const pulse = () => {
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start(() => {
        if (isRecording && !isPaused) {
          pulse();
        }
      });
    };
    pulse();
  };

  // 녹음 일시정지/재개
  const togglePause = () => {
    if (isPaused) {
      setIsPaused(false);
      startTimer();
    } else {
      setIsPaused(true);
      stopTimer();
    }
  };

  // 녹음 취소/저장
  const cancelRecording = () => {
    setIsRecording(false);
    setIsPaused(false);
    setRecordingTime(0);
    stopTimer();
    onClose();
  };

  // 시간 포맷팅 (분:초)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <SafeAreaView style={styles.container}>
          {/* 헤더 */}
          <View style={[styles.header, { backgroundColor: subjectColor }]}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
            >
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>음성녹음</Text>
            <View style={styles.headerRight} />
          </View>

          {/* 메인 컨텐츠 */}
          <View style={styles.content}>
            {/* 마이크 아이콘과 타이머 */}
            <View style={styles.recordingArea}>
              <Animated.View
                style={[
                  styles.micContainer,
                  {
                    transform: [{ scale: pulseAnim }],
                    backgroundColor: isRecording ? (isPaused ? '#FF9800' : '#F44336') : '#E0E0E0',
                  }
                ]}
              >
                <Ionicons 
                  name="mic" 
                  size={48} 
                  color={isRecording ? 'white' : '#666'} 
                />
              </Animated.View>
              
              <Text style={styles.timerText}>
                {formatTime(recordingTime)}
              </Text>
              
              <Text style={styles.statusText}>
                {!isRecording ? '녹음을 시작하세요' : 
                 isPaused ? '일시정지됨' : '녹음 중...'}
              </Text>
            </View>

            {/* 컨트롤 버튼들 */}
            <View style={styles.controls}>
              {!isRecording ? (
                // 녹음 시작 버튼
                <TouchableOpacity
                  style={[styles.controlButton, styles.startButton, { backgroundColor: subjectColor }]}
                  onPress={startRecording}
                >
                  <Ionicons name="mic" size={24} color="white" />
                  <Text style={styles.controlButtonText}>녹음 시작</Text>
                </TouchableOpacity>
              ) : (
                // 녹음 중 컨트롤 버튼들
                <>
                  <TouchableOpacity
                    style={[styles.controlButton, styles.cancelButton]}
                    onPress={cancelRecording}
                  >
                    <Ionicons name="close" size={24} color="white" />
                    <Text style={styles.controlButtonText}>취소</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.controlButton, styles.pauseButton, { backgroundColor: isPaused ? '#4CAF50' : '#FF9800' }]}
                    onPress={togglePause}
                  >
                    <Ionicons 
                      name={isPaused ? "play" : "pause"} 
                      size={24} 
                      color="white" 
                    />
                    <Text style={styles.controlButtonText}>
                      {isPaused ? '재개' : '일시정지'}
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.controlButton, styles.saveButton, { backgroundColor: subjectColor }]}
                    onPress={cancelRecording}
                  >
                    <Ionicons name="checkmark" size={24} color="white" />
                    <Text style={styles.controlButtonText}>저장</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  closeButton: {
    marginRight: 12,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  headerRight: {
    width: 36,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  recordingArea: {
    alignItems: 'center',
    marginBottom: 60,
  },
  micContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  timerText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    fontFamily: 'monospace',
  },
  statusText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  controlButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    minWidth: 80,
  },
  startButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  cancelButton: {
    backgroundColor: '#F44336',
  },
  pauseButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  saveButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  controlButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
});

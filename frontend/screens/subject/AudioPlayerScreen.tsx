import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../libs/api/axios';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { SubjectStackParamList } from '../MainTabs';

interface FileItem {
  id: number;
  folderId: number;
  originalFileName: string;
  contentType: string;
  size: number;
  updatedAt: string;
  deleted: boolean;
}

type Props = NativeStackScreenProps<SubjectStackParamList, 'AudioPlayerScreen'>;

interface TranscriptionResult {
  id: number;
  rid: string;
  status: 'REQUESTED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  transcript: string;
  jsonFileName: string;
  message: string;
  createdAt: string;
}

export default function AudioPlayerScreen({ route, navigation }: Props) {
  const { file, fileUri, subjectColor } = route.params;
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptionResult, setTranscriptionResult] = useState<TranscriptionResult | null>(null);
  const [showTranscription, setShowTranscription] = useState(false);
  const [transcriptionPdf, setTranscriptionPdf] = useState<string | null>(null);

  // 오디오 로드
  const loadAudio = async () => {
    try {
      if (sound) {
        await sound.unloadAsync();
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: fileUri },
        { shouldPlay: false }
      );
      
      setSound(newSound);
      setDuration((newSound as any).durationMillis || 0);

      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded) {
          setPosition(status.positionMillis || 0);
          setIsPlaying(status.isPlaying || false);
          
          if (status.didJustFinish) {
            setIsPlaying(false);
            setPosition(0);
          }
        }
      });
    } catch (error) {
      console.error('오디오 로드 실패:', error);
      Alert.alert('오류', '오디오를 불러올 수 없습니다.');
    }
  };

  // 재생/일시정지
  const togglePlayPause = async () => {
    if (!sound) return;

    try {
      if (isPlaying) {
        await sound.pauseAsync();
      } else {
        await sound.playAsync();
      }
    } catch (error) {
      console.error('재생 제어 실패:', error);
    }
  };

  // 위치 이동
  const seekTo = async (position: number) => {
    if (!sound) return;

    try {
      await sound.setPositionAsync(position);
    } catch (error) {
      console.error('위치 이동 실패:', error);
    }
  };

  // AI 전사 요청
  const requestTranscription = async () => {
    try {
      setIsTranscribing(true);
      
      // FormData로 오디오 파일 전송
      const formData = new FormData();
      formData.append('file', {
        uri: fileUri,
        type: file.contentType || 'audio/mpeg',
        name: file.originalFileName,
      } as any);

      const response = await api.post('/api/ai/audio/request', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const { rid } = response.data;
      
      // 폴링으로 전사 결과 확인
      pollTranscriptionResult(rid);
    } catch (error) {
      console.error('전사 요청 실패:', error);
      Alert.alert('오류', '음성 전사 요청에 실패했습니다.');
      setIsTranscribing(false);
    }
  };

  // 전사 결과 폴링
  const pollTranscriptionResult = async (rid: string) => {
    const maxAttempts = 30; // 최대 5분 (10초 * 30)
    let attempts = 0;

    const poll = async () => {
      try {
        const response = await api.get(`/api/ai/audio/result/${rid}`);
        const result = response.data;
        
        setTranscriptionResult(result);

        if (result.status === 'COMPLETED') {
          setIsTranscribing(false);
          Alert.alert('완료', '음성 전사가 완료되었습니다.');
        } else if (result.status === 'FAILED') {
          setIsTranscribing(false);
          Alert.alert('오류', '음성 전사에 실패했습니다.');
        } else if (attempts < maxAttempts) {
          // 10초 후 다시 시도
          setTimeout(poll, 10000);
          attempts++;
        } else {
          setIsTranscribing(false);
          Alert.alert('시간 초과', '음성 전사 시간이 초과되었습니다.');
        }
      } catch (error) {
        console.error('전사 결과 확인 실패:', error);
        setIsTranscribing(false);
        Alert.alert('오류', '전사 결과를 확인할 수 없습니다.');
      }
    };

    poll();
  };

  // 전사 결과를 PDF로 변환
  const convertToPdf = async () => {
    if (!transcriptionResult?.transcript) return;

    try {
      // 간단한 PDF 생성 (실제로는 더 복잡한 PDF 라이브러리 사용)
      const pdfContent = `
        <html>
          <head>
            <meta charset="utf-8">
            <title>${file.originalFileName} - 전사 결과</title>
          </head>
          <body>
            <h1>음성 전사 결과</h1>
            <p><strong>파일명:</strong> ${file.originalFileName}</p>
            <p><strong>전사 시간:</strong> ${new Date(transcriptionResult.createdAt).toLocaleString()}</p>
            <hr>
            <div style="white-space: pre-wrap; line-height: 1.6;">
              ${transcriptionResult.transcript}
            </div>
          </body>
        </html>
      `;

      // PDF 생성 로직 (실제 구현에서는 react-native-html-to-pdf 등 사용)
      setTranscriptionPdf(pdfContent);
      setShowTranscription(true);
    } catch (error) {
      console.error('PDF 변환 실패:', error);
      Alert.alert('오류', 'PDF 변환에 실패했습니다.');
    }
  };

  // 시간 포맷팅
  const formatTime = (millis: number) => {
    const minutes = Math.floor(millis / 60000);
    const seconds = Math.floor((millis % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // 진행률 계산
  const progress = duration > 0 ? position / duration : 0;

  useEffect(() => {
    loadAudio();
    
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [fileUri]);

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={[styles.header, { backgroundColor: subjectColor }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {file.originalFileName}
        </Text>
        <TouchableOpacity style={styles.menuButton}>
          <Ionicons name="ellipsis-vertical" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* 플레이어 컨트롤 */}
      <View style={styles.playerContainer}>
        <View style={styles.audioInfo}>
          <Ionicons name="musical-notes" size={48} color={subjectColor} />
          <Text style={styles.fileName}>{file.originalFileName}</Text>
          <Text style={styles.fileMeta}>
            {new Date(file.updatedAt).toLocaleDateString()} • {file.contentType}
          </Text>
        </View>

        {/* 진행률 바 */}
        <View style={styles.progressContainer}>
          <Text style={styles.timeText}>{formatTime(position)}</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
            <TouchableOpacity
              style={[styles.progressThumb, { left: `${progress * 100}%` }]}
              onPress={() => {}} // 실제로는 드래그로 위치 변경
            />
          </View>
          <Text style={styles.timeText}>{formatTime(duration)}</Text>
        </View>

        {/* 컨트롤 버튼 */}
        <View style={styles.controls}>
          <TouchableOpacity style={styles.controlButton}>
            <Ionicons name="play-skip-back" size={24} color="#666" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.playButton} onPress={togglePlayPause}>
            <Ionicons 
              name={isPlaying ? "pause" : "play"} 
              size={32} 
              color="white" 
            />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.controlButton}>
            <Ionicons name="play-skip-forward" size={24} color="#666" />
          </TouchableOpacity>
        </View>
      </View>

      {/* AI 전사 섹션 */}
      <View style={styles.transcriptionSection}>
        <Text style={styles.sectionTitle}>AI 음성 전사</Text>
        
        {!transcriptionResult ? (
          <TouchableOpacity
            style={[styles.transcribeButton, { backgroundColor: subjectColor }]}
            onPress={requestTranscription}
            disabled={isTranscribing}
          >
            {isTranscribing ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Ionicons name="mic" size={20} color="white" />
            )}
            <Text style={styles.transcribeButtonText}>
              {isTranscribing ? '전사 중...' : '음성 전사 시작'}
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.transcriptionResult}>
            <View style={styles.statusContainer}>
              <Ionicons 
                name={transcriptionResult.status === 'COMPLETED' ? 'checkmark-circle' : 'time'} 
                size={20} 
                color={transcriptionResult.status === 'COMPLETED' ? '#4CAF50' : '#FF9800'} 
              />
              <Text style={styles.statusText}>
                {transcriptionResult.status === 'COMPLETED' ? '전사 완료' : '전사 중...'}
              </Text>
            </View>
            
            {transcriptionResult.status === 'COMPLETED' && transcriptionResult.transcript && (
              <View style={styles.transcriptContainer}>
                <Text style={styles.transcriptText} numberOfLines={3}>
                  {transcriptionResult.transcript}
                </Text>
                <TouchableOpacity
                  style={[styles.pdfButton, { backgroundColor: subjectColor }]}
                  onPress={convertToPdf}
                >
                  <Ionicons name="document-text" size={20} color="white" />
                  <Text style={styles.pdfButtonText}>PDF로 변환</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </View>

      {/* 전사 결과 PDF 모달 */}
      <Modal
        visible={showTranscription}
        animationType="slide"
        onRequestClose={() => setShowTranscription(false)}
      >
        <View style={styles.pdfModal}>
          <View style={styles.pdfHeader}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowTranscription(false)}
            >
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.pdfTitle}>전사 결과</Text>
          </View>
          <ScrollView style={styles.pdfContent}>
            <Text style={styles.pdfText}>{transcriptionPdf}</Text>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 12,
    paddingHorizontal: 16,
  },
  backButton: {
    marginRight: 12,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  menuButton: {
    marginLeft: 12,
  },
  playerContainer: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  audioInfo: {
    alignItems: 'center',
    marginBottom: 20,
  },
  fileName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 12,
    textAlign: 'center',
  },
  fileMeta: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  timeText: {
    fontSize: 12,
    color: '#666',
    minWidth: 40,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    marginHorizontal: 12,
    position: 'relative',
  },
  progressFill: {
    height: 4,
    backgroundColor: '#007AFF',
    borderRadius: 2,
  },
  progressThumb: {
    position: 'absolute',
    top: -6,
    width: 16,
    height: 16,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
  },
  transcriptionSection: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  transcribeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  transcribeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  transcriptionResult: {
    marginTop: 16,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
  },
  transcriptContainer: {
    marginTop: 12,
  },
  transcriptText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  pdfButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
  },
  pdfButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  pdfModal: {
    flex: 1,
    backgroundColor: '#000',
  },
  pdfHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  closeButton: {
    marginRight: 12,
  },
  pdfTitle: {
    flex: 1,
    fontSize: 16,
    color: 'white',
    fontWeight: '500',
  },
  pdfContent: {
    flex: 1,
    padding: 16,
  },
  pdfText: {
    color: 'white',
    fontSize: 14,
    lineHeight: 20,
  },
});

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
  Dimensions,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../libs/api/axios';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { SubjectStackParamList } from './SubjectStack';
import AudioPlayerOverlay from './AudioPlayerOverlay';

interface FileItem {
  id: number;
  originalFileName: string;
  storedFileName: string;
  fileType: string;
  filePath: string;
  uploadedAt: string;
}

interface SubjectFileStorageProps {
  subjectId: number;
  folderId: number;
  subjectColor: string;
}

export default function SubjectFileStorage({ 
  subjectId,
  folderId,
  subjectColor
}: SubjectFileStorageProps) {
  const navigation = useNavigation<NativeStackNavigationProp<SubjectStackParamList>>();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [showFileActions, setShowFileActions] = useState(false);
  const [editingFileName, setEditingFileName] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [audioPlayerFile, setAudioPlayerFile] = useState<FileItem | null>(null);
  const [audioPlayerUri, setAudioPlayerUri] = useState<string>('');

  // 파일 목록 조회
  const fetchFiles = async () => {
    try {
      setLoading(true);
      console.log('🔄 파일 목록 조회 시작, folderId:', folderId);
      
      // 토큰 확인
      const token = await AsyncStorage.getItem('accessToken');
      console.log('🔑 토큰 상태:', token ? '존재함' : '없음');
      
      const response = await api.get(`/api/files/folder/${folderId}`);
      console.log('📡 파일 목록 API 응답:', response.data);
      setFiles(response.data);
    } catch (error: any) {
      console.error('❌ 파일 목록 조회 실패:', error);
      console.error('❌ 에러 상세:', error.response?.data || error.message);
      Alert.alert('오류', '파일 목록을 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 파일 업로드
  const uploadFile = async () => {
    try {
      console.log('🔄 파일 업로드 시작');
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'audio/*', 'video/*'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const file = result.assets[0];
        console.log('📁 선택된 파일:', file.name, file.mimeType);
        setUploading(true);

        // 토큰 확인
        const token = await AsyncStorage.getItem('accessToken');
        console.log('🔑 토큰 상태:', token ? '존재함' : '없음');

        const formData = new FormData();
        formData.append('file', {
          uri: file.uri,
          type: file.mimeType || 'application/octet-stream',
          name: file.name,
        } as any);
        formData.append('folderId', folderId.toString());

        console.log('📤 FormData 생성 완료, 업로드 시작...');
        
        // fetch API 사용 (multipart 요청에 더 안정적)
        const response = await fetch('http://52.78.209.115:8080/api/files', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            // Content-Type은 설정하지 않음 (브라우저가 자동으로 boundary 설정)
          },
          body: formData,
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const responseData = await response.json();

        console.log('📡 업로드 API 응답:', responseData);
        if (responseData) {
          Alert.alert('성공', '파일이 업로드되었습니다.');
          fetchFiles(); // 파일 목록 새로고침
        }
      }
    } catch (error: any) {
      console.error('❌ 파일 업로드 실패:', error);
      console.error('❌ 에러 상세:', error.response?.data || error.message);
      Alert.alert('오류', '파일 업로드에 실패했습니다.');
    } finally {
      setUploading(false);
    }
  };

  // 파일 다운로드 및 열기
  const openFile = async (file: FileItem) => {
    try {
      setLoading(true);
      
      // 로컬 캐시 확인
      const localPath = `${FileSystem.cacheDirectory}${file.storedFileName}`;
      const fileExists = await FileSystem.getInfoAsync(localPath);
      
      let fileUri = localPath;
      
      // 로컬에 없으면 다운로드
      if (!fileExists.exists) {
        const downloadUrl = `http://52.78.209.115:8080/api/files/${file.id}/download`;
        const downloadResult = await FileSystem.downloadAsync(downloadUrl, localPath);
        fileUri = downloadResult.uri;
      }

      // 파일 타입에 따라 다른 화면으로 이동
      if (file.fileType === '.pdf') {
        // PDF 뷰어 화면으로 이동
        navigation.navigate('PdfViewerScreen', {
          file: file,
          fileUri: fileUri,
          subjectColor: subjectColor
        });
      } else if (file.fileType === '.mp3' || file.fileType === '.wav' || file.fileType === '.m4a' || file.fileType === '.mp4') {
        // 음성/비디오 플레이어 화면으로 이동
        navigation.navigate('AudioPlayerScreen', {
          file: file,
          fileUri: fileUri,
          subjectColor: subjectColor
        });
      } else {
        // 기타 파일은 공유
        await Sharing.shareAsync(fileUri);
      }
    } catch (error: any) {
      console.error('파일 열기 실패:', error);
      Alert.alert('오류', '파일을 열 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 오디오 재생
  const playAudio = async (fileUri: string) => {
    try {
      if (sound) {
        await sound.unloadAsync();
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: fileUri },
        { shouldPlay: true }
      );
      
      setSound(newSound);
      setIsPlaying(true);

      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setIsPlaying(false);
        }
      });
    } catch (error: any) {
      console.error('오디오 재생 실패:', error);
      Alert.alert('오류', '오디오를 재생할 수 없습니다.');
    }
  };

  // 오디오 정지
  const stopAudio = async () => {
    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
      setSound(null);
      setIsPlaying(false);
    }
  };

  // 파일 삭제
  const deleteFile = async (fileId: number) => {
    Alert.alert(
      '파일 삭제',
      '정말로 이 파일을 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/api/files/${fileId}`);
              Alert.alert('성공', '파일이 삭제되었습니다.');
              fetchFiles();
            } catch (error: any) {
              console.error('파일 삭제 실패:', error);
              Alert.alert('오류', '파일 삭제에 실패했습니다.');
            }
          },
        },
      ]
    );
  };

  // 파일 아이콘 결정
  const getFileIcon = (fileType: string) => {
    if (fileType === '.pdf') return 'document-text';
    if (fileType === '.mp3' || fileType === '.wav' || fileType === '.m4a' || fileType === '.mp4') return 'mic';
    return 'document';
  };

  // 파일 타입 검증
  const isValidFileType = (fileType: string) => {
    return fileType === '.pdf' || fileType === '.mp3' || fileType === '.wav' || fileType === '.m4a' || fileType === '.mp4';
  };

  // 파일 크기 포맷팅
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 파일 액션 모달 열기
  const openFileActions = (file: FileItem) => {
    setSelectedFile(file);
    setNewFileName(file.originalFileName);
    setShowFileActions(true);
  };

  // 파일 이름 수정
  const updateFileName = async () => {
    if (!selectedFile || !newFileName.trim()) return;

    try {
      // API 호출로 파일 이름 수정 (실제 구현 필요)
      // await api.put(`/api/files/${selectedFile.id}`, { originalFileName: newFileName });
      
      // 임시로 로컬 상태 업데이트
      setFiles(files.map(file => 
        file.id === selectedFile.id 
          ? { ...file, originalFileName: newFileName }
          : file
      ));
      
      setEditingFileName(false);
      setShowFileActions(false);
      Alert.alert('성공', '파일 이름이 수정되었습니다.');
    } catch (error: any) {
      console.error('파일 이름 수정 실패:', error);
      Alert.alert('오류', '파일 이름 수정에 실패했습니다.');
    }
  };

  // 파일 터치 핸들러
  const handleFileTouch = async (file: FileItem) => {
    console.log(`[${file.originalFileName}] 터치됨`);
    
    if (!isValidFileType(file.fileType)) {
      Alert.alert('알림', 'PDF 파일이나 MP4 파일을 넣어주세요.');
      return;
    }

    // 파일 타입에 따라 적절한 화면으로 이동
    if (file.fileType === '.pdf') {
      // PDF 파일은 SubjectStack 내에서 처리
      openFile(file);
    } else if (file.fileType === '.mp3' || file.fileType === '.wav' || file.fileType === '.m4a' || file.fileType === '.mp4') {
      // 오디오/비디오 파일은 오버레이로 처리
      try {
        setLoading(true);
        
        // 로컬 캐시 확인
        const localPath = `${FileSystem.cacheDirectory}${file.storedFileName}`;
        const fileExists = await FileSystem.getInfoAsync(localPath);
        
        let fileUri = localPath;
        
        // 로컬에 없으면 다운로드
        if (!fileExists.exists) {
          const downloadUrl = `http://52.78.209.115:8080/api/files/${file.id}/download`;
          const downloadResult = await FileSystem.downloadAsync(downloadUrl, localPath);
          fileUri = downloadResult.uri;
        }

        setAudioPlayerFile(file);
        setAudioPlayerUri(fileUri);
      } catch (error: any) {
        console.error('오디오 파일 로드 실패:', error);
        Alert.alert('오류', '오디오 파일을 불러올 수 없습니다.');
      } finally {
        setLoading(false);
      }
    }
  };

  // 오디오 플레이어 닫기
  const closeAudioPlayer = () => {
    setAudioPlayerFile(null);
    setAudioPlayerUri('');
  };

  useEffect(() => {
    fetchFiles();
    
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [folderId]);

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Ionicons name="document-text" size={20} color={subjectColor} />
        <Text style={[styles.sectionTitle, { color: subjectColor }]}>자료</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={uploadFile}
          disabled={uploading}
        >
          {uploading ? (
            <ActivityIndicator size="small" color={subjectColor} />
          ) : (
            <Ionicons name="add" size={20} color={subjectColor} />
          )}
        </TouchableOpacity>
      </View>

      {/* 파일 목록 */}
      <ScrollView style={styles.fileList}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={subjectColor} />
            <Text style={styles.loadingText}>파일을 불러오는 중...</Text>
          </View>
        ) : files.length > 0 ? (
          files.map((file) => (
            <TouchableOpacity
              key={file.id}
              style={styles.fileItem}
              onPress={() => handleFileTouch(file)}
            >
              <View style={styles.fileInfo}>
                <Ionicons 
                  name={getFileIcon(file.fileType)} 
                  size={24} 
                  color={subjectColor} 
                />
                <Text style={styles.fileName} numberOfLines={1}>
                  {file.originalFileName}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.moreButton}
                onPress={() => openFileActions(file)}
              >
                <Ionicons name="ellipsis-horizontal" size={20} color="#ccc" />
              </TouchableOpacity>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="document-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>업로드된 파일이 없습니다</Text>
            <Text style={styles.emptySubText}>+ 버튼을 눌러 파일을 추가하세요</Text>
          </View>
        )}
      </ScrollView>

      {/* 파일 액션 모달 */}
      <Modal
        visible={showFileActions}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowFileActions(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>파일 액션</Text>
            
            {editingFileName ? (
              <View style={styles.editContainer}>
                <Text style={styles.editLabel}>파일 이름:</Text>
                <TextInput
                  style={styles.editInput}
                  value={newFileName}
                  onChangeText={setNewFileName}
                  placeholder="파일 이름을 입력하세요"
                />
                <View style={styles.editButtons}>
                  <TouchableOpacity
                    style={[styles.editButton, styles.cancelButton]}
                    onPress={() => setEditingFileName(false)}
                  >
                    <Text style={styles.cancelButtonText}>취소</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.editButton, styles.saveButton]}
                    onPress={updateFileName}
                  >
                    <Text style={styles.saveButtonText}>저장</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.actionContainer}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => setEditingFileName(true)}
                >
                  <Ionicons name="create-outline" size={20} color="#333" />
                  <Text style={styles.actionText}>파일 이름 수정하기</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => {
                    setShowFileActions(false);
                    if (selectedFile) {
                      deleteFile(selectedFile.id);
                    }
                  }}
                >
                  <Ionicons name="trash-outline" size={20} color="#ff4444" />
                  <Text style={[styles.actionText, { color: '#ff4444' }]}>
                    {selectedFile?.originalFileName} 삭제하기
                  </Text>
                </TouchableOpacity>
              </View>
            )}
            
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowFileActions(false)}
            >
              <Text style={styles.closeButtonText}>닫기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 오디오 플레이어 오버레이 */}
      {audioPlayerFile && audioPlayerUri && (
        <AudioPlayerOverlay
          file={audioPlayerFile}
          fileUri={audioPlayerUri}
          subjectColor={subjectColor}
          onClose={closeAudioPlayer}
        />
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
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
  fileList: {
    flex: 1,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  fileName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginLeft: 12,
    flex: 1,
  },
  moreButton: {
    padding: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 12,
  },
  emptySubText: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 4,
  },
  // 모달 스타일
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    maxWidth: 300,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  actionContainer: {
    marginBottom: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  actionText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  editContainer: {
    marginBottom: 20,
  },
  editLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  editInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    marginBottom: 16,
  },
  editButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  editButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    flex: 1,
    marginHorizontal: 4,
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  cancelButtonText: {
    color: '#333',
    textAlign: 'center',
    fontWeight: '500',
  },
  saveButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '500',
  },
  closeButton: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
});

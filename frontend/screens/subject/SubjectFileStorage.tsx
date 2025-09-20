import React, { useState, useEffect, useCallback } from 'react';
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
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { useAudioPlayer } from 'expo-audio';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../libs/api/axios';
import { Buffer } from 'buffer';
import AudioPlayerOverlay from './AudioPlayerOverlay';

interface FileItem {
  id: number;
  folderId: number;
  originalFileName: string;
  contentType: string;
  size: number;
  updatedAt: string;
  deleted: boolean;
}

interface SubjectFileStorageProps {
  subjectId: number;
  folderId: number;
  subjectColor: string;
  navigation: any;
}

export default function SubjectFileStorage({ 
  subjectId,
  folderId,
  subjectColor,
  navigation
}: SubjectFileStorageProps) {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [showFileActions, setShowFileActions] = useState(false);
  const [editingFileName, setEditingFileName] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [audioPlayerFile, setAudioPlayerFile] = useState<FileItem | null>(null);
  const [audioPlayerUri, setAudioPlayerUri] = useState<string>('');

  // 프록시 다운로드 함수 (axios + arraybuffer)
  const proxyDownloadToCache = async (fileId: number, localPath: string, contentType: string = 'application/pdf') => {
    try {
      
      // 1) 프록시에서 바이너리 수신
      const res = await api.get(`/api/files/${fileId}/download`, {
        responseType: 'arraybuffer',
        headers: {
          Accept: contentType,
        },
      });


      // 2) Base64로 변환 후 파일로 저장
      const base64 = Buffer.from(res.data).toString('base64');
      await FileSystem.writeAsStringAsync(localPath, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // 3) 파일 존재 확인
      const info = await FileSystem.getInfoAsync(localPath);
      if (!info.exists) {
        throw new Error('프록시 저장 실패: 파일이 생성되지 않음');
      }

      console.log('✅ 프록시 다운로드 완료:', localPath);
      return localPath;
    } catch (error) {
      console.error('❌ 프록시 다운로드 실패:', error);
      throw error;
    }
  };

  // 파일 목록 조회 (메모이제이션)
  const fetchFiles = useCallback(async () => {
    try {
      setLoading(true);
      console.log('🔄 파일 목록 조회 시작, folderId:', folderId);
      console.log('📁 SubjectFileStorage - subjectId:', subjectId);
      
      // 토큰 확인
      const token = await AsyncStorage.getItem('accessToken');
      console.log('🔑 토큰 상태:', token ? '존재함' : '없음');
      
      const response = await api.get(`/api/files/folder/${folderId}`);
      console.log('📡 파일 목록 API 응답:', response.data);
      console.log('📡 응답 상태:', response.status);
      
      // API 응답이 items 배열 구조인 경우 처리
      const filesData = response.data.items || response.data;
      
      // 삭제된 파일 필터링 (deleted: true인 파일 제외)
      const activeFiles = filesData.filter((file: FileItem) => !file.deleted);
      // console.log('📁 활성 파일 목록:', activeFiles);
      
      setFiles(activeFiles);
    } catch (error: any) {
      console.error('❌ 파일 목록 조회 실패:', error);
      // console.error('❌ 에러 상세:', error.response?.data || error.message);
      
      if (error.response?.status === 401) {
        Alert.alert('권한 오류', '이 폴더에 접근할 권한이 없습니다. 폴더 ID를 확인해주세요.');
      } else {
        Alert.alert('오류', '파일 목록을 불러올 수 없습니다.');
      }
    } finally {
      setLoading(false);
    }
  }, [folderId]); // folderId가 변경될 때만 재생성

  // 파일 업로드 (Presigned URL 방식) - 메모이제이션
  const uploadFile = useCallback(async () => {
    try {
      console.log('🔄 파일 업로드 시작');
      console.log('📁 사용 중인 폴더 ID:', folderId);
      
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

        // 1단계: Presigned URL 발급
        console.log('📤 1단계: Presigned URL 발급 중...');
        
        // 파일 크기 가져오기 (모바일 환경)
        const fileInfo = await FileSystem.getInfoAsync(file.uri);
        const fileSize = (fileInfo as any).size || 0;
        
        const presignResponse = await fetch('http://52.78.209.115:8080/api/files/presign', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            folderId: folderId,
            originalName: file.name,
            contentType: file.mimeType || 'application/octet-stream',
            size: fileSize
          }),
        });

        if (!presignResponse.ok) {
          if (presignResponse.status === 401) {
            throw new Error(`권한 오류: 이 폴더에 파일을 업로드할 권한이 없습니다. (폴더 ID: ${folderId})`);
          }
          throw new Error(`Presigned URL 발급 실패: ${presignResponse.status}`);
        }

        const presignData = await presignResponse.json();
        console.log('📡 Presigned URL 응답:', presignData);

        // 2단계: 파일 업로드 (모바일 환경)
        console.log('📤 2단계: 파일 업로드 중...');
        
        // 모바일 환경: Presigned URL로 직접 업로드
        const base64 = await FileSystem.readAsStringAsync(file.uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        // Base64를 Uint8Array로 변환
        const byteCharacters = atob(base64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const fileData = new Uint8Array(byteNumbers);
        
        const uploadResponse = await fetch(presignData.url, {
          method: 'PUT',
          headers: {
            'Content-Type': file.mimeType || 'application/octet-stream',
          },
          body: fileData,
        });

        if (!uploadResponse.ok) {
          throw new Error(`파일 업로드 실패: ${uploadResponse.status}`);
        }

        console.log('📡 파일 업로드 완료');

        // 3단계: 업로드 확정
        console.log('📤 3단계: 업로드 확정 중...');
        console.log('📡 Presigned URL 응답 데이터:', presignData);
        
        const confirmResponse = await fetch('http://52.78.209.115:8080/api/files/confirm', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            folderId: folderId,
            objectKey: presignData.objectKey,
            originalFileName: file.name,
            contentType: file.mimeType || 'application/octet-stream',
            size: fileSize
          }),
        });

        if (!confirmResponse.ok) {
          throw new Error(`업로드 확정 실패: ${confirmResponse.status}`);
        }

        const confirmData = await confirmResponse.json();
        console.log('📡 업로드 확정 응답:', confirmData);

        Alert.alert('성공', '파일이 업로드되었습니다.');
        fetchFiles(); // 파일 목록 새로고침
      }
    } catch (error: any) {
      console.error('❌ 파일 업로드 실패:', error);
      console.error('❌ 에러 상세:', error.message);
      Alert.alert('오류', `파일 업로드에 실패했습니다.\n\n${error.message}`);
    } finally {
      setUploading(false);
    }
  }, [folderId]); // folderId가 변경될 때만 재생성

  // 파일 다운로드 및 열기 - 메모이제이션
  const openFile = useCallback(async (file: FileItem) => {
    try {
      console.log('📂 openFile 시작:', file.originalFileName);
      setLoading(true);
      
      // 로컬 캐시 확인 (ASCII 파일명으로 안전하게)
      const safeName = `${file.id}.pdf`; // 확장자만 유지, 한글/공백 제거
      const localPath = `${FileSystem.cacheDirectory}${safeName}`;
      console.log('📁 로컬 캐시 경로:', localPath);
      const fileExists = await FileSystem.getInfoAsync(localPath);
      console.log('📁 로컬 파일 존재 여부:', fileExists.exists);
      
      let fileUri = localPath;
      
      // PDF 파일 손상 문제 해결을 위해 항상 새로 다운로드
      console.log('🔄 PDF 파일 손상 방지를 위해 새로 다운로드');
      try {
        // 기존 파일 삭제
        if (fileExists.exists) {
          await FileSystem.deleteAsync(localPath);
          console.log('🗑️ 기존 캐시 파일 삭제 완료');
        }
      } catch (error) {
        console.log('⚠️ 기존 파일 삭제 실패:', error);
      }
      
      // 항상 새로 다운로드
      if (true) { // 항상 다운로드하도록 변경
        // 1단계: 다운로드 Presigned URL 발급
        const token = await AsyncStorage.getItem('accessToken');
        const downloadUrlResponse = await fetch(`http://52.78.209.115:8080/api/files/${file.id}/download-url`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!downloadUrlResponse.ok) {
          throw new Error(`다운로드 URL 발급 실패: ${downloadUrlResponse.status}`);
        }

        const downloadUrlData = await downloadUrlResponse.json();
        const downloadUrl = downloadUrlData.url;
        
        // 다운로드 URL 검증
        console.log('🔍 다운로드 URL 검증:');
        console.log('  - URL 존재:', !!downloadUrl);
        console.log('  - URL 타입:', typeof downloadUrl);
        console.log('  - URL 길이:', downloadUrl?.length || 0);
        
        if (!downloadUrl || typeof downloadUrl !== 'string') {
          throw new Error('다운로드 URL이 유효하지 않습니다.');
        }
        
        // PDF 파일 손상 방지를 위해 새로 다운로드
        console.log('🔄 PDF 파일 손상 방지를 위해 새로 다운로드');
        console.log('📥 다운로드 URL:', downloadUrl);
        
        // 기존 캐시 파일이 있으면 삭제
        try {
          const fileInfo = await FileSystem.getInfoAsync(localPath);
          if (fileInfo.exists) {
            await FileSystem.deleteAsync(localPath);
            console.log('🗑️ 기존 캐시 파일 삭제 완료');
          }
        } catch (error) {
          console.log('⚠️ 기존 파일 삭제 중 오류 (무시):', error);
        }
        
        // --- PDF 파일 다운로드 (downloadAsync 사용, S3 -> 프록시 폴백) ---
        const tryDownloadWithUrl = async (url: string, headers?: Record<string, string>) => {
          const res = await FileSystem.downloadAsync(url, localPath, { headers });
          if (res.status !== 200) {
            throw new Error(`다운로드 실패: ${res.status}`);
          }
          return res.uri;
        };

        try {
          console.log(`📥 PDF 파일 다운로드 시작...`);
          // 1) S3 presign URL 정리 (response-content-disposition 제거)
          const urlObj = new URL(downloadUrl);
          urlObj.searchParams.delete('response-content-disposition');
          const cleanUrl = urlObj.toString();
          console.log('🔧 정리된 S3 URL:', cleanUrl);

          // 2) S3로 다운로드 시도
          try {
            const s3Uri = await tryDownloadWithUrl(cleanUrl, { Accept: 'application/pdf' });
            console.log('✅ 정리된 S3 URL PDF 파일 다운로드 완료:', s3Uri);
            fileUri = s3Uri;
          } catch (e1: any) {
            console.warn(`⚠️ S3 정리 URL 실패: ${e1?.message ?? e1}`);
            try {
              // 원본 S3 URL로 재시도
              const s3OrigUri = await tryDownloadWithUrl(downloadUrl, { Accept: 'application/pdf' });
              console.log('✅ 원본 S3 URL PDF 파일 다운로드 완료:', s3OrigUri);
              fileUri = s3OrigUri;
            } catch (e2: any) {
              console.warn(`⚠️ 원본 S3 URL도 실패: ${e2?.message ?? e2}`);
              // 3) 프록시로 폴백 (JWT 필요)
              const token = await AsyncStorage.getItem('accessToken');
              const proxyUrl = `http://52.78.209.115:8080/api/files/${file.id}/download`;
              const proxyUri = await tryDownloadWithUrl(proxyUrl, {
                Accept: 'application/pdf',
                Authorization: `Bearer ${token ?? ''}`,
              });
              console.log('✅ 프록시 PDF 파일 다운로드 완료:', proxyUri);
              fileUri = proxyUri;
            }
          }

          // 파일 존재 검증
          const info = await FileSystem.getInfoAsync(fileUri);
          if (!info.exists) throw new Error('다운로드 후 파일이 존재하지 않습니다.');
          
          // PDF 헤더 검증 (Base64로 5바이트만 읽어 'JVBER' (= %PDF) 확인)
          const head = await FileSystem.readAsStringAsync(fileUri, { 
            encoding: FileSystem.EncodingType.Base64, 
            length: 5 
          });
          if (!head.startsWith('JVBER')) {
            throw new Error('PDF 헤더가 올바르지 않습니다.');
          }
          console.log('✅ PDF 파일 검증 완료');
        } catch (err) {
          throw err; // 바깥 catch로 던져서 기존 에러 핸들링 사용
        }
      }

      // 파일 타입에 따라 다른 화면으로 이동
      if (file.contentType === 'application/pdf') {
        console.log('📄 PDF 파일 - PDFDrawing으로 네비게이션');
        console.log('📄 전달할 파일 정보:', file);
        console.log('📄 전달할 파일 URI:', fileUri);
        console.log('📄 전달할 주제 색상:', subjectColor);
        
        // PDF 필기 화면으로 바로 이동
        navigation.navigate('PDFDrawing', {
          file: file,
          fileUri: fileUri,
          subjectColor: subjectColor
        });
      } else if (file.contentType.includes('audio/') || file.contentType.includes('video/')) {
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
  }, [subjectColor, navigation]); // subjectColor와 navigation이 변경될 때만 재생성

  // 오디오 재생은 AudioPlayerOverlay에서 처리

  // 파일 삭제 - 메모이제이션
  const deleteFile = useCallback(async (fileId: number) => {
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
              console.log('🗑️ 파일 삭제 시작, fileId:', fileId);
              await api.delete(`/api/files/${fileId}`);
              console.log('✅ 파일 삭제 성공');
              Alert.alert('성공', '파일이 삭제되었습니다.');
              console.log('🔄 파일 목록 새로고침 시작');
              await fetchFiles();
              console.log('✅ 파일 목록 새로고침 완료');
            } catch (error: any) {
              console.error('❌ 파일 삭제 실패:', error);
              Alert.alert('오류', '파일 삭제에 실패했습니다.');
            }
          },
        },
      ]
    );
  }, [fetchFiles]); // fetchFiles가 변경될 때만 재생성

  // 파일 아이콘 결정 - 메모이제이션
  const getFileIcon = useCallback((contentType: string) => {
    if (contentType === 'application/pdf') return 'document-text';
    if (contentType.includes('audio/') || contentType.includes('video/')) return 'mic';
    return 'document';
  }, []);

  // 파일 타입 검증 - 메모이제이션
  const isValidFileType = useCallback((contentType: string) => {
    return contentType === 'application/pdf' || contentType.includes('audio/') || contentType.includes('video/');
  }, []);

  // 파일 크기 포맷팅 - 메모이제이션
  const formatFileSize = useCallback((bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);

  // 파일 액션 모달 열기 - 메모이제이션
  const openFileActions = useCallback((file: FileItem) => {
    setSelectedFile(file);
    setNewFileName(file.originalFileName);
    setShowFileActions(true);
  }, []);

  // 파일 이름 수정 - 메모이제이션
  const updateFileName = useCallback(async () => {
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
  }, [selectedFile, newFileName, files]); // selectedFile, newFileName, files가 변경될 때만 재생성

  // 파일 터치 핸들러 - 메모이제이션
  const handleFileTouch = useCallback(async (file: FileItem) => {
    console.log(`[${file.originalFileName}] 터치됨`);
    console.log('📁 파일 타입:', file.contentType);
    console.log('📁 파일 ID:', file.id);
    console.log('📁 폴더 ID:', file.folderId);
    
    if (!isValidFileType(file.contentType)) {
      Alert.alert('알림', 'PDF 파일이나 오디오/비디오 파일을 넣어주세요.');
      return;
    }

    // 파일 타입에 따라 적절한 화면으로 이동
    if (file.contentType === 'application/pdf') {
      console.log('📄 PDF 파일 클릭됨 - openFile 호출');
      // PDF 파일은 SubjectStack 내에서 처리
      await openFile(file);
    } else if (file.contentType.includes('audio/') || file.contentType.includes('video/')) {
      // 오디오/비디오 파일은 오버레이로 처리
      try {
        setLoading(true);
        
        // 로컬 캐시 확인 (ASCII 파일명으로 안전하게)
        const fileExtension = file.originalFileName.split('.').pop() || 'file';
        const safeName = `${file.id}.${fileExtension}`; // 확장자만 유지, 한글/공백 제거
        const localPath = `${FileSystem.cacheDirectory}${safeName}`;
        const fileExists = await FileSystem.getInfoAsync(localPath);
        
        let fileUri = localPath;
        
        // 로컬에 없으면 다운로드
        if (!fileExists.exists) {
          // 1단계: 다운로드 Presigned URL 발급
          const token = await AsyncStorage.getItem('accessToken');
          const downloadUrlResponse = await fetch(`http://52.78.209.115:8080/api/files/${file.id}/download-url`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (!downloadUrlResponse.ok) {
            throw new Error(`다운로드 URL 발급 실패: ${downloadUrlResponse.status}`);
          }

          const downloadUrlData = await downloadUrlResponse.json();
          const downloadUrl = downloadUrlData.url;
          
          // AWS S3 presigned URL을 그대로 사용하되, fetch로 다운로드 후 파일로 저장
          console.log('🔧 오디오 파일 원본 다운로드 URL 사용:', downloadUrl);
          
          // S3 URL에서 문제가 되는 response-content-disposition 파라미터 제거
          const url = new URL(downloadUrl);
          url.searchParams.delete('response-content-disposition');
          const cleanUrl = url.toString();
          console.log('🔧 오디오 파일 정리된 S3 URL:', cleanUrl);
          
          // --- 오디오 파일 다운로드 (downloadAsync 사용, S3 -> 프록시 폴백) ---
          const tryDownloadWithUrl = async (url: string, headers?: Record<string, string>) => {
            const res = await FileSystem.downloadAsync(url, localPath, { headers });
            if (res.status !== 200) {
              throw new Error(`다운로드 실패: ${res.status}`);
            }
            return res.uri;
          };

          try {
            console.log(`📥 오디오 파일 다운로드 시작...`);
            // 1) S3 presign URL 정리 (response-content-disposition 제거)
            const urlObj = new URL(downloadUrl);
            urlObj.searchParams.delete('response-content-disposition');
            const cleanUrl = urlObj.toString();
            console.log('🔧 정리된 S3 URL:', cleanUrl);

            // 2) S3로 다운로드 시도
            try {
              const s3Uri = await tryDownloadWithUrl(cleanUrl, { Accept: file.contentType });
              console.log('✅ 정리된 S3 URL 오디오 파일 다운로드 완료:', s3Uri);
              fileUri = s3Uri;
            } catch (e1: any) {
              console.warn(`⚠️ S3 정리 URL 실패: ${e1?.message ?? e1}`);
              try {
                // 원본 S3 URL로 재시도
                const s3OrigUri = await tryDownloadWithUrl(downloadUrl, { Accept: file.contentType });
                console.log('✅ 원본 S3 URL 오디오 파일 다운로드 완료:', s3OrigUri);
                fileUri = s3OrigUri;
              } catch (e2: any) {
                console.warn(`⚠️ 원본 S3 URL도 실패: ${e2?.message ?? e2}`);
                // 3) 프록시로 폴백 (JWT 필요)
                const token = await AsyncStorage.getItem('accessToken');
                const proxyUrl = `http://52.78.209.115:8080/api/files/${file.id}/download`;
                const proxyUri = await tryDownloadWithUrl(proxyUrl, {
                  Accept: file.contentType,
                  Authorization: `Bearer ${token ?? ''}`,
                });
                console.log('✅ 프록시 오디오 파일 다운로드 완료:', proxyUri);
                fileUri = proxyUri;
              }
            }

            // 파일 존재 검증
            const info = await FileSystem.getInfoAsync(fileUri);
            if (!info.exists) throw new Error('다운로드 후 파일이 존재하지 않습니다.');
            console.log('✅ 오디오 파일 검증 완료');
          } catch (err) {
            throw err; // 바깥 catch로 던져서 기존 에러 핸들링 사용
          }
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
  }, [isValidFileType, openFile, subjectColor]); // isValidFileType, openFile, subjectColor가 변경될 때만 재생성

  // 오디오 플레이어 닫기 - 메모이제이션
  const closeAudioPlayer = useCallback(() => {
    setAudioPlayerFile(null);
    setAudioPlayerUri('');
  }, []);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]); // fetchFiles가 변경될 때만 실행

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
                  name={getFileIcon(file.contentType)} 
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
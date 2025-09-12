import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  Dimensions,
  ScrollView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../libs/api/axios';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { SubjectStackParamList } from '../MainTabs';

// 웹에서는 react-native-pdf를 import하지 않음
let Pdf: any = null;
if (Platform.OS !== 'web') {
  try {
    Pdf = require('react-native-pdf').default;
  } catch (error) {
    console.warn('react-native-pdf를 로드할 수 없습니다:', error);
  }
}

interface FileItem {
  id: number;
  folderId: number;
  originalFileName: string;
  contentType: string;
  size: number;
  updatedAt: string;
  deleted: boolean;
}

type Props = NativeStackScreenProps<SubjectStackParamList, 'PdfViewerScreen'>;

export default function PdfViewerScreen({ route, navigation }: Props) {
  const { file, fileUri, subjectColor } = route.params;
  const [loading, setLoading] = useState(true);
  const [annotations, setAnnotations] = useState<any[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentTool, setCurrentTool] = useState('pen');
  const [currentColor, setCurrentColor] = useState('#ff0000');
  const [currentWidth, setCurrentWidth] = useState(2);

  // 필기 데이터 로드
  const loadAnnotations = async () => {
    try {
      const response = await api.get(`/api/annotations/${file.id}`);
      setAnnotations(response.data || []);
    } catch (error) {
      console.log('필기 데이터 없음 또는 로드 실패:', error);
      setAnnotations([]);
    }
  };

  // 필기 데이터 저장
  const saveAnnotations = async (newAnnotations: any[]) => {
    try {
      await api.post(`/api/annotations/${file.id}`, {
        annotations: newAnnotations
      });
      setAnnotations(newAnnotations);
    } catch (error) {
      console.error('필기 데이터 저장 실패:', error);
      Alert.alert('오류', '필기를 저장할 수 없습니다.');
    }
  };

  // 필기 도구 변경
  const changeTool = (tool: string) => {
    setCurrentTool(tool);
  };

  // 색상 변경
  const changeColor = (color: string) => {
    setCurrentColor(color);
  };

  // 굵기 변경
  const changeWidth = (width: number) => {
    setCurrentWidth(width);
  };

  // 필기 지우기
  const clearAnnotations = () => {
    Alert.alert(
      '필기 지우기',
      '모든 필기를 지우시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '지우기',
          style: 'destructive',
          onPress: () => {
            setAnnotations([]);
            saveAnnotations([]);
          },
        },
      ]
    );
  };

  useEffect(() => {
    loadAnnotations();
    setLoading(false);
  }, [file.id]);

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

      {/* 도구 모음 */}
      <View style={styles.toolbar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.toolGroup}>
            {/* 그리기 도구 */}
            <TouchableOpacity
              style={[styles.toolButton, currentTool === 'pen' && styles.activeTool]}
              onPress={() => changeTool('pen')}
            >
              <Ionicons name="create" size={20} color={currentTool === 'pen' ? 'white' : '#666'} />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.toolButton, currentTool === 'highlighter' && styles.activeTool]}
              onPress={() => changeTool('highlighter')}
            >
              <Ionicons name="brush" size={20} color={currentTool === 'highlighter' ? 'white' : '#666'} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.toolButton, currentTool === 'text' && styles.activeTool]}
              onPress={() => changeTool('text')}
            >
              <Ionicons name="text" size={20} color={currentTool === 'text' ? 'white' : '#666'} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.toolButton, currentTool === 'eraser' && styles.activeTool]}
              onPress={() => changeTool('eraser')}
            >
              <Ionicons name="trash" size={20} color={currentTool === 'eraser' ? 'white' : '#666'} />
            </TouchableOpacity>
          </View>

          <View style={styles.toolGroup}>
            {/* 색상 선택 */}
            {['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#000000'].map((color) => (
              <TouchableOpacity
                key={color}
                style={[styles.colorButton, { backgroundColor: color }, currentColor === color && styles.selectedColor]}
                onPress={() => changeColor(color)}
              />
            ))}
          </View>

          <View style={styles.toolGroup}>
            {/* 굵기 선택 */}
            {[1, 2, 4, 8].map((width) => (
              <TouchableOpacity
                key={width}
                style={[styles.widthButton, currentWidth === width && styles.activeTool]}
                onPress={() => changeWidth(width)}
              >
                <View style={[styles.widthIndicator, { width: width * 2, height: width * 2 }]} />
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.toolGroup}>
            {/* 기타 도구 */}
            <TouchableOpacity style={styles.toolButton} onPress={clearAnnotations}>
              <Ionicons name="refresh" size={20} color="#666" />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>

      {/* PDF 뷰어 */}
      <View style={styles.pdfContainer}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={subjectColor} />
            <Text style={styles.loadingText}>PDF를 불러오는 중...</Text>
          </View>
        ) : Platform.OS === 'web' ? (
          <View style={styles.webPdfContainer}>
            <Text style={styles.webPdfText}>
              웹에서는 PDF 뷰어를 사용할 수 없습니다.
            </Text>
            <Text style={styles.webPdfText}>
              파일명: {file.originalFileName}
            </Text>
            <TouchableOpacity
              style={[styles.downloadButton, { backgroundColor: subjectColor }]}
              onPress={() => {
                // 웹에서 PDF 다운로드
                if (Platform.OS === 'web' && typeof document !== 'undefined') {
                  const link = document.createElement('a');
                  link.href = fileUri;
                  link.download = file.originalFileName;
                  link.click();
                }
              }}
            >
              <Text style={styles.downloadButtonText}>PDF 다운로드</Text>
            </TouchableOpacity>
          </View>
        ) : Pdf ? (
          <Pdf
            source={{ uri: fileUri }}
            style={styles.pdf}
            onLoadComplete={(numberOfPages: number) => {
              console.log(`PDF 로드 완료: ${numberOfPages}페이지`);
            }}
            onError={(error: any) => {
              console.error('PDF 로드 오류:', error);
              Alert.alert('오류', 'PDF를 불러올 수 없습니다.');
            }}
          />
        ) : (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>PDF 뷰어를 사용할 수 없습니다.</Text>
          </View>
        )}
        
        {/* 필기 오버레이 (향후 구현) */}
        <View style={styles.annotationOverlay}>
          {/* 여기에 SVG 또는 Canvas 기반 필기 레이어 구현 */}
          <Text style={styles.comingSoon}>필기 기능 (향후 구현)</Text>
        </View>
      </View>
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
  toolbar: {
    backgroundColor: 'white',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  toolGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  toolButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  activeTool: {
    backgroundColor: '#007AFF',
  },
  colorButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedColor: {
    borderColor: '#007AFF',
  },
  widthButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  widthIndicator: {
    backgroundColor: '#333',
    borderRadius: 10,
  },
  pdfContainer: {
    flex: 1,
    position: 'relative',
  },
  webPdfContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  webPdfText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
  },
  downloadButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  downloadButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#ff6b6b',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  pdf: {
    flex: 1,
    width: Dimensions.get('window').width,
  },
  annotationOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  comingSoon: {
    fontSize: 16,
    color: '#999',
    fontStyle: 'italic',
  },
});

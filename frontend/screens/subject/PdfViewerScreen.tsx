import React, { useState, useEffect, useRef } from 'react';
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
  PanResponder,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path, Circle, Text as SvgText, G } from 'react-native-svg';
import * as FileSystem from 'expo-file-system';
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

interface DrawingPath {
  id: string;
  path: string;
  color: string;
  width: number;
  tool: string;
}

interface DrawingPoint {
  x: number;
  y: number;
}

type Props = NativeStackScreenProps<SubjectStackParamList, 'PdfViewerScreen'>;

export default function PdfViewerScreen({ route, navigation }: Props) {
  const { file, fileUri, subjectColor } = route.params;
  const [loading, setLoading] = useState(true);
  const [pdfImageUri, setPdfImageUri] = useState<string>('');
  const [drawingPaths, setDrawingPaths] = useState<DrawingPath[]>([]);
  const [currentPath, setCurrentPath] = useState<string>('');
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentTool, setCurrentTool] = useState('pen');
  const [currentColor, setCurrentColor] = useState('#ff0000');
  const [currentWidth, setCurrentWidth] = useState(2);
  const [currentPoints, setCurrentPoints] = useState<DrawingPoint[]>([]);
  const svgRef = useRef<any>(null);

  // PDF를 이미지로 변환 (간단한 플레이스홀더)
  const convertPdfToImage = async () => {
    try {
      // 실제로는 PDF를 이미지로 변환하는 로직이 필요
      // 현재는 파일 URI를 그대로 사용 (개발용)
      setPdfImageUri(fileUri);
      setLoading(false);
    } catch (error) {
      console.error('PDF 변환 실패:', error);
      setLoading(false);
    }
  };

  // 필기 데이터 로드
  const loadAnnotations = async () => {
    try {
      const response = await api.get(`/api/annotations/${file.id}`);
      setDrawingPaths(response.data || []);
    } catch (error) {
      console.log('필기 데이터 없음 또는 로드 실패:', error);
      setDrawingPaths([]);
    }
  };

  // 필기 데이터 저장
  const saveAnnotations = async (newPaths: DrawingPath[]) => {
    try {
      await api.post(`/api/annotations/${file.id}`, {
        annotations: newPaths
      });
      setDrawingPaths(newPaths);
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

  // PDF 열기
  const openPdf = async () => {
    try {
      await WebBrowser.openBrowserAsync(fileUri, {
        presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
        controlsColor: '#007AFF',
        showTitle: true,
        toolbarColor: subjectColor,
      });
    } catch (error) {
      console.error('PDF 열기 실패:', error);
      Alert.alert('오류', 'PDF를 열 수 없습니다.');
    }
  };

  // 그리기 시작
  const startDrawing = (x: number, y: number) => {
    setIsDrawing(true);
    setCurrentPoints([{ x, y }]);
    setCurrentPath(`M${x},${y}`);
  };

  // 그리기 중
  const continueDrawing = (x: number, y: number) => {
    if (!isDrawing) return;
    
    const newPoints = [...currentPoints, { x, y }];
    setCurrentPoints(newPoints);
    
    if (currentTool === 'pen' || currentTool === 'highlighter') {
      setCurrentPath(prev => `${prev} L${x},${y}`);
    }
  };

  // 그리기 종료
  const endDrawing = () => {
    if (!isDrawing) return;
    
    const newPath: DrawingPath = {
      id: Date.now().toString(),
      path: currentPath,
      color: currentColor,
      width: currentWidth,
      tool: currentTool,
    };
    
    const updatedPaths = [...drawingPaths, newPath];
    setDrawingPaths(updatedPaths);
    saveAnnotations(updatedPaths);
    
    setIsDrawing(false);
    setCurrentPath('');
    setCurrentPoints([]);
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
            setDrawingPaths([]);
            saveAnnotations([]);
          },
        },
      ]
    );
  };

  // PanResponder 설정
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (evt) => {
      const { locationX, locationY } = evt.nativeEvent;
      startDrawing(locationX, locationY);
    },
    onPanResponderMove: (evt) => {
      const { locationX, locationY } = evt.nativeEvent;
      continueDrawing(locationX, locationY);
    },
    onPanResponderRelease: () => {
      endDrawing();
    },
  });

  useEffect(() => {
    loadAnnotations();
    convertPdfToImage();
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

      {/* PDF 뷰어 + 필기 기능 */}
      <View style={styles.pdfContainer}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={subjectColor} />
            <Text style={styles.loadingText}>PDF를 불러오는 중...</Text>
          </View>
        ) : (
          <View style={styles.drawingContainer} {...panResponder.panHandlers}>
            {/* PDF 이미지 배경 */}
            {pdfImageUri ? (
              <Image
                source={{ uri: pdfImageUri }}
                style={styles.pdfImage}
                resizeMode="contain"
              />
            ) : (
              <View style={styles.pdfPlaceholder}>
                <Ionicons name="document-text" size={80} color={subjectColor} />
                <Text style={styles.pdfTitle}>{file.originalFileName}</Text>
                <Text style={styles.pdfSubtitle}>PDF 파일을 불러오는 중...</Text>
              </View>
            )}
            
            {/* SVG 필기 오버레이 */}
            <View style={styles.svgOverlay}>
              <Svg
                ref={svgRef}
                style={styles.svg}
                width="100%"
                height="100%"
              >
                {/* 저장된 필기 경로들 */}
                {drawingPaths.map((path) => (
                  <Path
                    key={path.id}
                    d={path.path}
                    stroke={path.color}
                    strokeWidth={path.width}
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity={path.tool === 'highlighter' ? 0.5 : 1}
                  />
                ))}
                
                {/* 현재 그리는 경로 */}
                {isDrawing && currentPath && (
                  <Path
                    d={currentPath}
                    stroke={currentColor}
                    strokeWidth={currentWidth}
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity={currentTool === 'highlighter' ? 0.5 : 1}
                  />
                )}
                
                {/* 현재 그리는 점들 (펜 도구용) */}
                {isDrawing && currentTool === 'pen' && currentPoints.map((point, index) => (
                  <Circle
                    key={index}
                    cx={point.x}
                    cy={point.y}
                    r={currentWidth / 2}
                    fill={currentColor}
                  />
                ))}
              </Svg>
            </View>
          </View>
        )}
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
  drawingContainer: {
    flex: 1,
    position: 'relative',
  },
  pdfImage: {
    width: '100%',
    height: '100%',
  },
  svgOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  svg: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  pdfPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  pdfTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    textAlign: 'center',
  },
  pdfSubtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
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
});

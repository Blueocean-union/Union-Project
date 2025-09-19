import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  PanResponder,
  Alert,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Svg, { Path, Circle } from 'react-native-svg';
import * as FileSystem from 'expo-file-system';
import api from '../../libs/api/axios';

interface PDFDrawingScreenProps {
  route: {
    params: {
      file: {
        id: number;
        folderId: number;
        originalFileName: string;
        contentType: string;
        size: number;
        updatedAt: string;
        deleted: boolean;
      };
      fileUri: string;
      subjectColor: string;
    };
  };
}

interface DrawingPath {
  id: string;
  path: string;
  color: string;
  width: number;
  tool: string;
  page: number;
}

interface DrawingPoint {
  x: number;
  y: number;
}

export default function PDFDrawingScreen({ route }: PDFDrawingScreenProps) {
  const { file, fileUri, subjectColor } = route.params;
  const navigation = useNavigation();
  
  // PDF 관련 상태
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 필기 관련 상태
  const [currentTool, setCurrentTool] = useState('pen');
  const [currentColor, setCurrentColor] = useState('#ff0000');
  const [currentWidth, setCurrentWidth] = useState(2);
  const [drawingPaths, setDrawingPaths] = useState<DrawingPath[]>([]);
  const [currentPath, setCurrentPath] = useState<string>('');
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPoints, setCurrentPoints] = useState<DrawingPoint[]>([]);
  
  // Refs
  const svgRef = useRef<any>(null);
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

  // 필기 데이터 로드
  const loadAnnotations = async () => {
    try {
      const response = await api.get(`/api/annotations/${file.id}`);
      console.log('📝 필기 데이터 응답:', response.data);
      
      if (Array.isArray(response.data)) {
        setDrawingPaths(response.data);
      } else if (response.data && Array.isArray(response.data.annotations)) {
        setDrawingPaths(response.data.annotations);
      } else {
        setDrawingPaths([]);
      }
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

  // 액션 버튼 핸들러
  const handleVoiceRecord = () => {
    console.log('음성녹음 버튼 눌림');
  };

  const handleSummarize = () => {
    console.log('요약하기 버튼 눌림');
  };

  // 툴바 핸들러
  const handleToolChange = (tool: string) => {
    setCurrentTool(tool);
  };

  const handleColorChange = (color: string) => {
    setCurrentColor(color);
  };

  const handleClearAnnotations = () => {
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

  // 그리기 시작
  const startDrawing = (x: number, y: number) => {
    if (currentTool === 'eraser') {
      eraseAtPoint(x, y);
      return;
    }
    
    setIsDrawing(true);
    setCurrentPoints([{ x, y }]);
    setCurrentPath(`M${x},${y}`);
  };

  // 그리기 중
  const continueDrawing = (x: number, y: number) => {
    if (currentTool === 'eraser') {
      eraseAtPoint(x, y);
      return;
    }
    
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
      page: currentPage,
    };
    
    const updatedPaths = [...drawingPaths, newPath];
    setDrawingPaths(updatedPaths);
    saveAnnotations(updatedPaths);
    
    setIsDrawing(false);
    setCurrentPath('');
    setCurrentPoints([]);
  };

  // 지우개 기능
  const eraseAtPoint = (x: number, y: number) => {
    const eraserRadius = 20;
    
    const updatedPaths = drawingPaths.filter((path) => {
      return !isPathInEraserRange(path, x, y, eraserRadius);
    });
    
    if (updatedPaths.length !== drawingPaths.length) {
      setDrawingPaths(updatedPaths);
      saveAnnotations(updatedPaths);
    }
  };

  // 경로가 지우개 범위 내에 있는지 확인
  const isPathInEraserRange = (path: DrawingPath, x: number, y: number, radius: number) => {
    const pathData = path.path;
    const coordinates = pathData.match(/(\d+\.?\d*),(\d+\.?\d*)/g);
    
    if (!coordinates) return false;
    
    for (const coord of coordinates) {
      const [px, py] = coord.split(',').map(Number);
      const distance = Math.sqrt((px - x) ** 2 + (py - y) ** 2);
      if (distance <= radius) {
        return true;
      }
    }
    return false;
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

  // useEffect로 필기 데이터 로드
  useEffect(() => {
    loadAnnotations();
    setLoading(false); // PDF 로딩 시뮬레이션
    console.log('PDFDrawingScreen 로드됨:', {
      fileId: file.id,
      fileName: file.originalFileName,
      fileUri: fileUri,
      contentType: file.contentType
    });
  }, [file.id, fileUri]);

  // 툴바 핸들러
  const handleToolChange = (tool: string) => {
    setCurrentTool(tool);
  };

  const handleColorChange = (color: string) => {
    setCurrentColor(color);
  };

  const handleClearAnnotations = () => {
    console.log('필기 지우기');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 상단 헤더 */}
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
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerActionButton}>
            <Ionicons name="mic" size={20} color="white" />
            <Text style={styles.headerActionText}>음성녹음</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerActionButton}>
            <Ionicons name="create" size={20} color="white" />
            <Text style={styles.headerActionText}>요약하기</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 색상 팔레트 + 툴바 (한 줄) */}
      <View style={[styles.toolbarContainer, { backgroundColor: subjectColor }]}>
        <View style={styles.colorRow}>
          {['#000000', '#ffffff', '#ff0000', '#0000ff', '#00ff00'].map((color) => (
            <TouchableOpacity
              key={color}
              style={[styles.colorButton, { backgroundColor: color }, currentColor === color && styles.selectedColor]}
              onPress={() => handleColorChange(color)}
            />
          ))}
        </View>
        
        <View style={styles.toolGroup}>
          <TouchableOpacity
            style={[styles.toolButton, currentTool === 'pen' && styles.activeTool]}
            onPress={() => handleToolChange('pen')}
          >
            <Ionicons name="create" size={20} color="white" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.toolButton, currentTool === 'eraser' && styles.activeTool]}
            onPress={() => handleToolChange('eraser')}
          >
            <Ionicons name="remove-circle-outline" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* PDF 뷰어 영역 */}
      <View style={styles.pdfViewerContainer}>
        {loading && (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>PDF 로딩 중...</Text>
          </View>
        )}
        
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={() => {
                setError(null);
                setLoading(true);
                setTimeout(() => setLoading(false), 1000);
              }}
            >
              <Text style={styles.retryButtonText}>다시 시도</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {!loading && !error && (
          <View style={styles.pdfWrapper} {...panResponder.panHandlers}>
            {/* PDF 내용 시뮬레이션 - 실제 PDF 뷰어 대신 */}
            <ScrollView 
              style={styles.pdf}
              contentContainerStyle={styles.pdfContent}
              showsVerticalScrollIndicator={true}
            >
              <View style={styles.pdfPage}>
                <Text style={styles.pdfText}>
                  📄 {file.originalFileName}
                </Text>
                <Text style={styles.pdfInfo}>
                  파일 크기: {(file.size / 1024 / 1024).toFixed(2)} MB
                </Text>
                <Text style={styles.pdfInfo}>
                  업로드 날짜: {new Date(file.updatedAt).toLocaleDateString()}
                </Text>
                <Text style={styles.pdfPlaceholder}>
                  PDF 뷰어가 로드되었습니다.{'\n'}
                  필기 기능을 사용할 수 있습니다.
                </Text>
              </View>
            </ScrollView>
            
            {/* SVG 필기 오버레이 */}
            <View style={styles.svgOverlay}>
              <Svg
                ref={svgRef}
                style={styles.svg}
                width={screenWidth}
                height={screenHeight - 200}
              >
                {/* 저장된 필기 경로들 */}
                {drawingPaths
                  .filter(path => path.page === currentPage)
                  .map((path) => (
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
                
                {/* 현재 그리는 점들 */}
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

    </SafeAreaView>
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
    paddingTop: 10,
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  headerActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  headerActionText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  toolbarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  colorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  toolGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  toolButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  activeTool: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  colorButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedColor: {
    borderColor: 'white',
    borderWidth: 3,
  },
  pdfViewerContainer: {
    flex: 1,
    position: 'relative',
  },
  pdfWrapper: {
    flex: 1,
    position: 'relative',
  },
  pdf: {
    flex: 1,
    backgroundColor: 'white',
  },
  pdfContent: {
    flexGrow: 1,
    padding: 20,
  },
  pdfPage: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pdfText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  pdfInfo: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  pdfPlaceholder: {
    fontSize: 18,
    color: '#999',
    textAlign: 'center',
    marginTop: 40,
    lineHeight: 24,
  },
  svgOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
  svg: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#ff0000',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

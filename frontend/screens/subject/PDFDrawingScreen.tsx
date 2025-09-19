import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  PanResponder,
  Alert,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Pdf from 'react-native-pdf';
import Svg, { Path, Circle } from 'react-native-svg';
import api from '../../libs/api/axios';

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

interface PDFDrawingScreenProps {
  route: {
    params: {
      file: FileItem;
      fileUri: string;
      subjectColor: string;
    };
  };
}

export default function PDFDrawingScreen({ route }: PDFDrawingScreenProps) {
  const { file, fileUri, subjectColor } = route.params;
  const navigation = useNavigation();
  
  // 디버깅 로그 추가 (무한 렌더링 방지를 위해 제거)
  // console.log('🔍 PDFDrawingScreen 렌더링 시작');
  // console.log('📁 파일 정보:', file);
  // console.log('🔗 파일 URI:', fileUri);
  // console.log('🎨 주제 색상:', subjectColor);
  
  // PDF 관련 상태
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1);
  const [loading, setLoading] = useState(false); // PDF 컴포넌트 렌더링을 위해 초기값 false
  const [error, setError] = useState<string | null>(null);
  const [pdfLoaded, setPdfLoaded] = useState(false); // PDF 로드 상태 추가
  
  // 필기 관련 상태
  const [currentTool, setCurrentTool] = useState('pen');
  const [currentColor, setCurrentColor] = useState('#ff0000');
  const [currentWidth, setCurrentWidth] = useState(2);
  const [drawingPaths, setDrawingPaths] = useState<DrawingPath[]>([]);
  const [currentPath, setCurrentPath] = useState<string>('');
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPoints, setCurrentPoints] = useState<DrawingPoint[]>([]);
  
  // Refs
  const pdfRef = useRef<any>(null);
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
    console.log('🔄 useEffect 실행 - loadAnnotations 호출');
    loadAnnotations();
  }, [file.id]); // file.id가 변경될 때만 실행

  // PDF 컴포넌트 렌더링 조건 디버깅
  useEffect(() => {
    console.log('🔍 PDF 렌더링 조건 체크:');
    console.log('  - loading:', loading);
    console.log('  - error:', error);
    console.log('  - fileUri:', fileUri);
    console.log('  - pdfLoaded:', pdfLoaded);
    console.log('  - 렌더링 가능:', !loading && !error && fileUri);
  }, [loading, error, fileUri, pdfLoaded]);

  // 화면이 로드될 때 loading 상태 초기화
  useEffect(() => {
    if (fileUri) {
      console.log('📱 화면 로드 완료, loading 상태를 false로 설정');
      setLoading(false);
    }
  }, [fileUri]);

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
          <TouchableOpacity 
            style={styles.headerActionButton}
            onPress={handleVoiceRecord}
          >
            <Ionicons name="mic" size={20} color="white" />
            <Text style={styles.headerActionText}>음성녹음</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerActionButton}
            onPress={handleSummarize}
          >
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
          
          <TouchableOpacity
            style={[styles.toolButton]}
            onPress={handleClearAnnotations}
          >
            <Ionicons name="trash-outline" size={20} color="white" />
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
              }}
            >
              <Text style={styles.retryButtonText}>다시 시도</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {(() => {
          console.log('🚀 PDF 컴포넌트 렌더링 시도:', { loading, error: !!error, fileUri: !!fileUri });
          return !loading && !error && fileUri;
        })() && (
          <View style={styles.pdfWrapper} {...panResponder.panHandlers}>
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={true}
              showsHorizontalScrollIndicator={false}
              bounces={true}
            >
              {(() => {
                console.log('📄 PDF 컴포넌트 렌더링 시작');
                console.log('📄 PDF 소스:', { uri: fileUri, cache: false, cacheFileName: `pdf_${file.id}_${Date.now()}.pdf` });
                return null;
              })()}
              <Pdf
                ref={pdfRef}
                source={{ 
                  uri: fileUri,
                  cache: false, // 캐시 비활성화로 손상된 파일 문제 해결
                  cacheFileName: `pdf_${file.id}_${Date.now()}.pdf` // 고유한 파일명 사용
                }}
                style={[styles.pdf, { width: screenWidth * scale, height: screenHeight * scale }]}
                onLoadComplete={(numberOfPages) => {
                  console.log('✅ PDF 로드 완료:', numberOfPages, '페이지');
                  console.log('📄 PDF 소스 URI:', fileUri);
                  setTotalPages(numberOfPages);
                  setLoading(false);
                  setError(null);
                  setPdfLoaded(true);
                }}
                onError={(error: any) => {
                  console.error('❌ PDF 로드 오류:', error);
                  console.error('❌ 오류 상세:', error.message);
                  console.error('❌ 파일 URI:', fileUri);
                  setError(error.message || 'PDF 로드 중 오류가 발생했습니다.');
                  setLoading(false);
                  setPdfLoaded(false);
                }}
                onLoadProgress={(percent) => {
                  console.log('📊 PDF 로딩 진행률:', percent + '%');
                }}
                enablePaging={false}
                enableRTL={false}
                enableAntialiasing={true}
                enableAnnotationRendering={true}
                enableDoubleTapZoom={false}
                password=""
                spacing={0}
                scale={scale}
                minScale={0.5}
                maxScale={3}
                horizontal={false}
                onScaleChanged={(scale) => {
                  console.log('📏 스케일 변경:', scale);
                  setScale(scale);
                }}
              />
            </ScrollView>
            
            {/* SVG 필기 오버레이 */}
            <View style={styles.svgOverlay}>
              <Svg
                ref={svgRef}
                style={styles.svg}
                width={screenWidth}
                height={screenHeight - 200} // 헤더와 툴바 높이 제외
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  pdf: {
    backgroundColor: 'white',
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

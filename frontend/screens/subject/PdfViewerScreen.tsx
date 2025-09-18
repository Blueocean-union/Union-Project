import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  PanResponder,
  ScrollView,
  Dimensions,
  Image,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path, Circle, Text as SvgText, G } from 'react-native-svg';
import { WebView } from 'react-native-webview';
import * as FileSystem from 'expo-file-system';
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
  page: number;
}

interface DrawingPoint {
  x: number;
  y: number;
}

interface PdfViewerScreenProps {
  file: FileItem;
  fileUri: string;
  subjectColor: string;
  currentTool: string;
  currentColor: string;
  summaryPdfUri?: string; // 요약 PDF URI (선택적)
}

export default function PdfViewerScreen({ 
  file, 
  fileUri, 
  subjectColor, 
  currentTool, 
  currentColor,
  summaryPdfUri
}: PdfViewerScreenProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfImages, setPdfImages] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [scale, setScale] = useState(1);
  const [drawingPaths, setDrawingPaths] = useState<DrawingPath[]>([]);
  const [currentPath, setCurrentPath] = useState<string>('');
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentWidth, setCurrentWidth] = useState(2);
  const [currentPoints, setCurrentPoints] = useState<DrawingPoint[]>([]);
  const [showSummary, setShowSummary] = useState(false);
  const [splitRatio, setSplitRatio] = useState(0.5);
  const svgRef = useRef<any>(null);
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

  // PDF 이미지 로드
  const loadPdfImages = async () => {
    try {
      setLoading(true);
      
      // 1. 서버에서 PDF 이미지 URL들 가져오기
      const response = await api.get(`/api/files/${file.id}/images`);
      
      if (response.data.images && response.data.images.length > 0) {
        // 이미지가 있으면 사용
        setPdfImages(response.data.images);
      } else {
        // 이미지가 없으면 원본 PDF URI 사용 (WebView용)
        setPdfImages([fileUri]);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('PDF 이미지 로드 실패:', error);
      // 실패 시 원본 PDF URI 사용
      setPdfImages([fileUri]);
      setLoading(false);
    }
  };

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

  // 굵기 변경
  const changeWidth = (width: number) => {
    setCurrentWidth(width);
  };

  // 지우개 기능
  const eraseAtPoint = (x: number, y: number) => {
    const eraserRadius = 20;
    const currentPaths = Array.isArray(drawingPaths) ? drawingPaths : [];
    
    const updatedPaths = currentPaths.filter((path) => {
      return !isPathInEraserRange(path, x, y, eraserRadius);
    });
    
    if (updatedPaths.length !== currentPaths.length) {
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

  // 확대/축소 핸들러
  const handleScale = (scale: number) => {
    setScale(Math.max(0.5, Math.min(3, scale)));
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
      page: currentPage + 1,
    };
    
    const currentPaths = Array.isArray(drawingPaths) ? drawingPaths : [];
    const updatedPaths = [...currentPaths, newPath];
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

  // 요약 PDF 로드
  const loadSummaryPdf = async () => {
    try {
      const response = await api.get(`/api/files/${file.id}/summary`);
      if (response.data.summaryPdfUri) {
        setShowSummary(true);
      }
    } catch (error) {
      console.log('요약 PDF 없음:', error);
    }
  };

  useEffect(() => {
    loadAnnotations();
    loadPdfImages();
    loadSummaryPdf();
  }, [file.id]);

  // 메인 PDF 뷰어 (이미지+SVG)
  const renderMainPdf = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={subjectColor} />
          <Text style={styles.loadingText}>PDF를 불러오는 중...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color="#ff4444" />
          <Text style={styles.errorText}>{error}</Text>
          <Text style={styles.errorSubText}>파일을 다시 확인해주세요.</Text>
        </View>
      );
    }

    return (
      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        bounces={true}
        maximumZoomScale={3}
        minimumZoomScale={0.5}
      >
        <View style={styles.pdfWrapper} {...panResponder.panHandlers}>
          {/* PDF 이미지들 */}
          {pdfImages.map((imageUri, index) => (
            <View key={index} style={styles.pageContainer}>
              <Image
                source={{ uri: imageUri }}
                style={[styles.pdfImage, { 
                  width: screenWidth - 40,
                  height: screenHeight * 0.8,
                  transform: [{ scale }]
                }]}
                resizeMode="contain"
              />
              
              {/* SVG 필기 오버레이 */}
              <View style={styles.svgOverlay}>
                <Svg
                  ref={svgRef}
                  style={styles.svg}
                  width={screenWidth - 40}
                  height={screenHeight * 0.8}
                >
                  {/* 저장된 필기 경로들 */}
                  {Array.isArray(drawingPaths) && drawingPaths
                    .filter(path => path.page === index + 1)
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
          ))}
        </View>
      </ScrollView>
    );
  };

  // 요약 PDF 뷰어 (WebView)
  const renderSummaryPdf = () => {
    if (!summaryPdfUri) {
      return (
        <View style={styles.noSummaryContainer}>
          <Ionicons name="document-text" size={48} color="#ccc" />
          <Text style={styles.noSummaryText}>요약 PDF가 없습니다</Text>
        </View>
      );
    }

    return (
      <WebView
        source={{ uri: summaryPdfUri }}
        style={styles.summaryWebView}
        onLoadStart={() => console.log('요약 PDF 로딩 시작')}
        onLoadEnd={() => console.log('요약 PDF 로딩 완료')}
        onError={(error) => console.log('요약 PDF 로딩 에러:', error)}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.webViewLoading}>
            <ActivityIndicator size="large" color={subjectColor} />
            <Text>요약 PDF를 불러오는 중...</Text>
          </View>
        )}
      />
    );
  };

  return (
    <View style={styles.container}>
      {showSummary ? (
        // 2분할 화면
        <View style={styles.splitContainer}>
          {/* 메인 PDF (이미지+SVG) */}
          <View style={[styles.mainPdfContainer, { flex: splitRatio }]}>
            {renderMainPdf()}
          </View>
          
          {/* 분할 조절 바 */}
          <TouchableOpacity
            style={styles.splitBar}
            onPress={() => {
              const newRatio = splitRatio === 0.5 ? 0.7 : splitRatio === 0.7 ? 0.3 : 0.5;
              setSplitRatio(newRatio);
            }}
          >
            <View style={styles.splitBarHandle} />
          </TouchableOpacity>
          
          {/* 요약 PDF (WebView) */}
          <View style={[styles.summaryContainer, { flex: 1 - splitRatio }]}>
            {renderSummaryPdf()}
          </View>
        </View>
      ) : (
        // 단일 화면 (메인 PDF만)
        <View style={styles.singleContainer}>
          {renderMainPdf()}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  splitContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  singleContainer: {
    flex: 1,
  },
  mainPdfContainer: {
    flex: 1,
  },
  summaryContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  splitBar: {
    width: 8,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  splitBarHandle: {
    width: 4,
    height: 40,
    backgroundColor: subjectColor || '#007AFF',
    borderRadius: 2,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  pdfWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  pdfImage: {
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  svgOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    pointerEvents: 'none',
  },
  svg: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  summaryWebView: {
    flex: 1,
  },
  webViewLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  noSummaryContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noSummaryText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ff4444',
    marginTop: 16,
    textAlign: 'center',
  },
  errorSubText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
});
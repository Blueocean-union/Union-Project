import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  PanResponder,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path, Circle, Text as SvgText, G } from 'react-native-svg';
import * as WebBrowser from 'expo-web-browser';
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

interface PdfViewerScreenProps {
  file: FileItem;
  fileUri: string;
  subjectColor: string;
  currentTool: string;
  currentColor: string;
}

export default function PdfViewerScreen({ 
  file, 
  fileUri, 
  subjectColor, 
  currentTool, 
  currentColor 
}: PdfViewerScreenProps) {
  const [loading, setLoading] = useState(true);
  const [pdfImageUri, setPdfImageUri] = useState<string>('');
  const [drawingPaths, setDrawingPaths] = useState<DrawingPath[]>([]);
  const [currentPath, setCurrentPath] = useState<string>('');
  const [isDrawing, setIsDrawing] = useState(false);
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
      console.log('📝 필기 데이터 응답:', response.data);
      
      // 응답 데이터가 배열인지 확인하고, 아니면 빈 배열로 설정
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

  // 지우개 기능: 특정 위치의 필기 지우기
  const eraseAtPoint = (x: number, y: number) => {
    const eraserRadius = 20; // 지우개 반경
    const currentPaths = Array.isArray(drawingPaths) ? drawingPaths : [];
    
    // 터치한 위치에서 반경 내에 있는 필기 경로들을 찾아서 제거
    const updatedPaths = currentPaths.filter((path) => {
      // 간단한 거리 계산으로 지우개 영역 내의 경로 제거
      // 실제로는 더 정교한 SVG 경로 분석이 필요할 수 있음
      return !isPathInEraserRange(path, x, y, eraserRadius);
    });
    
    if (updatedPaths.length !== currentPaths.length) {
      setDrawingPaths(updatedPaths);
      saveAnnotations(updatedPaths);
    }
  };

  // 경로가 지우개 범위 내에 있는지 확인
  const isPathInEraserRange = (path: DrawingPath, x: number, y: number, radius: number) => {
    // SVG 경로에서 좌표를 추출하여 거리 계산
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
    if (currentTool === 'eraser') {
      // 지우개 모드: 터치한 위치의 필기 지우기
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
      // 지우개 모드: 드래그하면서 지우기
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

  useEffect(() => {
    loadAnnotations();
    convertPdfToImage();
  }, [file.id]);

  return (
    <View style={styles.container}>
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
                {Array.isArray(drawingPaths) && drawingPaths.map((path) => (
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

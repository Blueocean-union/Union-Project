// import React, { useState, useRef, useEffect, useCallback } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   Dimensions,
//   PanResponder,
//   Alert,
//   Platform,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { Ionicons } from '@expo/vector-icons';
// import { useNavigation } from '@react-navigation/native';
// import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
// import type { SubjectStackParamList } from '../../types/navigation';
// import Pdf from 'react-native-pdf';
// import Svg, { Path, Circle } from 'react-native-svg';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import api from '../../libs/api/axios';
// import TemporaryAudio from '../screens_spare/temporaryAudio';

// interface FileItem {
//   id: number;
//   folderId: number;
//   originalFileName: string;
//   contentType: string;
//   size: number;
//   updatedAt: string;
//   deleted: boolean;
// }

// interface DrawingPath {
//   id: string;
//   path: string;
//   color: string;
//   width: number;
//   tool: string;
// }

// interface DrawingPoint {
//   x: number;
//   y: number;
// }

// interface PDFDrawingScreenProps {
//   route: {
//     params: {
//       file: FileItem;
//       fileUri: string;
//       subjectColor: string;
//     };
//   };
// }

// type NavigationProp = NativeStackNavigationProp<SubjectStackParamList, 'PDFDrawing'>;

// export default function PDFDrawingScreen({ route }: PDFDrawingScreenProps) {
//   const { file, fileUri, subjectColor } = route.params;
//   const navigation = useNavigation<NavigationProp>();
  
//   // 디버깅 로그 제거됨
  
//   // PDF 관련 상태
//   const [totalPages, setTotalPages] = useState(0);
//   const [scale, setScale] = useState(1);
//   const [loading, setLoading] = useState(false); // 초기 로딩 상태를 false로 변경
//   const [error, setError] = useState<string | null>(null);
//   const [pdfLoaded, setPdfLoaded] = useState(false); // PDF 로드 상태 추가
//   const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 }); // PDF 실제 렌더 크기
  
//   // 필기 관련 상태
//   const [currentTool, setCurrentTool] = useState('pen');
//   const [currentColor, setCurrentColor] = useState('#ff0000');
//   const [currentWidth, setCurrentWidth] = useState(2);
//   const [drawingPaths, setDrawingPaths] = useState<DrawingPath[]>([]);
//   const [currentPath, setCurrentPath] = useState<string>('');
//   const [isDrawing, setIsDrawing] = useState(false);
//   const [currentPoints, setCurrentPoints] = useState<DrawingPoint[]>([]);
  
//   // 음성녹음 상태
//   const [showAudioRecorder, setShowAudioRecorder] = useState(false);
  
//   // Refs
//   const pdfRef = useRef<any>(null);
//   const svgRef = useRef<any>(null);
//   const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

//   // 필기 데이터 로드
//   const loadAnnotations = useCallback(async () => {
//     try {
//       // annotation API는 별도의 토큰 처리
//       const token = await AsyncStorage.getItem('accessToken');
      
//       const response = await fetch(`http://52.78.209.115:8080/api/annotations/${file.id}`, {
//         method: 'GET',
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json',
//         },
//       });

//       if (!response.ok) {
//         throw new Error(`Annotation API 실패: ${response.status}`);
//       }

//       const data = await response.json();
//       console.log('📝 필기 데이터 응답:', data);
      
//       if (Array.isArray(data)) {
//         setDrawingPaths(data);
//       } else if (data && Array.isArray(data.annotations)) {
//         setDrawingPaths(data.annotations);
//       } else {
//         setDrawingPaths([]);
//       }
//     } catch (error) {
//       console.log('필기 데이터 없음 또는 로드 실패:', error);
//       setDrawingPaths([]);
//     }
//   }, [file.id]);

//   // 필기 데이터 저장
//   const saveAnnotations = useCallback(async (newPaths: DrawingPath[]) => {
//     try {
//       // annotation API는 별도의 토큰 처리
//       const token = await AsyncStorage.getItem('accessToken');
//       console.log('📝 Annotation 저장 API 토큰 상태:', token ? '존재함' : '없음');
      
//       const response = await fetch(`http://52.78.209.115:8080/api/annotations/${file.id}`, {
//         method: 'POST',
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           annotations: newPaths
//         }),
//       });

//       if (!response.ok) {
//         throw new Error(`Annotation 저장 API 실패: ${response.status}`);
//       }

//       setDrawingPaths(newPaths);
//       console.log('✅ 필기 데이터 저장 성공');
//     } catch (error) {
//       console.error('필기 데이터 저장 실패:', error);
//       console.error('필기 저장 실패:', error);
//     }
//   }, [file.id]);

//   // 액션 버튼 핸들러
//   const handleVoiceRecord = () => {
//     console.log('음성녹음 버튼 눌림');
//     setShowAudioRecorder(true);
//   };

//   const handleSummarize = () => {
//     console.log('요약하기 버튼 눌림');
//     navigation.navigate('FileSummury', {
//       file: file,
//       subjectColor: subjectColor,
//     });
//   };

//   // 툴바 핸들러
//   const handleToolChange = (tool: string) => {
//     setCurrentTool(tool);
//   };

//   const handleColorChange = (color: string) => {
//     setCurrentColor(color);
//   };

//   const handleClearAnnotations = () => {
//     Alert.alert(
//       '필기 지우기',
//       '모든 필기를 지우시겠습니까?',
//       [
//         { text: '취소', style: 'cancel' },
//         {
//           text: '지우기',
//           style: 'destructive',
//           onPress: () => {
//             setDrawingPaths([]);
//             saveAnnotations([]);
//           },
//         },
//       ]
//     );
//   };

//   // 경로가 지우개 범위 내에 있는지 확인
//   const isPathInEraserRange = useCallback((path: DrawingPath, x: number, y: number, radius: number) => {
//     const pathData = path.path;
//     const coordinates = pathData.match(/(\d+\.?\d*),(\d+\.?\d*)/g);
    
//     if (!coordinates) return false;
    
//     for (const coord of coordinates) {
//       const [px, py] = coord.split(',').map(Number);
//       const distance = Math.sqrt((px - x) ** 2 + (py - y) ** 2);
//       if (distance <= radius) {
//         return true;
//       }
//     }
//     return false;
//   }, []);

//   // 지우개 기능
//   const eraseAtPoint = useCallback((x: number, y: number) => {
//     const eraserRadius = 30; // 지우개 반경 증가
    
//     console.log('🧹 지우개 사용:', x, y, '반경:', eraserRadius);
    
//     const updatedPaths = drawingPaths.filter((path) => {
//       const shouldKeep = !isPathInEraserRange(path, x, y, eraserRadius);
//       if (!shouldKeep) {
//         console.log('🗑️ 경로 삭제:', path.id);
//       }
//       return shouldKeep;
//     });
    
//     if (updatedPaths.length !== drawingPaths.length) {
//       console.log('🧹 지우개 결과:', drawingPaths.length, '->', updatedPaths.length);
//       setDrawingPaths(updatedPaths);
//       saveAnnotations(updatedPaths);
//     }
//   }, [drawingPaths, isPathInEraserRange, saveAnnotations]);

//   // 그리기 시작
//   const startDrawing = useCallback((x: number, y: number) => {
//     console.log('🖊️ startDrawing 호출:', { x, y, currentTool });
    
//     if (currentTool === 'eraser') {
//       eraseAtPoint(x, y);
//       return;
//     }
    
//     setIsDrawing(true);
//     setCurrentPoints([{ x, y }]);
//     setCurrentPath(`M${x},${y}`);
    
//     // 하이라이터 도구일 때 선 두께 조정
//     if (currentTool === 'highlighter') {
//       setCurrentWidth(8);
//     } else if (currentTool === 'pen') {
//       setCurrentWidth(2);
//     }
    
//     console.log('🖊️ 그리기 시작됨:', { isDrawing: true, currentPath: `M${x},${y}` });
//   }, [currentTool, eraseAtPoint]);

//   // 그리기 중
//   const continueDrawing = useCallback((x: number, y: number) => {
//     if (currentTool === 'eraser') {
//       eraseAtPoint(x, y);
//       return;
//     }
    
//     if (!isDrawing) {
//       console.log('⚠️ 그리기 중이 아님 - continueDrawing 무시');
//       return;
//     }
    
//     const newPoints = [...currentPoints, { x, y }];
//     setCurrentPoints(newPoints);
    
//     if (currentTool === 'pen' || currentTool === 'highlighter') {
//       // 부드러운 곡선을 위해 이전 점과 현재 점 사이에 제어점 추가
//       if (currentPoints.length > 0) {
//         const prevPoint = currentPoints[currentPoints.length - 1];
//         const controlX = (prevPoint.x + x) / 2;
//         const controlY = (prevPoint.y + y) / 2;
//         setCurrentPath(prev => `${prev} Q${controlX},${controlY} ${x},${y}`);
//       } else {
//         setCurrentPath(prev => `${prev} L${x},${y}`);
//       }
//     }
    
//     console.log('🖊️ 그리기 계속:', { x, y, currentPath: currentPath });
//   }, [currentTool, isDrawing, currentPoints, eraseAtPoint, currentPath]);

//   // 그리기 종료
//   const endDrawing = useCallback(() => {
//     if (!isDrawing) {
//       console.log('⚠️ 그리기 중이 아님 - endDrawing 무시');
//       return;
//     }
    
//     console.log('🖊️ 그리기 종료 - 경로 저장:', currentPath);
    
//     const newPath: DrawingPath = {
//       id: Date.now().toString(),
//       path: currentPath,
//       color: currentColor,
//       width: currentWidth,
//       tool: currentTool,
//     };
    
//     const updatedPaths = [...drawingPaths, newPath];
//     setDrawingPaths(updatedPaths);
//     saveAnnotations(updatedPaths);
    
//     setIsDrawing(false);
//     setCurrentPath('');
//     setCurrentPoints([]);
    
//     console.log('✅ 그리기 완료 - 총 경로 수:', updatedPaths.length);
//   }, [isDrawing, currentPath, currentColor, currentWidth, currentTool, drawingPaths, saveAnnotations]);

//   // 제스처 감지를 위한 상태
//   const [isDrawingMode, setIsDrawingMode] = useState(false);
//   const [touchStartTime, setTouchStartTime] = useState(0);
//   const [touchStartPosition, setTouchStartPosition] = useState({ x: 0, y: 0 });
//   const [hasMoved, setHasMoved] = useState(false);
  

//   // PanResponder 설정 - 필기 모드에서만 활성화
//   const panResponder = useCallback(() => PanResponder.create({
//     onStartShouldSetPanResponder: (evt) => {
//       const touches = evt.nativeEvent.touches;
      
//       // 필기 모드가 아닌 경우 PDF 기본 기능 사용
//       if (!isDrawingMode) {
//         return false;
//       }
      
//       // 필기 모드에서만 터치 이벤트 처리
//       if (touches.length === 1) {
//         const { locationX, locationY } = evt.nativeEvent;
//         setTouchStartTime(Date.now());
//         setTouchStartPosition({ x: locationX, y: locationY });
//         setHasMoved(false);
//         return true;
//       }
      
//       return false;
//     },
//     onMoveShouldSetPanResponder: (evt, gestureState) => {
//       // 필기 모드가 아닌 경우 PDF 기본 기능 사용
//       if (!isDrawingMode) {
//         return false;
//       }
      
//       const touches = evt.nativeEvent.touches;
      
//       // 필기 모드에서만 움직임 처리
//       if (touches.length === 1) {
//         const { locationX, locationY } = evt.nativeEvent;
//         const deltaX = Math.abs(locationX - touchStartPosition.x);
//         const deltaY = Math.abs(locationY - touchStartPosition.y);
        
//         // 움직임이 감지되면 hasMoved 업데이트
//         if (deltaX > 5 || deltaY > 5) {
//           setHasMoved(true);
//         }
        
//         return true;
//       }
      
//       return false;
//     },
//     onPanResponderGrant: (evt) => {
//       if (isDrawingMode) {
//         const { locationX, locationY } = evt.nativeEvent;
//         console.log('🖊️ 그리기 시작:', locationX, locationY);
//         startDrawing(locationX, locationY);
//       }
//     },
//     onPanResponderMove: (evt) => {
//       if (isDrawingMode) {
//         const { locationX, locationY } = evt.nativeEvent;
//         continueDrawing(locationX, locationY);
//       }
//     },
//     onPanResponderRelease: () => {
//       if (isDrawingMode) {
//         console.log('🖊️ 그리기 종료');
//         endDrawing();
//       }
//     },
//   }), [isDrawingMode, startDrawing, continueDrawing, endDrawing, touchStartPosition]);


//   // useEffect로 필기 데이터 로드
//   useEffect(() => {
//     console.log('🔄 useEffect 실행 - loadAnnotations 호출');
//     loadAnnotations();
//   }, [loadAnnotations]); // loadAnnotations 함수가 변경될 때만 실행

//   // PDF 컴포넌트 렌더링 조건 디버깅 (개발용 - 필요시 주석 해제)
//   // useEffect(() => {
//   //   console.log('🔍 PDF 렌더링 조건 체크:');
//   //   console.log('  - loading:', loading);
//   //   console.log('  - error:', error);
//   //   console.log('  - fileUri:', fileUri);
//   //   console.log('  - pdfLoaded:', pdfLoaded);
//   //   console.log('  - 렌더링 가능:', !loading && !error && fileUri);
//   // }, [loading, error, fileUri, pdfLoaded]);

//   return (
//     <SafeAreaView style={styles.container}>
//       {/* 상단 헤더 */}
//       <View style={[styles.header, { backgroundColor: subjectColor }]}>
//         <TouchableOpacity
//           style={styles.backButton}
//           onPress={() => navigation.goBack()}
//         >
//           <Ionicons name="arrow-back" size={24} color="white" />
//         </TouchableOpacity>
//         <Text style={styles.headerTitle} numberOfLines={1}>
//           {file.originalFileName}
//         </Text>
//         <View style={styles.headerRight}>
//           <TouchableOpacity 
//             style={styles.headerActionButton}
//             onPress={handleVoiceRecord}
//           >
//             <Ionicons name="mic" size={20} color="white" />
//             <Text style={styles.headerActionText}>음성녹음</Text>
//           </TouchableOpacity>
//           <TouchableOpacity 
//             style={styles.headerActionButton}
//             onPress={handleSummarize}
//           >
//             <Ionicons name="create" size={20} color="white" />
//             <Text style={styles.headerActionText}>요약하기</Text>
//           </TouchableOpacity>
//         </View>
//       </View>

//       {/* 색상 팔레트 + 툴바 (한 줄) */}
//       <View style={[styles.toolbarContainer, { backgroundColor: subjectColor }]}>
//         <View style={styles.colorRow}>
//           {isDrawingMode && ['#000000', '#ffffff', '#ff0000', '#0000ff', '#00ff00', '#ffff00', '#ff00ff', '#00ffff'].map((color) => (
//             <TouchableOpacity
//               key={color}
//               style={[styles.colorButton, { backgroundColor: color }, currentColor === color && styles.selectedColor]}
//               onPress={() => handleColorChange(color)}
//             />
//           ))}
//           {!isDrawingMode && (
//             <Text style={styles.modeIndicator}>드래그 모드 - PDF 기본 제스처 사용 가능</Text>
//           )}
//         </View>
        
//         <View style={styles.toolGroup}>
//           {isDrawingMode && (
//             <>
//               <TouchableOpacity
//                 style={[styles.toolButton, currentTool === 'pen' && styles.activeTool]}
//                 onPress={() => handleToolChange('pen')}
//               >
//                 <Ionicons name="create" size={20} color="white" />
//               </TouchableOpacity>
              
//               <TouchableOpacity
//                 style={[styles.toolButton, currentTool === 'highlighter' && styles.activeTool]}
//                 onPress={() => handleToolChange('highlighter')}
//               >
//                 <Ionicons name="brush" size={20} color="white" />
//               </TouchableOpacity>
              
//               <TouchableOpacity
//                 style={[styles.toolButton, currentTool === 'eraser' && styles.activeTool]}
//                 onPress={() => handleToolChange('eraser')}
//               >
//                 <Ionicons name="remove-circle-outline" size={20} color="white" />
//               </TouchableOpacity>
              
//               <TouchableOpacity
//                 style={[styles.toolButton]}
//                 onPress={handleClearAnnotations}
//               >
//                 <Ionicons name="trash-outline" size={20} color="white" />
//               </TouchableOpacity>
//             </>
//           )}
          
//           <TouchableOpacity
//             style={[styles.toolButton, isDrawingMode && styles.activeTool]}
//             onPress={() => setIsDrawingMode(!isDrawingMode)}
//           >
//             <Ionicons name="swap-horizontal" size={20} color="white" />
//           </TouchableOpacity>
//         </View>
//       </View>

//       {/* PDF 뷰어 영역 */}
//       <View style={styles.pdfViewerContainer}>
//         {loading && (
//           <View style={styles.loadingContainer}>
//             <Text style={styles.loadingText}>PDF 로딩 중...</Text>
//           </View>
//         )}
        
//         {error && (
//           <View style={styles.errorContainer}>
//             <Text style={styles.errorText}>{error}</Text>
//             <TouchableOpacity 
//               style={styles.retryButton}
//               onPress={() => {
//                 setError(null);
//                 setLoading(true);
//               }}
//             >
//               <Text style={styles.retryButtonText}>다시 시도</Text>
//             </TouchableOpacity>
//           </View>
//         )}
        
//         {fileUri && (
//           <View 
//             style={styles.pdfContainer}
//             onLayout={(e) => {
//               const { width, height } = e.nativeEvent.layout;
//               setCanvasSize({ width, height });
//               console.log('📐 PDF 컨테이너 크기:', width, 'x', height);
//             }}
//           >
//             {loading && (
//               <View style={styles.loadingOverlay}>
//                 <Text style={styles.loadingText}>PDF 로딩 중...</Text>
//               </View>
//             )}
            
//             <Pdf
//                 ref={pdfRef}
//                 source={{ 
//                   uri: fileUri,
//                   cache: false,
//                   cacheFileName: `pdf_${file.id}_${Date.now()}.pdf`
//                 }}
//                 style={[StyleSheet.absoluteFill, { backgroundColor: 'white' }]}
//                 onLoadComplete={(numberOfPages, width, height) => {
//                   console.log('✅ PDF 로드 완료:', numberOfPages, '페이지');
//                   console.log('📄 PDF 크기:', width, 'x', height);
//                   setTotalPages(numberOfPages);
//                   setLoading(false);
//                   setError(null);
//                   setPdfLoaded(true);
//                 }}
//                 onError={(error: any) => {
//                   console.error('❌ PDF 로드 오류:', error);
//                   console.error('❌ 오류 상세:', error);
//                   console.error('❌ 파일 URI:', fileUri);
//                   setError(error.message || 'PDF 로드 중 오류가 발생했습니다.');
//                   setLoading(false);
//                   setPdfLoaded(false);
//                 }}
//                 onLoadProgress={(percent) => {
//                   console.log('📊 PDF 로딩 진행률:', percent + '%');
//                   if (percent < 100) {
//                     setLoading(true);
//                   }
//                 }}
//                 onPageChanged={(page, numberOfPages) => {
//                   // 페이지 변경 로그 제거됨
//                 }}
//                 enablePaging={false}
//                 enableRTL={false}
//                 enableAntialiasing={true}
//                 enableAnnotationRendering={true}
//                 enableDoubleTapZoom={true}
//                 password=""
//                 spacing={0}
//                 scale={scale}
//                 minScale={0.5}
//                 maxScale={3}
//                 horizontal={false}
//                 onScaleChanged={(scale) => {
//                   console.log('📏 스케일 변경:', scale);
//                   setScale(scale);
//                 }}
//               />
            
            
//             {/* SVG 필기 오버레이 - PDF 위에 절대 위치 */}
//             <View 
//               style={[
//                 StyleSheet.absoluteFill, 
//                 { pointerEvents: isDrawingMode ? 'auto' : 'none' }
//               ]} 
//               {...(isDrawingMode ? panResponder().panHandlers : {})}
//             >
//               <Svg
//                 ref={svgRef}
//                 width={canvasSize.width || screenWidth}
//                 height={canvasSize.height || screenHeight - 200}
//               >
//                 {/* 저장된 필기 경로들 */}
//                 {drawingPaths.map((path) => (
//                   <Path
//                     key={path.id}
//                     d={path.path}
//                     stroke={path.color}
//                     strokeWidth={path.width}
//                     fill="none"
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     opacity={path.tool === 'highlighter' ? 0.5 : 1}
//                   />
//                 ))}
                
//                 {/* 현재 그리는 경로 */}
//                 {isDrawing && currentPath && (
//                   <Path
//                     d={currentPath}
//                     stroke={currentColor}
//                     strokeWidth={currentWidth}
//                     fill="none"
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     opacity={currentTool === 'highlighter' ? 0.5 : 1}
//                   />
//                 )}
                
//                 {/* 현재 그리는 점들 */}
//                 {isDrawing && currentTool === 'pen' && currentPoints.map((point, index) => (
//                   <Circle
//                     key={index}
//                     cx={point.x}
//                     cy={point.y}
//                     r={currentWidth / 2}
//                     fill={currentColor}
//                   />
//                 ))}
//               </Svg>
//             </View>
//           </View>
//         )}
//       </View>

//       {/* 음성녹음 모달 */}
//       <TemporaryAudio
//         visible={showAudioRecorder}
//         onClose={() => setShowAudioRecorder(false)}
//         subjectColor={subjectColor}
//       />

//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f5f5f5',
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingTop: 10,
//     paddingBottom: 12,
//     paddingHorizontal: 16,
//   },
//   backButton: {
//     marginRight: 12,
//   },
//   headerTitle: {
//     flex: 1,
//     fontSize: 18,
//     fontWeight: '600',
//     color: 'white',
//   },
//   headerRight: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 16,
//   },
//   headerActionButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 4,
//   },
//   headerActionText: {
//     color: 'white',
//     fontSize: 12,
//     fontWeight: '500',
//   },
//   toolbarContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingVertical: 12,
//     paddingHorizontal: 16,
//   },
//   colorRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 12,
//   },
//   toolGroup: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 12,
//   },
//   toolButton: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: 'rgba(255, 255, 255, 0.2)',
//   },
//   activeTool: {
//     backgroundColor: 'rgba(255, 255, 255, 0.4)',
//   },
//   colorButton: {
//     width: 24,
//     height: 24,
//     borderRadius: 12,
//     borderWidth: 2,
//     borderColor: 'transparent',
//   },
//   selectedColor: {
//     borderColor: 'white',
//     borderWidth: 3,
//   },
//   pdfViewerContainer: {
//     flex: 1,
//     position: 'relative',
//   },
//   pdfContainer: {
//     flex: 1,
//     position: 'relative',
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#f5f5f5',
//   },
//   loadingOverlay: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: 'rgba(245, 245, 245, 0.9)',
//     zIndex: 10,
//   },
//   loadingText: {
//     fontSize: 16,
//     color: '#666',
//     marginTop: 10,
//   },
//   errorContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#f5f5f5',
//     padding: 20,
//   },
//   errorText: {
//     fontSize: 16,
//     color: '#ff0000',
//     textAlign: 'center',
//     marginBottom: 20,
//   },
//   retryButton: {
//     backgroundColor: '#4A90E2',
//     paddingHorizontal: 20,
//     paddingVertical: 10,
//     borderRadius: 5,
//   },
//   retryButtonText: {
//     color: 'white',
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   modeIndicator: {
//     color: 'white',
//     fontSize: 14,
//     fontWeight: '500',
//     textAlign: 'center',
//   },
// });
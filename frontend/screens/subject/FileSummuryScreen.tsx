// import React, { useState, useEffect, JSX } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   ScrollView,
//   ActivityIndicator,
//   Modal,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { Ionicons } from '@expo/vector-icons';
// import { useNavigation } from '@react-navigation/native';
// import type { NativeStackScreenProps } from '@react-navigation/native-stack';
// import type { SubjectStackParamList } from '../MainTabs';
// import api from '../../libs/api/axios';

// interface SummaryResponse {
//   id: number;
//   originalFileName: string;
//   summary: string;
//   createdAt: string | null;
// }

// type Props = NativeStackScreenProps<SubjectStackParamList, 'FileSummury'>;

// export default function FileSummuryScreen({ route }: Props) {
//   const { file, subjectColor } = route.params;
//   const navigation = useNavigation();
//   const [loading, setLoading] = useState(false);
//   const [summary, setSummary] = useState<SummaryResponse | null>(null);
//   const [error, setError] = useState<string | null>(null);

//   // PDF 요약 API 호출
//   const fetchSummary = async () => {
//     try {
//       setLoading(true);
//       setError(null);
      
      
//       // 파일 ID로 요약 요청 (FormData 대신)
//       const response = await api.post('/api/ai/pdfs/summary', {
//         fileId: file.id,
//         fileName: file.originalFileName
//       }, {
//         headers: {
//           'Content-Type': 'application/json',
//         },
//       });

//       setSummary(response.data);
//     } catch (error: any) {
//       setError(error.response?.data?.message || 'PDF 요약 중 오류가 발생했습니다.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // 마크다운 텍스트를 React Native Text 컴포넌트로 렌더링
//   const renderMarkdown = (text: string) => {
//     const lines = text.split('\n');
//     const elements: JSX.Element[] = [];
//     let key = 0;

//     lines.forEach((line, index) => {
//       const trimmedLine = line.trim();
      
//       if (trimmedLine.startsWith('### ')) {
//         // H3 헤더
//         elements.push(
//           <Text key={key++} style={styles.h3}>
//             {trimmedLine.substring(4)}
//           </Text>
//         );
//       } else if (trimmedLine.startsWith('#### ')) {
//         // H4 헤더
//         elements.push(
//           <Text key={key++} style={styles.h4}>
//             {trimmedLine.substring(5)}
//           </Text>
//         );
//       } else if (trimmedLine.startsWith('- **')) {
//         // 볼드 텍스트가 포함된 리스트 아이템
//         const parts = trimmedLine.split('**');
//         const listItem: JSX.Element[] = [];
        
//         for (let i = 0; i < parts.length; i++) {
//           if (i % 2 === 1) {
//             // 홀수 인덱스는 볼드 텍스트
//             listItem.push(
//               <Text key={i} style={styles.boldText}>
//                 {parts[i]}
//               </Text>
//             );
//           } else {
//             // 짝수 인덱스는 일반 텍스트
//             listItem.push(
//               <Text key={i} style={styles.normalText}>
//                 {parts[i]}
//               </Text>
//             );
//           }
//         }
        
//         elements.push(
//           <Text key={key++} style={styles.listItem}>
//             • {listItem}
//           </Text>
//         );
//       } else if (trimmedLine.startsWith('- ')) {
//         // 일반 리스트 아이템
//         elements.push(
//           <Text key={key++} style={styles.listItem}>
//             • {trimmedLine.substring(2)}
//           </Text>
//         );
//       } else if (trimmedLine.startsWith('  - ')) {
//         // 중첩 리스트 아이템
//         elements.push(
//           <Text key={key++} style={styles.nestedListItem}>
//             • {trimmedLine.substring(4)}
//           </Text>
//         );
//       } else if (trimmedLine.length > 0) {
//         // 일반 텍스트
//         elements.push(
//           <Text key={key++} style={styles.normalText}>
//             {trimmedLine}
//           </Text>
//         );
//       } else {
//         // 빈 줄
//         elements.push(
//           <Text key={key++} style={styles.emptyLine}>
//             {' '}
//           </Text>
//         );
//       }
//     });

//     return elements;
//   };

//   useEffect(() => {
//     fetchSummary();
//   }, []);

//   return (
//     <Modal
//       visible={true}
//       animationType="slide"
//       presentationStyle="pageSheet"
//     >
//       <SafeAreaView style={styles.container}>
//         {/* 헤더 */}
//         <View style={[styles.header, { backgroundColor: subjectColor }]}>
//           <TouchableOpacity
//             style={styles.closeButton}
//             onPress={() => navigation.goBack()}
//           >
//             <Ionicons name="close" size={24} color="white" />
//           </TouchableOpacity>
//           <Text style={styles.headerTitle} numberOfLines={1}>
//             PDF 요약
//           </Text>
//           <View style={styles.headerRight} />
//         </View>

//         {/* 내용 */}
//         <View style={styles.content}>
//           {loading && (
//             <View style={styles.loadingContainer}>
//               <ActivityIndicator size="large" color={subjectColor} />
//               <Text style={styles.loadingText}>PDF를 분석하고 요약 중...</Text>
//             </View>
//           )}

//           {error && !summary && (
//             <ScrollView style={styles.summaryContainer} showsVerticalScrollIndicator={true}>
//               <View style={styles.fileInfo}>
//                 <Ionicons name="document-text" size={20} color="#666" />
//                 <Text style={styles.fileName}>제 03장 메시지 처리.pdf</Text>
//               </View>
            
              
//               <View style={styles.summaryContent}>
//                 {renderMarkdown(`### 제3장 메시지 처리 요약

// #### 3.1 메시지 처리의 기본 개념
// - **메시지**: 발생된 이벤트의 종류와 정보를 전달하는 상수 값.
// - **윈도우 프로그래밍**: 메시지 처리가 핵심.
// - **메시지 종류**:
//   - **윈도우 메시지**: WM_으로 시작하며, 매개변수에 따라 처리 방식 결정.
//   - **입력 메시지**: 마우스 및 키보드 입력 발생 시 발생.
//   - **컨트롤 통지 메시지**: 제어 객체에서 부모 윈도우로 전송.
//   - **명령 메시지**: 사용자 인터페이스 객체에서 발생하는 WM_COMMAND 메시지.

// #### 3.2 메시지 박스
// - **AfxMessageBox() 함수**: 간단한 메시지를 출력하는 대화상자.
//   - 매개변수: 출력 문자열, 버튼 스타일, 도움말 ID.
//   - 버튼 스타일 예시: MB_OK, MB_YESNO 등.
//   - 아이콘 스타일 예시: MB_ICONHAND, MB_ICONQUESTION 등.

// #### 3.3 마우스 메시지
// - **마우스 메시지 핸들러**: WM_MOUSEMOVE, WM_LBUTTONDBLCLK 등.
// - **nFlags**: 마우스 버튼 및 키 상태 정보.
// - **CPoint**: 클라이언트 영역 좌표 값.

// #### 3.4 키보드 메시지
// - **키보드 메시지 핸들러**: WM_KEYDOWN, WM_CHAR 등.
// - 메시지 발생 순서: WM_KEYDOWN → WM_CHAR → WM_KEYUP.

// ### 실습 내용
// - **실습 3-1**: 메시지 박스 생성.
//   - 윈도우 생성 및 종료 시 메시지 박스 출력.
//   - 더블 클릭 시 메시지 박스 출력.
  
// - **실습 3-2**: 디지털 시계 만들기.
//   - 타이머를 설정하여 1초마다 현재 시간 출력.
//   - 왼쪽 마우스 클릭으로 시간 표시 형태 변경.
//   - 오른쪽 마우스 클릭으로 시계 동작 여부 결정.
  
// - **실습 3-3**: 문자를 입력하고 이동시키기.
//   - 키보드 입력으로 문자열 작성 및 이동.
//   - 마우스 클릭으로 문자열 위치 변경 및 삭제 기능 구현.

// ### 클래스 마법사
// - **기능**: 명령 메시지 설정, 메시지 매핑, 가상함수 및 멤버변수 설정.
// - **메시지 핸들러 함수 생성 방법**: WM_CREATE 메시지 핸들러 추가 및 구현.

// ### 연습문제
// - **스톱워치 기능**: 마우스와 키보드로 제어 가능한 스톱워치 프로그램 작성.`)}
//               </View>
//             </ScrollView>
//           )}

//           {summary && !loading && (
//             <ScrollView style={styles.summaryContainer} showsVerticalScrollIndicator={true}>
//               <View style={styles.fileInfo}>
//                 <Ionicons name="document-text" size={20} color="#666" />
//                 <Text style={styles.fileName}>{summary.originalFileName}</Text>
//               </View>
              
//               <View style={styles.summaryContent}>
//                 {renderMarkdown(summary.summary)}
//               </View>
//             </ScrollView>
//           )}

//           {error && summary && (
//             <ScrollView style={styles.summaryContainer} showsVerticalScrollIndicator={true}>
//               <View style={styles.fileInfo}>
//                 <Ionicons name="document-text" size={20} color="#666" />
//                 <Text style={styles.fileName}>제 03장 메시지 처리.pdf</Text>
//               </View>
              
//               <View style={styles.warningContainer}>
//                 <Ionicons name="warning" size={24} color="#ffa500" />
//                 <Text style={styles.warningText}>요약 생성 중 일부 오류가 발생했지만, 이전 요약을 표시합니다.</Text>
//               </View>
              
//               <View style={styles.summaryContent}>
//                 {renderMarkdown(`### 제3장 메시지 처리 요약

// #### 3.1 메시지 처리의 기본 개념
// - **메시지**: 발생된 이벤트의 종류와 정보를 전달하는 상수 값.
// - **윈도우 프로그래밍**: 메시지 처리가 핵심.
// - **메시지 종류**:
//   - **윈도우 메시지**: WM_으로 시작하며, 매개변수에 따라 처리 방식 결정.
//   - **입력 메시지**: 마우스 및 키보드 입력 발생 시 발생.
//   - **컨트롤 통지 메시지**: 제어 객체에서 부모 윈도우로 전송.
//   - **명령 메시지**: 사용자 인터페이스 객체에서 발생하는 WM_COMMAND 메시지.

// #### 3.2 메시지 박스
// - **AfxMessageBox() 함수**: 간단한 메시지를 출력하는 대화상자.
//   - 매개변수: 출력 문자열, 버튼 스타일, 도움말 ID.
//   - 버튼 스타일 예시: MB_OK, MB_YESNO 등.
//   - 아이콘 스타일 예시: MB_ICONHAND, MB_ICONQUESTION 등.

// #### 3.3 마우스 메시지
// - **마우스 메시지 핸들러**: WM_MOUSEMOVE, WM_LBUTTONDBLCLK 등.
// - **nFlags**: 마우스 버튼 및 키 상태 정보.
// - **CPoint**: 클라이언트 영역 좌표 값.

// #### 3.4 키보드 메시지
// - **키보드 메시지 핸들러**: WM_KEYDOWN, WM_CHAR 등.
// - 메시지 발생 순서: WM_KEYDOWN → WM_CHAR → WM_KEYUP.

// ### 실습 내용
// - **실습 3-1**: 메시지 박스 생성.
//   - 윈도우 생성 및 종료 시 메시지 박스 출력.
//   - 더블 클릭 시 메시지 박스 출력.
  
// - **실습 3-2**: 디지털 시계 만들기.
//   - 타이머를 설정하여 1초마다 현재 시간 출력.
//   - 왼쪽 마우스 클릭으로 시간 표시 형태 변경.
//   - 오른쪽 마우스 클릭으로 시계 동작 여부 결정.
  
// - **실습 3-3**: 문자를 입력하고 이동시키기.
//   - 키보드 입력으로 문자열 작성 및 이동.
//   - 마우스 클릭으로 문자열 위치 변경 및 삭제 기능 구현.

// ### 클래스 마법사
// - **기능**: 명령 메시지 설정, 메시지 매핑, 가상함수 및 멤버변수 설정.
// - **메시지 핸들러 함수 생성 방법**: WM_CREATE 메시지 핸들러 추가 및 구현.

// ### 연습문제
// - **스톱워치 기능**: 마우스와 키보드로 제어 가능한 스톱워치 프로그램 작성.`)}
//               </View>
//             </ScrollView>
//           )}
//         </View>
//       </SafeAreaView>
//     </Modal>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f8f9fa',
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingTop: 10,
//     paddingBottom: 12,
//     paddingHorizontal: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: 'rgba(255, 255, 255, 0.2)',
//   },
//   closeButton: {
//     marginRight: 12,
//   },
//   headerTitle: {
//     flex: 1,
//     fontSize: 18,
//     fontWeight: '600',
//     color: 'white',
//   },
//   headerRight: {
//     width: 36,
//   },
//   content: {
//     flex: 1,
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 20,
//   },
//   loadingText: {
//     marginTop: 16,
//     fontSize: 16,
//     color: '#666',
//     textAlign: 'center',
//   },
//   errorContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 20,
//   },
//   errorText: {
//     marginTop: 16,
//     fontSize: 16,
//     color: '#ff6b6b',
//     textAlign: 'center',
//     marginBottom: 20,
//   },
//   retryButton: {
//     paddingHorizontal: 20,
//     paddingVertical: 10,
//     borderRadius: 8,
//   },
//   retryButtonText: {
//     color: 'white',
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   summaryContainer: {
//     flex: 1,
//     padding: 16,
//   },
//   fileInfo: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 16,
//     padding: 12,
//     backgroundColor: 'white',
//     borderRadius: 8,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.1,
//     shadowRadius: 2,
//     elevation: 2,
//   },
//   fileName: {
//     marginLeft: 8,
//     fontSize: 14,
//     color: '#666',
//     flex: 1,
//   },
//   summaryContent: {
//     backgroundColor: 'white',
//     borderRadius: 8,
//     padding: 16,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.1,
//     shadowRadius: 2,
//     elevation: 2,
//   },
//   h3: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#2c3e50',
//     marginTop: 16,
//     marginBottom: 8,
//   },
//   h4: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#34495e',
//     marginTop: 12,
//     marginBottom: 6,
//   },
//   listItem: {
//     fontSize: 14,
//     color: '#2c3e50',
//     lineHeight: 22,
//     marginBottom: 6,
//   },
//   nestedListItem: {
//     fontSize: 14,
//     color: '#2c3e50',
//     lineHeight: 22,
//     marginBottom: 6,
//     marginLeft: 16,
//   },
//   boldText: {
//     fontWeight: 'bold',
//     color: '#2c3e50',
//   },
//   normalText: {
//     fontSize: 14,
//     color: '#2c3e50',
//     lineHeight: 22,
//     marginBottom: 8,
//   },
//   emptyLine: {
//     height: 8,
//   },
//   warningContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#fff3cd',
//     padding: 12,
//     margin: 16,
//     borderRadius: 8,
//     borderLeftWidth: 4,
//     borderLeftColor: '#ffa500',
//   },
//   warningText: {
//     fontSize: 14,
//     color: '#856404',
//     marginLeft: 8,
//     flex: 1,
//   },
// });

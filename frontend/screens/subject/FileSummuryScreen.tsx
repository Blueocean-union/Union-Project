import React, { useState, useEffect, JSX } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { SubjectStackParamList } from '../MainTabs';
import api from '../../libs/api/axios';

interface SummaryResponse {
  id: number;
  originalFileName: string;
  summary: string;
  createdAt: string | null;
}

type Props = NativeStackScreenProps<SubjectStackParamList, 'FileSummury'>;

export default function FileSummuryScreen({ route }: Props) {
  const { file, subjectColor } = route.params;
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<SummaryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // PDF 요약 API 호출
  const fetchSummary = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📄 PDF 요약 요청 시작:', file.originalFileName);
      
      // 파일 ID로 요약 요청 (FormData 대신)
      const response = await api.post('/api/ai/pdfs/summary', {
        fileId: file.id,
        fileName: file.originalFileName
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('✅ PDF 요약 응답:', response.data);
      setSummary(response.data);
    } catch (error: any) {
      console.error('❌ PDF 요약 실패:', error);
      setError(error.response?.data?.message || 'PDF 요약 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 마크다운 텍스트를 React Native Text 컴포넌트로 렌더링
  const renderMarkdown = (text: string) => {
    const lines = text.split('\n');
    const elements: JSX.Element[] = [];
    let key = 0;

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      if (trimmedLine.startsWith('### ')) {
        // H3 헤더
        elements.push(
          <Text key={key++} style={styles.h3}>
            {trimmedLine.substring(4)}
          </Text>
        );
      } else if (trimmedLine.startsWith('#### ')) {
        // H4 헤더
        elements.push(
          <Text key={key++} style={styles.h4}>
            {trimmedLine.substring(5)}
          </Text>
        );
      } else if (trimmedLine.startsWith('- **')) {
        // 볼드 텍스트가 포함된 리스트 아이템
        const parts = trimmedLine.split('**');
        const listItem: JSX.Element[] = [];
        
        for (let i = 0; i < parts.length; i++) {
          if (i % 2 === 1) {
            // 홀수 인덱스는 볼드 텍스트
            listItem.push(
              <Text key={i} style={styles.boldText}>
                {parts[i]}
              </Text>
            );
          } else {
            // 짝수 인덱스는 일반 텍스트
            listItem.push(
              <Text key={i} style={styles.normalText}>
                {parts[i]}
              </Text>
            );
          }
        }
        
        elements.push(
          <Text key={key++} style={styles.listItem}>
            • {listItem}
          </Text>
        );
      } else if (trimmedLine.startsWith('- ')) {
        // 일반 리스트 아이템
        elements.push(
          <Text key={key++} style={styles.listItem}>
            • {trimmedLine.substring(2)}
          </Text>
        );
      } else if (trimmedLine.startsWith('  - ')) {
        // 중첩 리스트 아이템
        elements.push(
          <Text key={key++} style={styles.nestedListItem}>
            • {trimmedLine.substring(4)}
          </Text>
        );
      } else if (trimmedLine.length > 0) {
        // 일반 텍스트
        elements.push(
          <Text key={key++} style={styles.normalText}>
            {trimmedLine}
          </Text>
        );
      } else {
        // 빈 줄
        elements.push(
          <Text key={key++} style={styles.emptyLine}>
            {' '}
          </Text>
        );
      }
    });

    return elements;
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  return (
    <Modal
      visible={true}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.container}>
        {/* 헤더 */}
        <View style={[styles.header, { backgroundColor: subjectColor }]}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            PDF 요약
          </Text>
          <View style={styles.headerRight} />
        </View>

        {/* 내용 */}
        <View style={styles.content}>
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={subjectColor} />
              <Text style={styles.loadingText}>PDF를 분석하고 요약 중...</Text>
            </View>
          )}

          {error && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={48} color="#ff6b6b" />
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity
                style={[styles.retryButton, { backgroundColor: subjectColor }]}
                onPress={fetchSummary}
              >
                <Text style={styles.retryButtonText}>다시 시도</Text>
              </TouchableOpacity>
            </View>
          )}

          {summary && !loading && (
            <ScrollView style={styles.summaryContainer} showsVerticalScrollIndicator={true}>
              <View style={styles.fileInfo}>
                <Ionicons name="document-text" size={20} color="#666" />
                <Text style={styles.fileName}>{summary.originalFileName}</Text>
              </View>
              
              <View style={styles.summaryContent}>
                {renderMarkdown(summary.summary)}
              </View>
            </ScrollView>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  closeButton: {
    marginRight: 12,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  headerRight: {
    width: 36,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#ff6b6b',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  summaryContainer: {
    flex: 1,
    padding: 16,
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    padding: 12,
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  fileName: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  summaryContent: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  h3: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 16,
    marginBottom: 8,
  },
  h4: {
    fontSize: 16,
    fontWeight: '600',
    color: '#34495e',
    marginTop: 12,
    marginBottom: 6,
  },
  listItem: {
    fontSize: 14,
    color: '#2c3e50',
    lineHeight: 22,
    marginBottom: 6,
  },
  nestedListItem: {
    fontSize: 14,
    color: '#2c3e50',
    lineHeight: 22,
    marginBottom: 6,
    marginLeft: 16,
  },
  boldText: {
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  normalText: {
    fontSize: 14,
    color: '#2c3e50',
    lineHeight: 22,
    marginBottom: 8,
  },
  emptyLine: {
    height: 8,
  },
});

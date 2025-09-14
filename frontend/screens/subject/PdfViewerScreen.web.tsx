import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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

type Props = NativeStackScreenProps<SubjectStackParamList, 'PdfViewerScreen'>;

export default function PdfViewerScreen({ route, navigation }: Props) {
  const { file, fileUri, subjectColor } = route.params;

  const handleDownload = () => {
    if (typeof document !== 'undefined') {
      const link = document.createElement('a');
      link.href = fileUri;
      link.download = file.originalFileName;
      link.click();
    }
  };

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

      {/* 웹 전용 PDF 뷰어 */}
      <View style={styles.webPdfContainer}>
        <Ionicons name="document-outline" size={64} color="#ccc" />
        <Text style={styles.webPdfText}>
          웹에서는 PDF 뷰어를 사용할 수 없습니다
        </Text>
        <Text style={styles.webPdfSubText}>
          파일명: {file.originalFileName}
        </Text>
        <TouchableOpacity
          style={[styles.downloadButton, { backgroundColor: subjectColor }]}
          onPress={handleDownload}
        >
          <Ionicons name="download-outline" size={20} color="white" />
          <Text style={styles.downloadButtonText}>PDF 다운로드</Text>
        </TouchableOpacity>
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
  webPdfContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  webPdfText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '600',
  },
  webPdfSubText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 20,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  downloadButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

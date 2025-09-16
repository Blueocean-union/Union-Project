import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import PdfViewerScreen from './PdfViewerScreen';

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

export default function PDFDrawingScreen({ route }: PDFDrawingScreenProps) {
  const { file, fileUri, subjectColor } = route.params;
  const navigation = useNavigation();
  
  // 툴바 상태
  const [currentTool, setCurrentTool] = useState('pen');
  const [currentColor, setCurrentColor] = useState('#ff0000');

  // 액션 버튼 핸들러(향후 구현 예정정)
  const handleVoiceRecord = () => {
    console.log('음성녹음 버튼 눌림');
  };

  const handleSummarize = () => {
    console.log('요약하기 버튼 눌림');
  };

  const handleAddAction = () => {
    console.log('추가 버튼 눌림');
  };

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
        <PdfViewerScreen
          file={file}
          fileUri={fileUri}
          subjectColor={subjectColor}
          currentTool={currentTool}
          currentColor={currentColor}
        />
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
  },
});

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface PDFAnnotationToolbarProps {
  currentTool: string;
  currentColor: string;
  onToolChange: (tool: string) => void;
  onColorChange: (color: string) => void;
  onClearAnnotations: () => void;
  subjectColor: string;
}

export default function PDFAnnotationToolbar({
  currentTool,
  currentColor,
  onToolChange,
  onColorChange,
  onClearAnnotations,
  subjectColor,
}: PDFAnnotationToolbarProps) {
  const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#000000'];

  return (
    <View style={[styles.toolbar, { backgroundColor: subjectColor }]}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.toolGroup}>
          {/* 그리기 도구 */}
          <TouchableOpacity
            style={[styles.toolButton, currentTool === 'pen' && styles.activeTool]}
            onPress={() => onToolChange('pen')}
          >
            <Ionicons name="create" size={20} color={currentTool === 'pen' ? 'white' : 'white'} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.toolButton, currentTool === 'eraser' && styles.activeTool]}
            onPress={() => onToolChange('eraser')}
          >
            <Ionicons name="remove-circle-outline" size={20} color={currentTool === 'eraser' ? 'white' : 'white'} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.toolButton, currentTool === 'trash' && styles.activeTool]}
            onPress={() => onClearAnnotations()}
          >
            <Ionicons name="trash-outline" size={20} color="white" />
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  toolbar: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  toolGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  toolButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  activeTool: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
});
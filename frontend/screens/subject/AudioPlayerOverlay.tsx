import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';

interface FileItem {
  id: number;
  folderId: number;
  originalFileName: string;
  contentType: string;
  size: number;
  updatedAt: string;
  deleted: boolean;
}

interface AudioPlayerOverlayProps {
  file: FileItem;
  fileUri: string;
  subjectColor: string;
  onClose: () => void;
}

export default function AudioPlayerOverlay({ 
  file, 
  fileUri, 
  subjectColor, 
  onClose 
}: AudioPlayerOverlayProps) {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);
  const [slideAnim] = useState(new Animated.Value(0));

  // 오디오 로드
  const loadAudio = async () => {
    try {
      if (sound) {
        await sound.unloadAsync();
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: fileUri },
        { shouldPlay: false }
      );
      
      setSound(newSound);
      setDuration((newSound as any).durationMillis || 0);

      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded) {
          setPosition(status.positionMillis || 0);
          setIsPlaying(status.isPlaying || false);
          
          if (status.didJustFinish) {
            setIsPlaying(false);
            setPosition(0);
          }
        }
      });
    } catch (error) {
      console.error('오디오 로드 실패:', error);
    }
  };

  // 재생/일시정지
  const togglePlayPause = async () => {
    if (!sound) return;

    try {
      if (isPlaying) {
        await sound.pauseAsync();
      } else {
        await sound.playAsync();
      }
    } catch (error) {
      console.error('재생 제어 실패:', error);
    }
  };

  // 최소화/확대
  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
    Animated.timing(slideAnim, {
      toValue: isMinimized ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  // 시간 포맷팅
  const formatTime = (millis: number) => {
    const minutes = Math.floor(millis / 60000);
    const seconds = Math.floor((millis % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // 진행률 계산
  const progress = duration > 0 ? position / duration : 0;

  useEffect(() => {
    loadAudio();
    
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [fileUri]);

  const screenWidth = Dimensions.get('window').width;
  const overlayWidth = screenWidth * 0.8;
  const minimizedWidth = 200;

  return (
    <Animated.View
      style={[
        styles.overlay,
        {
          width: isMinimized ? minimizedWidth : overlayWidth,
          transform: [
            {
              translateY: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -100],
              }),
            },
          ],
        },
      ]}
    >
      {isMinimized ? (
        // 최소화된 상태
        <TouchableOpacity
          style={[styles.minimizedContainer, { backgroundColor: subjectColor }]}
          onPress={toggleMinimize}
        >
          <Ionicons name="musical-notes" size={16} color="white" />
          <Text style={styles.minimizedFileName} numberOfLines={1}>
            {file.originalFileName}
          </Text>
          <TouchableOpacity
            style={styles.minimizedPlayButton}
            onPress={togglePlayPause}
          >
            <Ionicons 
              name={isPlaying ? "pause" : "play"} 
              size={16} 
              color="white" 
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.minimizedCloseButton}
            onPress={onClose}
          >
            <Ionicons name="close" size={16} color="white" />
          </TouchableOpacity>
        </TouchableOpacity>
      ) : (
        // 확대된 상태
        <View style={[styles.expandedContainer, { backgroundColor: subjectColor }]}>
          <View style={styles.header}>
            <TouchableOpacity onPress={toggleMinimize}>
              <Ionicons name="chevron-down" size={20} color="white" />
            </TouchableOpacity>
            <Text style={styles.fileName} numberOfLines={1}>
              {file.originalFileName}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={20} color="white" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.controls}>
            <TouchableOpacity style={styles.controlButton} onPress={togglePlayPause}>
              <Ionicons 
                name={isPlaying ? "pause" : "play"} 
                size={24} 
                color="white" 
              />
            </TouchableOpacity>
            
            <View style={styles.progressContainer}>
              <Text style={styles.timeText}>{formatTime(position)}</Text>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${progress * 100}%` }
                  ]} 
                />
              </View>
              <Text style={styles.timeText}>{formatTime(duration)}</Text>
            </View>
          </View>
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1000,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  minimizedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  minimizedFileName: {
    color: 'white',
    fontSize: 12,
    marginLeft: 8,
    flex: 1,
  },
  minimizedPlayButton: {
    marginLeft: 8,
    padding: 4,
  },
  minimizedCloseButton: {
    marginLeft: 8,
    padding: 4,
  },
  expandedContainer: {
    padding: 16,
    borderRadius: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  fileName: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginHorizontal: 12,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  controlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  progressContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    color: 'white',
    fontSize: 12,
    minWidth: 40,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    marginHorizontal: 8,
  },
  progressFill: {
    height: 4,
    backgroundColor: 'white',
    borderRadius: 2,
  },
});

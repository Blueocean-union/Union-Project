import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { QuestionStackParamList, Category } from './QuestionStack';

type Props = NativeStackScreenProps<QuestionStackParamList, 'QuestionCategory'>;

const categories: Category[] = [
  {
    id: 1,
    title: 'IT/테크',
    tags: '#컴퓨터 #하드웨어 #운영체제(OS)',
    icon: '💻',
    color: '#E6E6FA',
  },
  {
    id: 2,
    title: '사회/정치',
    tags: '#민원 #행정 #통일',
    icon: '🏛️',
    color: '#B0E0E6',
  },
  {
    id: 3,
    title: '경영/경제',
    tags: '#금융 #무역 #세금',
    icon: '📊',
    color: '#FFDAB9',
  },
  {
    id: 4,
    title: '법학',
    tags: '#형사사건 #민사소송 #재판',
    icon: '⚖️',
    color: '#FAFAD2',
  },
  {
    id: 5,
    title: '언어',
    tags: '#한국어 #일본어 #이탈리아어',
    icon: '🗣️',
    color: '#E0FFFF',
  },
  {
    id: 6,
    title: '전기/전자',
    tags: '#전기이론 #전자공학 #회로',
    icon: '⚡',
    color: '#FFE4E1',
  },
];

export default function QuestionCategoryScreen({ navigation }: Props) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 카테고리 로딩 시뮬레이션
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleCategoryPress = (category: Category) => {
    navigation.navigate('QuestionList', { category });
  };

  const handleCreateQuestion = () => {
    navigation.navigate('QuestionCreate', {});
  };

  const renderCategoryCard = ({ item }: { item: Category }) => (
    <TouchableOpacity
      style={[styles.categoryCard, { backgroundColor: item.color }]}
      onPress={() => handleCategoryPress(item)}
    >
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <View style={styles.iconContainer}>
            <Text style={styles.categoryIcon}>{item.icon}</Text>
          </View>
          <Ionicons name="chevron-forward-outline" size={20} color="#666" />
        </View>
        
        <View style={styles.cardBody}>
          <Text style={styles.categoryTitle}>{item.title}</Text>
          <Text style={styles.categoryTags}>{item.tags}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A90E2" />
          <Text style={styles.loadingText}>카테고리를 불러오는 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>질문방</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={handleCreateQuestion}
        >
          <Ionicons name="add-circle" size={28} color="#4A90E2" />
          <Text style={styles.createButtonText}>질문 작성</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={categories}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderCategoryCard}
        numColumns={2}
        contentContainerStyle={styles.listContainer}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  createButtonText: {
    marginLeft: 6,
    color: '#4A90E2',
    fontWeight: '600',
    fontSize: 14,
  },
  listContainer: {
    paddingHorizontal: 12,
    paddingBottom: 20,
  },
  row: {
    justifyContent: 'space-between',
  },
  categoryCard: {
    flex: 1,
    margin: 6,
    borderRadius: 16,
    height: 140,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryIcon: {
    fontSize: 20,
  },
  cardBody: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  categoryTags: {
    fontSize: 11,
    color: '#666',
    lineHeight: 14,
  },
});


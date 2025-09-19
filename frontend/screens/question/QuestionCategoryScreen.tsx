import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
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
    icon: 'laptop-outline',
    color: '#E6E6FA',
  },
  {
    id: 2,
    title: '사회/정치',
    tags: '#민원 #행정 #통일',
    icon: 'people-outline',
    color: '#B0E0E6',
  },
  {
    id: 3,
    title: '경영/경제',
    tags: '#금융 #무역 #세금',
    icon: 'trending-up-outline',
    color: '#FFDAB9',
  },
  {
    id: 4,
    title: '법학',
    tags: '#형사사건 #민사소송 #재판',
    icon: 'scale-outline',
    color: '#FAFAD2',
  },
  {
    id: 5,
    title: '언어',
    tags: '#한국어 #일본어 #이탈리아어',
    icon: 'language-outline',
    color: '#E0FFFF',
  },
  {
    id: 6,
    title: '전기/전자',
    tags: '#전기이론 #전자공학 #회로',
    icon: 'flash-outline',
    color: '#FFE4E1',
  },
];

export default function QuestionCategoryScreen({ navigation }: Props) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
        <Text style={styles.loadingText}>카테고리를 불러오는 중...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>질문방</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => navigation.navigate('QuestionCreate', {})}
        >
          <Ionicons name="add-circle" size={30} color="#4A90E2" />
          <Text style={styles.createButtonText}>질문 작성</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={categories}
        keyExtractor={(item) => String(item.id)}
        numColumns={2}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.card, { backgroundColor: item.color }]}
            onPress={() => navigation.navigate('QuestionList', { category: item })}
          >
            <View style={styles.cardHeader}>
              <Ionicons name={item.icon as any} size={28} color="#333" />
              <Ionicons name="chevron-forward-outline" size={20} color="#666" />
            </View>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardTags}>{item.tags}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
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
    padding: 24,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
  },
  createButtonText: {
    marginLeft: 4,
    color: '#4A90E2',
    fontWeight: '600',
  },
  listContainer: {
    paddingHorizontal: 8,
  },
  card: {
    flex: 1,
    margin: 8,
    padding: 16,
    borderRadius: 16,
    height: 140,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 'auto',
  },
  cardTags: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
});

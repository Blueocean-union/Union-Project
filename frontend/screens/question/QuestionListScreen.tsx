import React, { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { listPosts, type Post } from '../../libs/api/posts';

interface RouteParams {
  categoryId: number;
  categoryName: string;
}

export default function QuestionListScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { categoryId, categoryName } = (route.params ?? {}) as RouteParams;

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const data = await listPosts(categoryId);
      setPosts(data);
    } catch (e) {
      Alert.alert('오류', '질문 목록을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { loadPosts(); }, [categoryId]));

  const renderItem = ({ item }: { item: Post }) => (
    <TouchableOpacity
      style={{ backgroundColor: '#fff', padding: 16, borderRadius: 12, marginVertical: 8, elevation: 1 }}
      onPress={() => navigation.navigate('QuestionDetail', { id: item.id })}
    >
      <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{item.title}</Text>
      <Text style={{ marginTop: 4, color: '#555' }}>
        {item.writerName} · {new Date(item.createdAt).toLocaleDateString()}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, padding: 24, backgroundColor: '#fff' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="black" />
        </TouchableOpacity>
        <Text style={{ fontSize: 28, fontWeight: 'bold', marginLeft: 16 }}>{categoryName}</Text>
      </View>
      {loading ? <ActivityIndicator size="large" color="#000" /> : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          ListEmptyComponent={<Text style={{ marginTop: 16, color: '#555' }}>게시물이 없습니다.</Text>}
        />
      )}
    </View>
  );
}

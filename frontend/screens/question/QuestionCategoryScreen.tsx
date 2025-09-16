import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { listPosts, type Post } from '../../libs/api/posts';

interface RouteParams {
  folderId: number;
  folderName: string;
}

export default function QuestionCategoryScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { folderId, folderName } = (route.params as RouteParams);

  const [posts, setPosts] = useState<Post[]>([]);

  const loadPosts = async () => {
    try {
      const data = await listPosts(folderId);
      setPosts(data);
    } catch {
      Alert.alert('오류', '질문을 불러오지 못했습니다.');
    }
  };

  useEffect(() => {
    loadPosts();
  }, [folderId]);

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
        <Text style={{ fontSize: 28, fontWeight: 'bold', marginLeft: 16 }}>{folderName}</Text>
        <TouchableOpacity
          style={{ marginLeft: 'auto' }}
          onPress={() => navigation.navigate('QuestionWrite', { folderId })}
        >
          <Ionicons name="add-circle" size={28} color="black" />
        </TouchableOpacity>
      </View>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        ListEmptyComponent={<Text>질문이 없습니다.</Text>}
      />
    </View>
  );
}

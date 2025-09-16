import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, TextInput, Modal, Button } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { listFolders, createFolder, updateFolder, deleteFolder, type Folder } from '../../libs/api/folders';

export default function QuestionMainScreen() {
  const navigation = useNavigation<any>();
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [folderName, setFolderName] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);

  const loadFolders = async () => {
    setLoading(true);
    try {
      const data = await listFolders();
      setFolders(data);
    } catch {
      Alert.alert('오류', '폴더 목록을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFolders();
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setFolderName('');
    setModalVisible(true);
  };

  const openEditModal = (folder: Folder) => {
    setEditingId(folder.id);
    setFolderName(folder.name);
    setModalVisible(true);
  };

  const handleSaveFolder = async () => {
    if (!folderName.trim()) return;
    try {
      if (editingId) {
        await updateFolder(editingId, { name: folderName });
      } else {
        await createFolder({ name: folderName });
      }
      setModalVisible(false);
      loadFolders();
    } catch {
      Alert.alert('오류', '폴더 저장에 실패했습니다.');
    }
  };

  const handleDeleteFolder = async (id: number) => {
    Alert.alert('삭제', '폴더를 삭제할까요?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteFolder(id);
            loadFolders();
          } catch {
            Alert.alert('오류', '폴더 삭제 실패');
          }
        }
      }
    ]);
  };

  const renderItem = ({ item }: { item: Folder }) => (
    <TouchableOpacity
      style={{ backgroundColor: '#f9f9f9', padding: 16, borderRadius: 12, marginVertical: 8 }}
      onPress={() => navigation.navigate('QuestionCategory', { folderId: item.id, folderName: item.name })}
    >
      <Text style={{ fontSize: 18, fontWeight: 'bold' }}>{item.name}</Text>
      <View style={{ flexDirection: 'row', marginTop: 8 }}>
        <TouchableOpacity onPress={() => openEditModal(item)} style={{ marginRight: 16 }}>
          <Ionicons name="pencil" size={20} color="black" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDeleteFolder(item.id)}>
          <Ionicons name="trash" size={20} color="red" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, padding: 24, backgroundColor: '#fff' }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
        <Text style={{ fontSize: 28, fontWeight: 'bold' }}>질문방</Text>
        <TouchableOpacity onPress={openCreateModal}>
          <Ionicons name="add-circle" size={32} color="black" />
        </TouchableOpacity>
      </View>
      <FlatList
        data={folders}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        ListEmptyComponent={<Text>폴더가 없습니다. 새로 만들어보세요.</Text>}
      />
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={{ flex: 1, justifyContent: 'center', padding: 24, backgroundColor: 'rgba(0,0,0,0.3)' }}>
          <View style={{ backgroundColor: 'white', padding: 16, borderRadius: 8 }}>
            <TextInput
              value={folderName}
              onChangeText={setFolderName}
              placeholder="폴더 이름"
              style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 4, padding: 8, marginBottom: 12 }}
            />
            <Button title="저장" onPress={handleSaveFolder} />
            <Button title="취소" onPress={() => setModalVisible(false)} color="gray" />
          </View>
        </View>
      </Modal>
    </View>
  );
}

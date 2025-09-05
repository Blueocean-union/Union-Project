import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
// 상대경로: screens(루트) → src/libs/api/...
import {
  createSubfolder,
  renameFolder,
  deleteFolder,
  getFolder,
} from '../libs/api/folders';

type Props = { route: { params: { folderId: number } }; navigation: any };

export default function FolderManageScreen({ route }: Props) {
  const { folderId } = route.params;
  const [childName, setChildName] = useState('');
  const [newName, setNewName] = useState('');

  const createChild = async () => {
    const name = childName.trim();
    if (!name) return;
    try {
      const id = await createSubfolder({ parentId: folderId, name });
      Alert.alert('생성 완료', `하위 폴더 ID: ${id}`);
      setChildName('');
    } catch (e) {
      console.log(e);
      Alert.alert('오류', '하위 폴더 생성 실패');
    }
  };

  const rename = async () => {
    const name = newName.trim();
    if (!name) return;
    try {
      await renameFolder(folderId, name);
      Alert.alert('수정 완료', '폴더 이름이 변경되었습니다.');
      setNewName('');
    } catch (e) {
      console.log(e);
      Alert.alert('오류', '이름 변경 실패');
    }
  };

  const remove = async () => {
    Alert.alert('삭제', '이 폴더를 삭제할까요?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteFolder(folderId);
            Alert.alert('삭제 완료');
          } catch (e) {
            console.log(e);
            Alert.alert('오류', '폴더 삭제 실패');
          }
        },
      },
    ]);
  };

  const inspect = async () => {
    try {
      const f = await getFolder(folderId);
      Alert.alert('폴더 정보', JSON.stringify(f, null, 2));
    } catch (e) {
      console.log(e);
      Alert.alert('오류', '폴더 정보를 가져오지 못했습니다.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.caption}>폴더 ID: {folderId}</Text>

      <Text style={styles.label}>하위 폴더 생성</Text>
      <TextInput
        placeholder="이름"
        value={childName}
        onChangeText={setChildName}
        style={styles.input}
      />
      <Button title="하위 폴더 생성" onPress={createChild} />

      <View style={{ height: 16 }} />

      <Text style={styles.label}>폴더 이름 변경</Text>
      <TextInput
        placeholder="새 이름"
        value={newName}
        onChangeText={setNewName}
        style={styles.input}
      />
      <Button title="이름 변경" onPress={rename} />

      <View style={{ height: 16 }} />
      <Button title="폴더 삭제" color="#c62828" onPress={remove} />

      <View style={{ height: 16 }} />
      <Button title="폴더 정보 보기 (디버그)" onPress={inspect} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12 },
  caption: { fontWeight: '700' },
  label: { marginTop: 4, marginBottom: 6, fontWeight: '600' },
  input: { borderWidth: 1, borderColor: '#ddd', padding: 8, borderRadius: 6 },
});

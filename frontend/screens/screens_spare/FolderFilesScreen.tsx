import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Button, TouchableOpacity, Alert, Linking, StyleSheet } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
// 상대경로: screens(루트) → src/libs/api/...
import {
  listFilesInFolder,
  uploadFileMultipart,
  removeFile,
  buildDownloadUrl,
  type FileItem,
} from '../libs/api/files';

type Props = {
  route: { params: { folderId: number; folderName?: string } };
  navigation: any;
};

export default function FolderFilesScreen({ route }: Props) {
  const { folderId, folderName } = route.params;
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await listFilesInFolder(folderId);
      setFiles(data);
    } catch (e) {
      console.log(e);
      Alert.alert('오류', '파일 목록을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [folderId]);

  const pickAndUpload = async () => {
    const res = await DocumentPicker.getDocumentAsync({ multiple: false, copyToCacheDirectory: true });
    if (res.canceled) return;
    const asset = res.assets[0];
    const file = {
      uri: asset.uri,
      name: asset.name ?? 'file',
      type: asset.mimeType ?? 'application/octet-stream',
    };
    try {
      await uploadFileMultipart(folderId, file);
      await load();
    } catch (e) {
      console.log(e);
      Alert.alert('오류', '업로드에 실패했습니다.');
    }
  };

  const remove = (id: number) => {
    Alert.alert('삭제', '이 파일을 삭제할까요?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          try {
            await removeFile(id);
            await load();
          } catch (e) {
            console.log(e);
            Alert.alert('오류', '삭제에 실패했습니다.');
          }
        },
      },
    ]);
  };

  const open = (id: number) => {
    const url = buildDownloadUrl(id);
    Linking.openURL(url).catch(() => Alert.alert('오류', '다운로드를 열 수 없습니다.'));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{folderName ?? '자료 폴더'}</Text>

      <Button title="파일 업로드" onPress={pickAndUpload} />
      <View style={{ height: 12 }} />

      {loading ? (
        <Text>로딩중…</Text>
      ) : (
        <FlatList
          data={files}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <Text style={styles.itemTitle}>{item.originalFileName}</Text>
              <Text style={styles.itemMeta}>
                {item.fileType} · {new Date(item.uploadedAt).toLocaleString()}
              </Text>
              <View style={styles.row}>
                <TouchableOpacity onPress={() => open(item.id)}>
                  <Text style={styles.link}>다운로드</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => remove(item.id)}>
                  <Text style={styles.delete}>삭제</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={<Text>파일이 없습니다.</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
  item: { paddingVertical: 12, borderBottomWidth: 1, borderColor: '#eee' },
  itemTitle: { fontWeight: '500' },
  itemMeta: { fontSize: 12, color: '#666', marginTop: 2 },
  row: { flexDirection: 'row', gap: 16, marginTop: 8 },
  link: { color: '#1976d2' },
  delete: { color: '#c62828' },
});

// screens/SearchScreen.tsx
import React from 'react';
import { Text, View, StyleSheet } from 'react-native';

export default function SearchScreen() {
  return (
    <View style={S.emptyScreen}>
      <Text style={S.emptyScreenTitle}>검색</Text>
      <Text style={S.emptyScreenText}>검색 화면입니다.</Text>
    </View>
  );
}

const S = StyleSheet.create({
  emptyScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  emptyScreenTitle: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  emptyScreenText: { fontSize: 14, color: '#666' },
});

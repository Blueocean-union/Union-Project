import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function LoadingScreen() {
  return (
    <View style={styles.center}>
      <Text style={styles.title}>홈</Text>
      <Text style={styles.text}>홈 화면입니다.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 6 },
  text: { fontSize: 14, color: '#555' },
});

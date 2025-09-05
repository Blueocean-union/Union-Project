import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import type { AuthStackParamList } from './AuthStack';

type Props = NativeStackScreenProps<AuthStackParamList, 'Logout'>;

// Root 스택은 App.tsx 기준: Splash / Auth / Main
export default function LogoutScreen({ navigation }: Props) {
  useEffect(() => {
    const logout = async () => {
      try {
        await AsyncStorage.multiRemove([
          'accessToken',
          'refreshToken',
          'user',
          'userId',
        ]);
      } finally {
        // 뒤로가기 방지하며 Auth로 초기화
        navigation.getParent()?.reset({
          index: 0,
          routes: [{ name: 'Auth' as never }],
        });
      }
    };
    logout();
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>로그아웃 중입니다...</Text>
      <ActivityIndicator size="large" color="#007AFF" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 16, marginBottom: 12 },
});

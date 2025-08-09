// screens/LogoutScreen.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

interface Props {
  navigation: NativeStackNavigationProp<any>;
}

export default function LogoutScreen({ navigation }:Props) {
  useEffect(() => {
    const logout = async () => {
      await AsyncStorage.removeItem('accessToken');
      await AsyncStorage.removeItem('refreshToken');

      // 뒤로가기 방지하면서 로그인 화면으로
      navigation.getParent()?.reset({
        index: 0,
        routes: [{ name: 'Auth' }],
      });
    };

    logout();
  }, []);

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
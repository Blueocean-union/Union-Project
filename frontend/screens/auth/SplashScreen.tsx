import AsyncStorage from '@react-native-async-storage/async-storage';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

// App.tsx에 선언한 RootStackParamList와 동일해야 함
// type RootStackParamList = { Splash: undefined; Auth: undefined; Main: undefined; }
import type { RootStackParamList } from '../../App';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

export default function SplashScreen({ navigation }: Props) {
  useEffect(() => {
    const checkLogin = async () => {
      try {
        const token = await AsyncStorage.getItem('accessToken');
        navigation.replace(token ? 'Main' : 'Auth');
      } catch {
        navigation.replace('Auth');
      }
    };
    checkLogin();
  }, [navigation]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#007AFF" />
    </View>
  );
}

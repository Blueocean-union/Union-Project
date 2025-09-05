// screens/auth/LoginScreen.tsx
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from './AuthStack';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  (process.env as any).REACT_NATIVE_API_BASE_URL ||
  (Platform.OS === 'android' ? 'http://10.0.2.2:8080' : 'http://localhost:8080');

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secure, setSecure] = useState(true);
  const [loading, setLoading] = useState(false);

  const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

  const onLogin = async () => {
    if (!isValidEmail(email)) {
      Alert.alert('알림', '이메일 형식을 확인해주세요.');
      return;
    }
    if (!password.trim()) {
      Alert.alert('알림', '비밀번호를 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      // 백엔드 경로에 맞게 조정: /api/auth/login 사용 중이면 아래 경로 변경
      const { data } = await axios.post(
        `${API_BASE_URL}/auth/login`,
        { email: email.trim(), password },
        { timeout: 15000 }
      );

      // 유연하게 키 처리
      const accessToken = data?.accessToken || data?.token;
      const refreshToken = data?.refreshToken;
      const user = data?.user || data?.profile;

      if (!accessToken) throw new Error('서버 응답에 토큰이 없습니다.');

      await AsyncStorage.multiSet([
        ['accessToken', String(accessToken)],
        ...(refreshToken ? [['refreshToken', String(refreshToken)]] : []),
        ...(user ? [['user', JSON.stringify(user)]] : []),
        ...(user?.id != null ? [['userId', String(user.id)]] : []),
      ] as [string, string][]);

      // RootStack: Splash/Auth/Main 구조 → 뒤로가기 방지하며 Main으로 초기화
      navigation.getParent()?.reset({
        index: 0,
        routes: [{ name: 'Main' as never }],
      });
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        '로그인에 실패했습니다. 다시 시도해주세요.';
      Alert.alert('로그인 실패', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, padding: 20, justifyContent: 'center' }}
      behavior={Platform.select({ ios: 'padding', android: undefined })}
    >
      <View style={{ gap: 12 }}>
        <Text style={{ fontSize: 24, fontWeight: '700', marginBottom: 8 }}>로그인</Text>

        <TextInput
          placeholder="이메일"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          style={inputStyle}
          placeholderTextColor="#9ca3af"
        />

        <View style={{ position: 'relative' }}>
          <TextInput
            placeholder="비밀번호"
            secureTextEntry={secure}
            value={password}
            onChangeText={setPassword}
            style={inputStyle}
            placeholderTextColor="#9ca3af"
          />
          <TouchableOpacity
            onPress={() => setSecure((v) => !v)}
            style={{ position: 'absolute', right: 12, top: 12, padding: 4 }}
          >
            <Text style={{ color: '#4A90E2', fontWeight: '600' }}>
              {secure ? '보기' : '가리기'}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={onLogin}
          style={[buttonStyle, { backgroundColor: '#111827', opacity: loading ? 0.7 : 1 }]}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={buttonTextStyle}>로그인</Text>}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('Signup')}
          style={[buttonStyle, { backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e5e7eb' }]}
          disabled={loading}
        >
          <Text style={[buttonTextStyle, { color: '#111827' }]}>회원가입</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const inputStyle = {
  borderWidth: 1,
  borderColor: '#e5e7eb',
  borderRadius: 12,
  paddingHorizontal: 14,
  paddingVertical: 12,
  fontSize: 16,
  backgroundColor: '#fff',
  color: '#111827',
} as const;

const buttonStyle = {
  borderRadius: 12,
  paddingVertical: 14,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
} as const;

const buttonTextStyle = {
  color: '#ffffff',
  fontWeight: '700' as const,
  fontSize: 16,
} as const;

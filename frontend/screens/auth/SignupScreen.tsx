import axios from 'axios';
import React, { useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from './AuthStack';

type Props = NativeStackScreenProps<AuthStackParamList, 'Signup'>;

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  (process.env as any).REACT_NATIVE_API_BASE_URL ||
  (Platform.OS === 'android' ? 'http://10.0.2.2:8080' : 'http://localhost:8080');

export default function SignupScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [name, setName]   = useState('');
  const [password, setPassword] = useState('');
  const [passwordCheck, setPasswordCheck] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordCheck, setShowPasswordCheck] = useState(false);
  const [loading, setLoading] = useState(false);

  const canSubmit = useMemo(
    () =>
      email.trim().length > 0 &&
      name.trim().length > 0 &&
      password.length >= 6 &&
      password === passwordCheck,
    [email, name, password, passwordCheck]
  );

  const handleSignup = async () => {
    if (!canSubmit) {
      Alert.alert('입력 확인', '이메일/이름/비밀번호(6자 이상)를 정확히 입력하세요.');
      return;
    }
    setLoading(true);
    try {
      // 백엔드 경로에 맞게 조정: /api/auth/signup 등
      await axios.post(`${API_BASE_URL}/auth/signup`, {
        email: email.trim(),
        password,
        name: name.trim(),
        // provider가 @NotNull이면 다음 추가:
        // provider: 'LOCAL',
      });
      Alert.alert('회원가입 성공', '로그인 화면으로 이동합니다.');
      navigation.navigate('Login');
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        '회원가입 중 오류가 발생했습니다.';
      Alert.alert('회원가입 실패', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.select({ ios: 'padding', android: undefined })}
      >
        <View style={styles.headerRow}>
          <Text style={styles.title}>
            <Text style={{ fontWeight: 'bold' }}>Union</Text> 회원가입
          </Text>
          <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()}>
            <Icon name="close" size={28} color="#1a2956" />
          </TouchableOpacity>
        </View>

        <View style={styles.inputWrap}>
          <Icon name="email-outline" size={22} color="#aaa" style={styles.icon} />
          <TextInput
            placeholder="email@example.com"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.input}
            placeholderTextColor="#bbb"
          />
        </View>

        <View style={styles.inputWrap}>
          <Icon name="account" size={22} color="#aaa" style={styles.icon} />
          <TextInput
            placeholder="이름 또는 닉네임"
            value={name}
            onChangeText={setName}
            style={styles.input}
            placeholderTextColor="#bbb"
          />
        </View>

        <View style={styles.inputWrap}>
          <Icon name="lock-outline" size={22} color="#aaa" style={styles.icon} />
          <TextInput
            placeholder="비밀번호 (6자 이상)"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            style={styles.input}
            placeholderTextColor="#bbb"
          />
          <TouchableOpacity onPress={() => setShowPassword((v) => !v)}>
            <Icon name={showPassword ? 'eye-off' : 'eye'} size={22} color="#aaa" />
          </TouchableOpacity>
        </View>

        <View style={styles.inputWrap}>
          <Icon name="lock-outline" size={22} color="#aaa" style={styles.icon} />
          <TextInput
            placeholder="비밀번호 확인"
            value={passwordCheck}
            onChangeText={setPasswordCheck}
            secureTextEntry={!showPasswordCheck}
            style={styles.input}
            placeholderTextColor="#bbb"
          />
          <TouchableOpacity onPress={() => setShowPasswordCheck((v) => !v)}>
            <Icon name={showPasswordCheck ? 'eye-off' : 'eye'} size={22} color="#aaa" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.signupBtn, { opacity: loading || !canSubmit ? 0.6 : 1 }]}
          onPress={handleSignup}
          disabled={loading || !canSubmit}
        >
          <Text style={styles.signupBtnText}>{loading ? '가입 중...' : '회원가입'}</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f3f4fa' },
  container: { flex: 1, padding: 24, backgroundColor: '#f3f4fa', justifyContent: 'center' },
  headerRow: { flexDirection: 'row', alignItems: 'center', width: '100%', marginBottom: 24 },
  title: { fontSize: 32, color: '#1a2956', flex: 1, fontWeight: 'bold' },
  closeBtn: { padding: 4 },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingHorizontal: 16,
    marginBottom: 16,
    width: '100%',
    height: 48,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  icon: { marginRight: 8 },
  input: { flex: 1, fontSize: 16, color: '#222' },
  signupBtn: {
    backgroundColor: '#fff',
    borderRadius: 24,
    width: '100%',
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  signupBtnText: { fontSize: 18, color: '#1a2956', fontWeight: 'bold' },
});

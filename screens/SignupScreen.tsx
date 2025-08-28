// screens/SignupScreen.tsx
import React, { useState } from 'react';
import { Alert, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import api from '../libs/axios';

export default function SignupScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [passwordCheck, setPasswordCheck] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordCheck, setShowPasswordCheck] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!email || !password || !name || !passwordCheck) {
      Alert.alert('입력 오류', '모든 항목을 입력해 주세요.');
      return;
    }
    if (password !== passwordCheck) {
      Alert.alert('비밀번호 불일치', '비밀번호가 일치하지 않습니다.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/signup', { email, password, name, grade: 'Basic' });
      Alert.alert('회원가입 성공', '로그인 화면으로 이동합니다.');
      navigation.navigate('Login');
    } catch (e) {
      console.error('❌ 회원가입 실패:', e);
      Alert.alert('오류', '회원가입에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Text style={styles.title}><Text style={{fontWeight:'bold'}}>Union</Text> 회원가입</Text>
          <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()}>
            <Icon name="close" size={28} color="#1a2956" />
          </TouchableOpacity>
        </View>

        <View style={styles.inputWrap}>
          <Icon name="email-outline" size={22} color="#aaa" style={styles.icon} />
          <TextInput placeholder="email@example.com" autoCapitalize="none" value={email} onChangeText={setEmail} style={styles.input} />
        </View>

        <View style={styles.inputWrap}>
          <Icon name="account-outline" size={22} color="#aaa" style={styles.icon} />
          <TextInput placeholder="이름" value={name} onChangeText={setName} style={styles.input} />
        </View>

        <View style={styles.inputWrap}>
          <Icon name="lock-outline" size={22} color="#aaa" style={styles.icon} />
          <TextInput placeholder="비밀번호" secureTextEntry={!showPassword} value={password} onChangeText={setPassword} style={styles.input} />
          <TouchableOpacity onPress={() => setShowPassword((v) => !v)}><Icon name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={22} color="#888" /></TouchableOpacity>
        </View>

        <View style={styles.inputWrap}>
          <Icon name="lock-outline" size={22} color="#aaa" style={styles.icon} />
          <TextInput placeholder="비밀번호 확인" secureTextEntry={!showPasswordCheck} value={passwordCheck} onChangeText={setPasswordCheck} style={styles.input} />
          <TouchableOpacity onPress={() => setShowPasswordCheck((v) => !v)}><Icon name={showPasswordCheck ? 'eye-off-outline' : 'eye-outline'} size={22} color="#888" /></TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.signupBtn} onPress={handleSignup} disabled={loading}>
          <Text style={styles.signupText}>{loading ? '처리 중...' : '회원가입'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 24 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 22, color: '#1a2956' },
  closeBtn: { padding: 6 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#ddd', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, marginTop: 12, gap: 8 },
  icon: {},
  input: { flex: 1 },
  signupBtn: { marginTop: 20, backgroundColor: '#1a2956', borderRadius: 10, alignItems: 'center', paddingVertical: 14 },
  signupText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

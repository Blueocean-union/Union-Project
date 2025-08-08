import axios from 'axios';
import React, { useState } from 'react';
import { Alert, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

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
      // 실제 서버 요청 코드 (임시 주석 처리)
      await axios.post('http://10.14.15.147:8080/auth/signup', { email, password, name, grade: 'Basic' });
      // 임시 성공 처리
      setTimeout(() => {
        Alert.alert('회원가입 성공', '로그인 화면으로 이동합니다.');
        navigation.navigate('Login');
      }, 1000);
    } catch (err: any) {
      Alert.alert('회원가입 실패', '오류가 발생했습니다.');
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
          <TextInput
            placeholder="email@example.com"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            style={styles.input}
            placeholderTextColor="#bbb"
          />
        </View>
        <View style={styles.inputWrap}>
          <Icon name="account" size={22} color="#aaa" style={styles.icon} />
          <TextInput
            placeholder="아이디를 입력해주세요"
            value={name}
            onChangeText={setName}
            style={styles.input}
            placeholderTextColor="#bbb"
          />
        </View>
        <View style={styles.inputWrap}>
          <Icon name="lock-outline" size={22} color="#aaa" style={styles.icon} />
          <TextInput
            placeholder="비밀번호를 입력해주세요"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            style={styles.input}
            placeholderTextColor="#bbb"
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Icon name={showPassword ? 'eye-off' : 'eye'} size={22} color="#aaa" />
          </TouchableOpacity>
        </View>
        <View style={styles.inputWrap}>
          <Icon name="lock-outline" size={22} color="#aaa" style={styles.icon} />
          <TextInput
            placeholder="비밀번호를 다시 한 번 입력해주세요"
            value={passwordCheck}
            onChangeText={setPasswordCheck}
            secureTextEntry={!showPasswordCheck}
            style={styles.input}
            placeholderTextColor="#bbb"
          />
          <TouchableOpacity onPress={() => setShowPasswordCheck(!showPasswordCheck)}>
            <Icon name={showPasswordCheck ? 'eye-off' : 'eye'} size={22} color="#aaa" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.signupBtn} onPress={handleSignup} disabled={loading}>
          <Text style={styles.signupBtnText}>{loading ? '가입 중...' : '회원가입'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f3f4fa' },
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: '#f3f4fa' },
  headerRow: { flexDirection: 'row', alignItems: 'center', width: '100%', marginBottom: 24 },
  title: { fontSize: 36, color: '#1a2956', flex: 1, fontWeight: 'bold' },
  closeBtn: { padding: 4 },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 24,
    paddingHorizontal: 16, marginBottom: 16, width: '100%', height: 48, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 2, elevation: 1
  },
  icon: { marginRight: 8 },
  input: { flex: 1, fontSize: 16, color: '#222' },
  signupBtn: { backgroundColor: '#fff', borderRadius: 24, width: '100%', height: 48, justifyContent: 'center', alignItems: 'center', marginTop: 16, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 2, elevation: 1 },
  signupBtnText: { fontSize: 18, color: '#1a2956', fontWeight: 'bold' },
}); 
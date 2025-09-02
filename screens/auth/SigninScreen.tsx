import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Alert,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const UnionSignupScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async () => {
    if (!email || !name || !password || !confirmPassword) {
      Alert.alert('알림', '모든 필드를 입력해주세요.');
      return;
    }
    
    if (password !== confirmPassword) {
      Alert.alert('알림', '비밀번호가 일치하지 않습니다.');
      return;
    }

    setIsLoading(true);

    try {
      // API 요청 데이터
      const requestBody = {
        email: email,
        password: password,
        name: name
      };

      // API 호출
      const response = await fetch('http://52.78.209.115:8000/auth/signup', {
        method: 'POST',
        headers: {
          'Accept': '*/*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        // 서버에서 "회원가입 완료" 메시지를 반환하므로 텍스트로 처리
        const result = await response.text();
        Alert.alert('성공', result || '회원가입이 완료되었습니다!');
        console.log('회원가입 성공:', result);
        
        // 성공 시 입력 필드 초기화 및 로그인 화면으로 이동
        setEmail('');
        setName('');
        setPassword('');
        setConfirmPassword('');
        
        // 로그인 화면으로 이동
        setTimeout(() => {
          navigation.navigate('Login');
        }, 1500);
      } else {
        // 서버 오류 처리
        const errorText = await response.text();
        Alert.alert('오류', errorText || '회원가입 중 오류가 발생했습니다.');
        console.error('회원가입 실패:', response.status, errorText);
      }
    } catch (error) {
      // 네트워크 오류 처리
      Alert.alert('오류', '네트워크 연결을 확인해주세요.');
      console.error('네트워크 오류:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#EEEFF6" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Union 회원가입</Text>
        <TouchableOpacity 
          style={styles.closeButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="close" size={40} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Form */}
      <View style={styles.form}>
        {/* Email Input */}
        <View style={styles.inputWrapper}>
          <View style={styles.inputIcon}>
            <Ionicons name="mail-outline" size={24} color="#CBCDDB" />
          </View>
          <TextInput
            style={styles.textInput}
            placeholder="email@example.com"
            placeholderTextColor="#CBCDDB"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* Name Input */}
        <View style={styles.inputWrapper}>
          <View style={styles.inputIcon}>
            <Ionicons name="person-outline" size={24} color="#CBCDDB" />
          </View>
          <TextInput
            style={styles.textInput}
            placeholder="이름을 입력해주세요"
            placeholderTextColor="#CBCDDB"
            value={name}
            onChangeText={setName}
          />
        </View>

        {/* Password Input */}
        <View style={styles.inputWrapper}>
          <View style={styles.inputIcon}>
            <Ionicons name="lock-closed-outline" size={24} color="#CBCDDB" />
          </View>
          <TextInput
            style={[styles.textInput, styles.passwordInput]}
            placeholder="비밀번호를 입력해주세요"
            placeholderTextColor="#CBCDDB"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={togglePasswordVisibility}
          >
            <Ionicons
              name={showPassword ? "eye-off-outline" : "eye-outline"}
              size={24}
              color="#CBCDDB"
            />
          </TouchableOpacity>
        </View>

        {/* Confirm Password Input */}
        <View style={styles.inputWrapper}>
          <View style={styles.inputIcon}>
            <Ionicons name="lock-closed-outline" size={24} color="#CBCDDB" />
          </View>
          <TextInput
            style={[styles.textInput, styles.passwordInput]}
            placeholder="비밀번호를 다시 한 번 입력해주세요"
            placeholderTextColor="#CBCDDB"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirmPassword}
            autoCapitalize="none"
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={toggleConfirmPasswordVisibility}
          >
            <Ionicons
              name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
              size={24}
              color="#CBCDDB"
            />
          </TouchableOpacity>
        </View>

        {/* Signup Button */}
        <TouchableOpacity 
          style={[styles.signupButton, isLoading && styles.disabledButton]} 
          onPress={handleSignup}
          disabled={isLoading}
        >
          <Text style={styles.signupButtonText}>
            {isLoading ? '회원가입 중...' : '회원가입'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EEEFF6',
    paddingBottom: 80 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 70,
    paddingVertical: 5,
    paddingBottom : 50,
    backgroundColor: '#EEEFF6',
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#3B4B87',
  },
  form: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 40,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 30,
    marginBottom: 27,
    marginHorizontal: 400,
    paddingVertical: 3,
  },
  inputIcon: {
    paddingLeft: 22,
    paddingRight: 10,
  },
  textInput: {
    flex: 1,
    paddingVertical: 14,
    paddingRight: 16,
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  passwordInput: {
    paddingRight: 50,
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    padding: 8,
  },
  signupButton: {
    backgroundColor: '#fff',
    borderRadius: 30,
    paddingVertical: 12,
    marginHorizontal: 500,
    alignItems: 'center',
    marginTop: 30,
  },
  signupButtonText: {
    fontSize: 20,
    fontWeight: '500',
    color: '#8587aaff',
  },
  disabledButton: {
    opacity: 0.6,
  },
});

export default UnionSignupScreen;
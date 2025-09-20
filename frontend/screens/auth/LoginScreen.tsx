import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CommonActions } from '@react-navigation/native';
import React, { useState } from 'react';
import {
    Alert,
    Dimensions,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const { width, height } = Dimensions.get('window');

export default function Login({ navigation }: any) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('오류', '아이디와 비밀번호를 모두 입력해주세요.');
      return;
    }

    setLoading(true);

    try {
      
      const response = await fetch('http://52.78.209.115:8080/auth/signin', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: username,
          password: password,
        }),
      });

      
      if (response.ok) {
        const responseText = await response.text();

        let data;
        try {
          data = JSON.parse(responseText);
        } catch (parseError) {
          Alert.alert('오류', '서버 응답을 처리할 수 없습니다.');
          return;
        }

        
        // API 응답에서 토큰 추출
        const accessToken = data.accessToken;
        const refreshToken = data.refreshToken;
        
        if (!accessToken) {
          Alert.alert('오류', '인증 토큰을 받지 못했습니다.');
          return;
        }
        
        try {
          // 토큰을 AsyncStorage에 저장
          await AsyncStorage.setItem('accessToken', accessToken);
          if (refreshToken) {
            await AsyncStorage.setItem('refreshToken', refreshToken);
          }
          
          // 저장된 토큰 확인
          const savedAccessToken = await AsyncStorage.getItem('accessToken');
          
          // 네비게이션 리셋으로 메인 화면으로 이동
          
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: 'Main' }],
            })
          );
          
          
        } catch (storageError) {
          Alert.alert('오류', '토큰 저장에 실패했습니다.');
        }
      } else {
        // 로그인 실패
        const errorText = await response.text();
        
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: '로그인에 실패했습니다.' };
        }
        
        Alert.alert('로그인 실패', errorData.message || errorData.error || '아이디 또는 비밀번호가 올바르지 않습니다.');
      }
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('Network request failed')) {
        Alert.alert('오류', '서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.');
      } else {
        Alert.alert('오류', '로그인 중 오류가 발생했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />

      {/* 메인 컨텐츠 */}
      <View style={styles.content}>
        {/* Union 로고 */}
        <Text style={styles.logo}>Union</Text>

        {/* 입력 필드들 */}
        <View style={styles.inputContainer}>
          {/* 아이디 입력 */}
          <View style={styles.inputWrapper}>
            <View style={styles.inputIcon}>
              <Ionicons name="person-circle-outline" size={24} color="#CBCDDB" />
            </View>
            <TextInput
              style={[styles.textInput]}
              placeholder="아이디를 입력해주세요"
              placeholderTextColor="#CBCDDB"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              editable={!loading}
            />
          </View>

          {/* 비밀번호 입력 */}
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
              editable={!loading}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={30}
                color="#CBCDDB"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* 자동 로그인 및 비밀번호 찾기 */}
        <View style={styles.optionsRow}>
          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => setRememberMe(!rememberMe)}
            disabled={loading}
          >
            <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
              {rememberMe && (
                <Ionicons name="checkmark" size={12} color="#fff" />
              )}
            </View>
            <Text style={styles.checkboxText}>자동 로그인</Text>
          </TouchableOpacity>

          <TouchableOpacity disabled={loading}>
            <Text style={styles.forgotPassword}>비밀번호를 잊어버렸어요</Text>
          </TouchableOpacity>
        </View>

        {/* 로그인 버튼 */}
        <TouchableOpacity 
          style={[styles.loginButton, loading && styles.loginButtonDisabled]} 
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.loginButtonText}>
            {loading ? '로그인 중...' : '로그인'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* 회원가입 링크 */}
      <View style={styles.footer}>
        <TouchableOpacity 
          disabled={loading}
          onPress={() => navigation.navigate('Signin')}
        >
          <Text style={styles.signupText}>회원가입할래요</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EEEFF6',
  },
  content: {
    flex: 1,
    paddingHorizontal: 70,
    paddingTop: 10,
  },
  logo: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#3B4B87',
    marginBottom: 124,
  },
  inputContainer: {
    marginBottom: -5,
    marginHorizontal: 25,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 30,
    marginBottom: 27,
    marginHorizontal: 330,
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
  },
  passwordInput: {
    paddingRight: 48,
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    padding: 4,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 50,
    marginHorizontal: 380,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 16,
    height: 16,
    borderWidth: 1,
    borderColor: '#C0C2D0',
    borderRadius: 3,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#C0C2D0',
    borderColor: '#C0C2D0',
  },
  checkboxText: {
    fontSize: 15,
    color: '#a3a8caff',
  },
  forgotPassword: {
    fontSize: 15,
    color: '#a3a8caff',
  },
  loginButton: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderRadius: 30,
    alignItems: 'center',
    marginHorizontal: 500,
  },
  loginButtonDisabled: {
    backgroundColor: '#f0f0f0',
    opacity: 0.7,
  },
  loginButtonText: {
    fontSize: 20,
    fontWeight: '500',
    color: '#8587aaff',
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 68,
  },
  signupText: {
    fontSize: 18,
    color: '#8587aaff',
  },
});
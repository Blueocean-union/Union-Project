// import React, { useState } from 'react';
// import {
//   View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity, SafeAreaView
// } from 'react-native';
// import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { NativeStackNavigationProp } from '@react-navigation/native-stack';
// // import axios from 'axios';
// import { Checkbox } from 'react-native-paper';

// interface Props {
//   navigation: NativeStackNavigationProp<any>;
// }

// export default function LoginScreen({ navigation }: Props) {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [showPassword, setShowPassword] = useState(false);
//   const [autoLogin, setAutoLogin] = useState(false);

//   const login = async () => {
//     try {
//       // 실제 서버 요청 코드 (임시 주석 처리)
//       /*
//       const response = await fetch('http://52.78.209.115:8080/auth/signin', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           email,
//           password,
//         }),
//       });
//       if (!response.ok) {
//         throw new Error('로그인 실패');
//       }
//       const data = await response.json();
//       const { accessToken, refreshToken } = data;
//       await AsyncStorage.setItem('accessToken', accessToken);
//       await AsyncStorage.setItem('refreshToken', refreshToken);
//       navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
//       */
      
//       // 로그인 화면 실행용 (무조건 실패 처리)
//       //throw new Error('로그인 실패');

//       //Main화면 실행용 (자동로그인인 접속 처리)
      
//       setTimeout(() => {
//         AsyncStorage.setItem('accessToken', 'dummy');
//         AsyncStorage.setItem('refreshToken', 'dummy');
//         navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
//       }, 1000);
      
//     } catch (err: any) {
//       console.error('❌ 로그인 실패:', err.message);
//       Alert.alert('로그인 실패', '이메일 또는 비밀번호가 잘못되었습니다.');
//     }
//   };

//   return (
//     <SafeAreaView style={styles.safe}>
//       <View style={styles.container}>
//         <Text style={styles.title}>Union</Text>
//         <View style={styles.inputWrap}>
//           <Icon name="account" size={22} color="#aaa" style={styles.icon} />
//           <TextInput
//             placeholder="아이디를 입력해주세요"
//             value={email}
//             onChangeText={setEmail}
//             autoCapitalize="none"
//             style={styles.input}
//             placeholderTextColor="#bbb"
//           />
//         </View>
//         <View style={styles.inputWrap}>
//           <Icon name="lock" size={22} color="#aaa" style={styles.icon} />
//           <TextInput
//             placeholder="비밀번호를 입력해주세요"
//             value={password}
//             onChangeText={setPassword}
//             secureTextEntry={!showPassword}
//             style={styles.input}
//             placeholderTextColor="#bbb"
//           />
//           <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
//             <Icon name={showPassword ? 'eye-off' : 'eye'} size={22} color="#aaa" />
//           </TouchableOpacity>
//         </View>
//         <View style={styles.row}>
//           <View style={styles.rowLeft}>
//             <Checkbox
//               status={autoLogin ? 'checked' : 'unchecked'}
//               onPress={() => setAutoLogin(!autoLogin)}
//             />
//             <Text style={styles.autoLoginText}>자동 로그인</Text>
//           </View>
//           <TouchableOpacity>
//             <Text style={styles.forgotText}>비밀번호를 잊어버렸어요</Text>
//           </TouchableOpacity>
//         </View>
//         <TouchableOpacity style={styles.loginBtn} onPress={login}>
//           <Text style={styles.loginBtnText}>로그인</Text>
//         </TouchableOpacity>
//         <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
//           <Text style={styles.signupText}>회원가입할래요</Text>
//         </TouchableOpacity>
//       </View>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   safe: { flex: 1, backgroundColor: '#f3f4fa' },
//   container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: '#f3f4fa' },
//   title: { fontSize: 44, fontWeight: 'bold', color: '#1a2956', marginBottom: 40, alignSelf: 'flex-start' },
//   inputWrap: {
//     flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 24,
//     paddingHorizontal: 16, marginBottom: 16, width: '100%', height: 48, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 2, elevation: 1
//   },
//   icon: { marginRight: 8 },
//   input: { flex: 1, fontSize: 16, color: '#222' },
//   row: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 24 },
//   rowLeft: { flexDirection: 'row', alignItems: 'center' },
//   autoLoginText: { color: '#bbb', marginLeft: 4 },
//   forgotText: { color: '#bbb', textDecorationLine: 'underline', fontSize: 13 },
//   loginBtn: { backgroundColor: '#fff', borderRadius: 24, width: '100%', height: 48, justifyContent: 'center', alignItems: 'center', marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 2, elevation: 1 },
//   loginBtnText: { fontSize: 18, color: '#1a2956', fontWeight: 'bold' },
//   signupText: { color: '#bbb', fontSize: 15, marginTop: 8 },
// }); 
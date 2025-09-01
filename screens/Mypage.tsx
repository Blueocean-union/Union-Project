import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const ProfileScreen = () => {
  const [email, setEmail] = useState('123@gmail.com');
  const [name, setName] = useState('홍길동');
  const [password, setPassword] = useState('1234567');
  const [school, setSchool] = useState('숭실대학교');
  const [department, setDepartment] = useState('소프트웨어학부');
  
  const [showPassword, setShowPassword] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
    
    {/* Back Button */}
      <TouchableOpacity style={styles.backButtonTop}>
        <Ionicons name="chevron-back" size={40} color="#666" />
      </TouchableOpacity>

      {/* Profile Section */}
      <View style={styles.profileSection}>
        <View style={styles.profileIconContainer}>
          <Ionicons name="person-circle-outline" size={80} color="#1A346F" />
        </View>
        <Text style={styles.profileName}>홍길동</Text>
      </View>

      {/* Form Section */}
      <View style={styles.formSection}>
        {/* Email Input */}
        <View style={styles.inputContainer}>
          <View style={styles.inputIcon}>
            <Ionicons name="mail-outline" size={24} color="#C0C2D0" />
          </View>
          <TextInput
            style={styles.textInput}
            value={email}
            onChangeText={setEmail}
            placeholder="이메일"
            placeholderTextColor="#C0C2D0"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* Name Input */}
        <View style={styles.inputContainer}>
          <View style={styles.inputIcon}>
            <Ionicons name="person-outline" size={24} color="#C0C2D0" />
          </View>
          <TextInput
            style={styles.textInput}
            value={name}
            onChangeText={setName}
            placeholder="이름"
            placeholderTextColor="#C0C2D0"
          />
        </View>

        {/* Password Input */}
        <View style={styles.inputContainer}>
          <View style={styles.inputIcon}>
            <Ionicons name="lock-closed-outline" size={24} color="#C0C2D0" />
          </View>
          <TextInput
            style={[styles.textInput, styles.passwordInput]}
            value={password}
            onChangeText={setPassword}
            placeholder="비밀번호"
            placeholderTextColor="#C0C2D0"
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Ionicons
              name={showPassword ? "eye-off-outline" : "eye-outline"}
              size={24}
              color="#C0C2D0"
            />
          </TouchableOpacity>
        </View>

        {/* School Input */}
        <View style={styles.inputContainer}>
          <View style={styles.inputIcon}>
            <Ionicons name="school-outline" size={24} color="#C0C2D0" />
          </View>
          <TextInput
            style={styles.textInput}
            value={school}
            onChangeText={setSchool}
            placeholder="학교"
            placeholderTextColor="#C0C2D0"
          />
        </View>

        {/* Department Input */}
        <View style={styles.inputContainer}>
          <View style={styles.inputIcon}>
            <Ionicons name="library-outline" size={24} color="#C0C2D0" />
          </View>
          <TextInput
            style={styles.textInput}
            value={department}
            onChangeText={setDepartment}
            placeholder="학과"
            placeholderTextColor="#C0C2D0"
          />
        </View>
      </View>

      {/* Submit Button */}
      <View style={styles.buttonSection}>
        <TouchableOpacity style={styles.submitButton}>
          <Text style={styles.submitButtonText}>수정</Text>
        </TouchableOpacity>
      </View>

      {/* Footer Links */}
      <View style={styles.footer}>
        <TouchableOpacity>
          <Text style={styles.footerLink}>회원탈퇴</Text>
        </TouchableOpacity>
        <Text style={styles.separator}>|</Text>
        <TouchableOpacity>
          <Text style={styles.footerLink}>로그아웃</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EEEFF6',
  },
  backButtonTop: {
    position: 'absolute',
    left: 16,
    top: 50,
    zIndex: 1,
    padding: 4,
  },
  profileSection: {
    marginTop:40,
    alignItems: 'center',
    paddingVertical: 0,
  },
  profileIconContainer: {
    marginBottom: -11,
  },
  profileName: {
    fontSize: 30,
    fontWeight: '500',
    color: '#1A346F',
  },
  formSection: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 30,
    marginBottom: 27,
    paddingVertical: 3,
    marginHorizontal: 400,
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
    color: '#C0C2D0',
  },
  passwordInput: {
    paddingRight: 48,
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    padding: 4,
  },
  buttonSection: {
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  submitButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 30,
    paddingBottom: 20,
  },
  footerLink: {
    fontSize: 14,
    color: '#666',
  },
  separator: {
    fontSize: 14,
    color: '#666',
    marginHorizontal: 12,
  },
});

export default ProfileScreen;
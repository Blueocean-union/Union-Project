// src/App.tsx
import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme, Theme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// === Screens (현재 폴더 구조에 맞게 import) ===
import AuthStackScreen from './screens/auth/AuthStack';
import SplashScreen from './screens/auth/SplashScreen';
import MainTabs from './navigation/MainTabs';

// === Root Stack Param Types ===
export type RootStackParamList = {
  Splash: undefined;
  Auth: undefined;
  Main: undefined;
};

const RootStack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const scheme = useColorScheme();
  const theme: Theme = scheme === 'dark' ? DarkTheme : DefaultTheme;

  return (
    <NavigationContainer theme={theme}>
      <StatusBar barStyle={scheme === 'dark' ? 'light-content' : 'dark-content'} />
      <RootStack.Navigator
        initialRouteName="Splash"
        screenOptions={{ headerShown: false, animation: 'fade' }}
      >
        {/* 앱 시작 시 토큰/세션 체크 → 내부에서 Auth/Main 분기 */}
        <RootStack.Screen name="Splash" component={SplashScreen} />
        {/* 로그인/회원가입 스택 (screens/auth/AuthStack.tsx) */}
        <RootStack.Screen name="Auth" component={AuthStackScreen} />
        {/* 메인 탭 (screens/MainTabs.tsx) */}
        <RootStack.Screen name="Main" component={MainTabs} />
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

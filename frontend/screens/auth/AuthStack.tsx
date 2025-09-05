import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from './LoginScreen';
import SignupScreen from './SignupScreen';
import LogoutScreen from './LogoutScreen';

export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
  Logout: undefined;
};

const AuthStack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthStackScreen() {
  return (
    <AuthStack.Navigator
      initialRouteName="Login"
      screenOptions={{ headerShown: false, animation: 'fade' }}
    >
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Signup" component={SignupScreen} />
      <AuthStack.Screen name="Logout" component={LogoutScreen} />
    </AuthStack.Navigator>
  );
}

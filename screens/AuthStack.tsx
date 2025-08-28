import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import LoginScreen from './LoginScreen';
import LogoutScreen from './LogoutScreen';
import SignupScreen from './SignupScreen';

const AuthStack = createNativeStackNavigator();

export default function AuthStackScreen() {
    return (
      <AuthStack.Navigator screenOptions={{ headerShown: false }}>
        <AuthStack.Screen name="Login" component={LoginScreen} />
        <AuthStack.Screen name="Signup" component={SignupScreen} />
        <AuthStack.Screen name="Logout" component={LogoutScreen} />
      </AuthStack.Navigator>
    );
  }
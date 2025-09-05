import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import HomeScreen from '../screens/home/HomeScreen';
import LogoutScreen from '../screens/auth/LogoutScreen';
import { TouchableOpacity, Text } from 'react-native';

const Stack = createNativeStackNavigator();

export default function HomeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="HomeMain"
        component={HomeScreen}
        options={({ navigation }) => ({
          title: '홈',
          headerRight: () => (
            <TouchableOpacity
              onPress={() => navigation.navigate('Logout')}
              style={{ marginRight: 16 }}
            >
              <Text style={{ color: '#FF3B30', fontWeight: 'bold' }}>로그아웃</Text>
            </TouchableOpacity>
          ),
        })}
      />
      <Stack.Screen name="Logout" component={LogoutScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

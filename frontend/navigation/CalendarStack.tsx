import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import CalendarAppScreen from '../screens/schedule/CalendarAppScreen';

const Stack = createNativeStackNavigator();

export default function CalendarStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CalendarApp" component={CalendarAppScreen} />
    </Stack.Navigator>
  );
}

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import SubjectListScreen from '../screens/subject/SubjectListScreen';
import SubjectDetailScreen from '../screens/subject/SubjectDetailScreen';

const Stack = createNativeStackNavigator();

export default function SubjectStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SubjectList" component={SubjectListScreen} />
      <Stack.Screen name="SubjectDetail" component={SubjectDetailScreen} />
    </Stack.Navigator>
  );
}

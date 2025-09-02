// screens/SubjectStack.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SubjectListScreen from './SubjectListScreen';
import SubjectDetailScreen from './SubjectDetailScreen';

export type SubjectStackParamList = {
  SubjectList: undefined;
  SubjectDetail: { subject: any };
  QuizSelect: undefined;
  QuizRoom: undefined;
  QuizResult: undefined;
};

const Stack = createNativeStackNavigator<SubjectStackParamList>();

export default function SubjectStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="SubjectList"
        component={SubjectListScreen as unknown as React.ComponentType<any>}
      />
      <Stack.Screen
        name="SubjectDetail"
        component={SubjectDetailScreen as unknown as React.ComponentType<any>}
      />
    </Stack.Navigator>
  );
}

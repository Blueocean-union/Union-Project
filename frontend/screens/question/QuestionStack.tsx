// frontend/screens/question/QuestionStack.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import QuestionCategoryScreen from './QuestionCategoryScreen';
import QuestionListScreen from './QuestionListScreen';
import QuestionDetailScreen from './QuestionDetailScreen';
import QuestionCreateScreen from './QuestionCreateScreen';
import QuestionEditScreen from './QuestionEditScreen';

export type QuestionStackParamList = {
  QuestionCategory: undefined;
  QuestionList: { categoryId: number } | undefined;
  QuestionDetail: { question: any };
  QuestionCreate: { categoryId?: number } | undefined;
  QuestionEdit: { question: any };
};

const Stack = createNativeStackNavigator<QuestionStackParamList>();

export default function QuestionStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="QuestionCategory" component={QuestionCategoryScreen} />
      <Stack.Screen name="QuestionList" component={QuestionListScreen} />
      <Stack.Screen name="QuestionDetail" component={QuestionDetailScreen} />
      <Stack.Screen name="QuestionCreate" component={QuestionCreateScreen} />
      <Stack.Screen name="QuestionEdit" component={QuestionEditScreen} />
    </Stack.Navigator>
  );
}

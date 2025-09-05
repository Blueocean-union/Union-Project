// screens/QuestionStack.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import QuestionCategoryScreen from '../../../screens_spare/QuestionCategoryScreen';
import QuestionListScreen from './QuestionListScreen';
import QuestionDetailScreen from './QuestionDetailScreen';
import QuestionCreateScreen from '../../../screens_spare/QuestionCreateScreen';
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
      <Stack.Screen
        name="QuestionCategory"
        component={QuestionCategoryScreen as unknown as React.ComponentType<any>}
        options={{ title: '질문 카테고리' }}
      />
      <Stack.Screen
        name="QuestionList"
        component={QuestionListScreen as unknown as React.ComponentType<any>}
        options={{ title: '질문 목록' }}
      />
      <Stack.Screen
        name="QuestionDetail"
        component={QuestionDetailScreen as unknown as React.ComponentType<any>}
        options={{ title: '질문 상세' }}
      />
      <Stack.Screen
        name="QuestionCreate"
        component={QuestionCreateScreen as unknown as React.ComponentType<any>}
        options={{ title: '질문 등록' }}
      />
      <Stack.Screen
        name="QuestionEdit"
        component={QuestionEditScreen as unknown as React.ComponentType<any>}
        options={{ title: '질문 수정' }}
      />
    </Stack.Navigator>
  );
}

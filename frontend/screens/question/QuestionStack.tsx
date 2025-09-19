// QuestionStack.tsx - 이 부분을 확인해주세요

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import QuestionCategoryScreen from './QuestionCategoryScreen';
import QuestionListScreen from './QuestionListScreen';
import QuestionDetailScreen from './QuestionDetailScreen';
import QuestionCreateScreen from './QuestionCreateScreen'; // 이 import가 있는지 확인
import QuestionEditScreen from './QuestionEditScreen';
import AnswerWriteScreen from './AnswerWriteScreen';

export type Category = {
  id: number;
  title: string;
  tags: string;
  icon: string;
  color: string;
};

export type Post = {
  id: number;
  title: string;
  content: string;
  writerName: string;
  writerId: number;
  createdAt: string;
  updatedAt: string;
  categoryId: number;
  views: number;
};

export type Answer = {
  id: number;
  content: string;
  writerName: string;
  writerId: number;
  createdAt: string;
  updatedAt: string;
  postId: number;
};

// 이 타입 정의가 맞는지 확인
export type QuestionStackParamList = {
  QuestionCategory: undefined;
  QuestionList: { category: Category };
  QuestionDetail: { question: Post };
  QuestionCreate: { category?: Category }; // 이 부분이 중요
  QuestionEdit: { question: Post };
  AnswerWrite: { postId: number; answer?: Answer };
};

const Stack = createNativeStackNavigator<QuestionStackParamList>();

export default function QuestionStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="QuestionCategory"
        component={QuestionCategoryScreen}
      />
      <Stack.Screen
        name="QuestionList"
        component={QuestionListScreen}
      />
      <Stack.Screen
        name="QuestionDetail"
        component={QuestionDetailScreen}
      />
      <Stack.Screen
        name="QuestionCreate"
        component={QuestionCreateScreen} // 이 부분이 올바른지 확인
      />
      <Stack.Screen
        name="QuestionEdit"
        component={QuestionEditScreen}
      />
      <Stack.Screen
        name="AnswerWrite"
        component={AnswerWriteScreen}
      />
    </Stack.Navigator>
  );
}


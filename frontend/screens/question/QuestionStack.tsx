import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import QuestionCategoryScreen from './QuestionCategoryScreen';
import QuestionListScreen from './QuestionListScreen';
import QuestionDetailScreen from './QuestionDetailScreen';
import QuestionCreateScreen from './QuestionCreateScreen';
import QuestionEditScreen from './QuestionEditScreen';
import AnswerWriteScreen from './AnswerWriteScreen';

// QuestionCategoryScreen에서 전달하는 카테고리 타입 정의
export type Category = {
  id: number;
  title: string;
  tags: string;
  icon: string;
  color: string;
};

// Post 타입 정의 (백엔드 API 응답과 일치해야 함)
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

// Answer 타입 정의 (백엔드 API 응답과 일치해야 함)
export type Answer = {
  id: number;
  content: string;
  writerName: string;
  writerId: number;
  createdAt: string;
  updatedAt: string;
  postId: number;
};

// 스택 내비게이션에 사용될 모든 화면의 파라미터 타입을 정확하게 정의합니다.
export type QuestionStackParamList = {
  QuestionCategory: undefined;
  QuestionList: { category: Category };
  QuestionDetail: { question: Post };
  QuestionCreate: { category?: Category };
  QuestionEdit: { question: Post };
  AnswerWrite: { postId: number; answer?: Answer };
};

const Stack = createNativeStackNavigator<QuestionStackParamList>();

export default function QuestionStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="QuestionCategory"
        component={QuestionCategoryScreen as React.ComponentType<any>}
      />
      <Stack.Screen
        name="QuestionList"
        component={QuestionListScreen as React.ComponentType<any>}
      />
      <Stack.Screen
        name="QuestionDetail"
        component={QuestionDetailScreen as React.ComponentType<any>}
      />
      <Stack.Screen
        name="QuestionCreate"
        component={QuestionCreateScreen as React.ComponentType<any>}
      />
      <Stack.Screen
        name="QuestionEdit"
        component={QuestionEditScreen as React.ComponentType<any>}
      />
      <Stack.Screen
        name="AnswerWrite"
        component={AnswerWriteScreen as React.ComponentType<any>}
      />
    </Stack.Navigator>
  );
}

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import QuestionCategoryScreen from '../screens/question/QuestionCategoryScreen';
import QuestionListScreen from '../screens/question/QuestionListScreen';
import QuestionDetailScreen from '../screens/question/QuestionDetailScreen';

const Stack = createNativeStackNavigator();

export default function QuestionStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="QuestionCategory" component={QuestionCategoryScreen} />
      <Stack.Screen name="QuestionList" component={QuestionListScreen} />
      <Stack.Screen name="QuestionDetail" component={QuestionDetailScreen} />
    </Stack.Navigator>
  );
}

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SubjectListScreen from './SubjectListScreen';
import SubjectDetailScreen from './SubjectDetailScreen';
import SubjectInnerScreen from './SubjectInnerScreen';
import PdfViewerScreen from './PdfViewerScreen';
import AudioPlayerScreen from './AudioPlayerScreen';

export type SubjectStackParamList = {
  SubjectList: undefined;
  SubjectDetail: { subject: any };
  SubjectInner: { subjectId: number; subjectName: string; subjectColor: string };
  PdfViewerScreen: { file: any; fileUri: string; subjectColor: string };
  AudioPlayerScreen: { file: any; fileUri: string; subjectColor: string };
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
      <Stack.Screen
        name="SubjectInner"
        component={SubjectInnerScreen as unknown as React.ComponentType<any>}
      />
      <Stack.Screen
        name="PdfViewerScreen"
        component={PdfViewerScreen as unknown as React.ComponentType<any>}
      />
      <Stack.Screen
        name="AudioPlayerScreen"
        component={AudioPlayerScreen as unknown as React.ComponentType<any>}
      />
    </Stack.Navigator>
  );
}

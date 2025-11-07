import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import CalendarAppScreen from './schedule/CalendarAppScreen';
import MainScreen from './home/MainScreen';
import LogoutScreen from './auth/LogoutScreen';
import QuestionStack from './question/QuestionStack';
// import QuizResultScreen from './quiz/QuizResultScreen';
// import QuizRoomScreen from './quiz/QuizRoomScreen';
// import QuizSelectScreen from './quiz/QuizSelectScreen';
import SearchScreen from './search/SearchScreen';
import SubjectDetailScreen from './subject/SubjectDetailScreen';
import SubjectListScreen from './subject/SubjectListScreen';
import SubjectInnerScreen from './subject/SubjectInnerScreen';
import PDFDrawingScreen from './subject/PDFDrawingScreen';
import AudioPlayerScreen from './subject/AudioPlayerScreen';
import FileSummuryScreen from './subject/FileSummuryScreen';

import { Ionicons } from '@expo/vector-icons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Text, TouchableOpacity, View } from 'react-native';
import CommonStyles from '../styles/CommonStyles';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// SubjectStack 타입 정의
export type SubjectStackParamList = {
  SubjectList: undefined;
  SubjectDetail: { subject: any };
  SubjectInner: { subjectId: number; subjectName: string; subjectColor: string };
  PDFDrawing: { file: any; fileUri: string; subjectColor: string };
  AudioPlayerScreen: { file: any; fileUri: string; subjectColor: string };
  FileSummury: { file: any; subjectColor: string };
};

function SubjectStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SubjectList" component={SubjectListScreen as any} />
      <Stack.Screen name="SubjectDetail" component={SubjectDetailScreen as any} />
      <Stack.Screen name="SubjectInner" component={SubjectInnerScreen as any} />
      <Stack.Screen name="PDFDrawing" component={PDFDrawingScreen as any} />
      <Stack.Screen name="AudioPlayerScreen" component={AudioPlayerScreen as any} />
      <Stack.Screen name="FileSummury" component={FileSummuryScreen as any} />
    </Stack.Navigator>
  );
}



// function QuizStack() {
//   return (
//     <Stack.Navigator screenOptions={{ headerShown: false }}>
//       <Stack.Screen name="QuizSelect" component={QuizSelectScreen} />
//       <Stack.Screen name="QuizRoom" component={QuizRoomScreen} />
//       <Stack.Screen name="QuizResult" component={QuizResultScreen} />
//     </Stack.Navigator>
//   );
// }

function CalendarStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CalendarApp" component={CalendarAppScreen} />
    </Stack.Navigator>
  );
}

// 검색 스택
function SearchStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SearchMain" component={SearchScreen} />
      {/* 여기에 검색 결과 화면, 검색 필터 화면 등을 추가할 수 있습니다 */}
    </Stack.Navigator>
  );
}

// 홈 스택 (MainScreen 사용하도록 수정)
function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="HomeMain"
        component={MainScreen} // HomeScreen 대신 MainScreen 사용
      />
      <Stack.Screen name="Logout" component={LogoutScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

// 탭 이름에 따른 아이콘 매핑
const TAB_ICONS: Record<string, string> = {
  '홈': 'home',
  '과목': 'book-outline',
  '질문방': 'help-circle-outline',
  // '퀴즈': 'help-buoy-outline',
  '일정': 'calendar',
  '검색': 'search',
};

function MyTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  return (
    <View style={CommonStyles.tabBar}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label: string =
          options.tabBarLabel !== undefined
            ? (options.tabBarLabel as string)
            : options.title !== undefined
            ? (options.title as string)
            : route.name;
        const isFocused = state.index === index;
        const iconName = TAB_ICONS[label] || 'ellipse';
        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };
        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            onPress={onPress}
            style={CommonStyles.tabItem}
          >
            <Ionicons
              name={iconName as any}
              size={24}
              color={isFocused ? '#4A90E2' : '#999'}
            />
            <Text style={isFocused ? CommonStyles.activeTabText : CommonStyles.tabText}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props: any) => <MyTabBar {...props} />}
    >
      <Tab.Screen name="과목" component={SubjectStack} />
      <Tab.Screen name="일정" component={CalendarStack} />
      <Tab.Screen name="홈" component={HomeStack} />
      <Tab.Screen name="질문방" component={QuestionStack} />
      {/* <Tab.Screen name="퀴즈" component={QuizStack} /> */}
      <Tab.Screen name="검색" component={SearchStack} />
    </Tab.Navigator>
  );
}
// screens/MainTabs.tsx
import React from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// 단일 스크린들
import HomeScreen from './HomeScreen';
import SearchScreen from './SearchScreen';
import LogoutScreen from './LogoutScreen';
import { CalendarAppScreen } from './CalendarAppScreen'; // named export

// 스택 네비게이터(별도 파일로 분리된 것 사용)
import QuestionStack from './QuestionStack';
import SubjectStack from './SubjectStack';

export type RootTabParamList = {
  Home: undefined;
  Questions: undefined;
  Subjects: undefined;
  Search: undefined;
  Calendar: undefined;
  Logout: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        // ❌ CommonStyles.tabBar 같은 커스텀 스타일은 사용하지 않습니다.
        tabBarIcon: ({ color, size }) => {
          const iconName =
            route.name === 'Home' ? 'home' :
            route.name === 'Questions' ? 'help-circle' :
            route.name === 'Subjects' ? 'book' :
            route.name === 'Search' ? 'search' :
            route.name === 'Calendar' ? 'calendar' :
            'log-out';
          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen as React.ComponentType<any>}
        options={{ title: '홈' }}
      />
      <Tab.Screen
        name="Questions"
        component={QuestionStack as React.ComponentType<any>}
        options={{ title: '질문' }}
      />
      <Tab.Screen
        name="Subjects"
        component={SubjectStack as React.ComponentType<any>}
        options={{ title: '과목' }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen as React.ComponentType<any>}
        options={{ title: '검색' }}
      />
      <Tab.Screen
        name="Calendar"
        component={CalendarAppScreen as React.ComponentType<any>}
        options={{ title: '일정' }}
      />
      <Tab.Screen
        name="Logout"
        component={LogoutScreen as React.ComponentType<any>}
        options={{ title: '로그아웃' }}
      />
    </Tab.Navigator>
  );
}
export type QuestionStackParamList = {
  QuestionCategory: undefined;
  // 둘 다 허용: categoryId 또는 category
  QuestionList: { categoryId?: number; category?: any } | undefined;
  QuestionDetail: { question: any };
  QuestionCreate: { categoryId?: number; category?: any } | undefined;
  QuestionEdit: { question: any };
};

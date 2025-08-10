import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import CalendarAppScreen from './schedule/CalendarAppScreen';
import HomeScreen from './home/HomeScreen';
import LogoutScreen from './auth/LogoutScreen';
import QuestionCategoryScreen from './question/QuestionCategoryScreen';
import QuestionDetailScreen from './question/QuestionDetailScreen';
import QuestionListScreen from './question/QuestionListScreen';
import SearchScreen from './search/SearchScreen';
import SubjectDetailScreen from './subject/SubjectDetailScreen';
import SubjectListScreen from './subject/SubjectListScreen';

import { Ionicons } from '@expo/vector-icons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Text, TouchableOpacity, View } from 'react-native';
import CommonStyles from '../styles/CommonStyles';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function SubjectStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SubjectList" component={SubjectListScreen} />
      <Stack.Screen name="SubjectDetail" component={SubjectDetailScreen} />
    </Stack.Navigator>
  );
}

function QuestionStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="QuestionCategory" component={QuestionCategoryScreen} />
      <Stack.Screen name="QuestionList" component={QuestionListScreen} />
      <Stack.Screen name="QuestionDetail" component={QuestionDetailScreen} />
    </Stack.Navigator>
  );
}

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

// 홈 스택 (로그아웃 버튼 포함)
function HomeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="HomeMain"
        component={HomeScreen}
        options={({ navigation }) => ({
          title: '홈',
          headerRight: () => (
            <TouchableOpacity
              onPress={() => navigation.navigate('Logout')}
              style={{ marginRight: 16 }}
            >
              <Text style={{ color: '#FF3B30', fontWeight: 'bold' }}>로그아웃</Text>
            </TouchableOpacity>
          ),
        })}
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
      tabBar={(props) => <MyTabBar {...props} />}
    >
      <Tab.Screen name="과목" component={SubjectStack} />
      <Tab.Screen name="일정" component={CalendarStack} />
      <Tab.Screen name="홈" component={HomeStack} />
      <Tab.Screen name="질문방" component={QuestionStack} />
      <Tab.Screen name="검색" component={SearchStack} />
    </Tab.Navigator>
  );
}

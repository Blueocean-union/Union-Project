import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, TouchableOpacity } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import CommonStyles from '../styles/CommonStyles';

import SubjectStack from './SubjectStack';
import QuestionStack from './QuestionStack';
import CalendarStack from './CalendarStack';
import SearchStack from './SearchStack';
import HomeStack from './HomeStack';

const Tab = createBottomTabNavigator();

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
            onPress={onPress}
            style={CommonStyles.tabItem}
          >
            <Ionicons name={iconName as any} size={24} color={isFocused ? '#4A90E2' : '#999'} />
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
    <Tab.Navigator screenOptions={{ headerShown: false }} tabBar={(props) => <MyTabBar {...props} />}>
      <Tab.Screen name="과목" component={SubjectStack} />
      <Tab.Screen name="일정" component={CalendarStack} />
      <Tab.Screen name="홈" component={HomeStack} />
      <Tab.Screen name="질문방" component={QuestionStack} />
      <Tab.Screen name="검색" component={SearchStack} />
    </Tab.Navigator>
  );
}

import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useLayoutEffect } from 'react';
import { Button, Text, View } from 'react-native';

interface Props {
  navigation: NativeStackNavigationProp<any>;
}

export default function HomeScreen({ navigation }: Props) {
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Button
          title="로그아웃"
          onPress={() => navigation.navigate('Logout')}
          color="#ff3b30" // 빨간색 로그아웃
        />
      ),
    });
  }, [navigation]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>홈 화면입니다</Text>
    </View>
  );
}

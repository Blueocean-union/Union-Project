import React from 'react';
import { Text, View } from 'react-native';
import { CommonStyles } from '../styles/CommonStyles';

export default function LoadingScreen() {
  return (
    <View style={CommonStyles.emptyScreen}>
      <Text style={CommonStyles.emptyScreenTitle}>홈</Text>
      <Text style={CommonStyles.emptyScreenText}>홈 화면입니다.</Text>
    </View>
  );
}
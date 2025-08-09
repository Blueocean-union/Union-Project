import React from 'react';
import { Text, View } from 'react-native';
import { CommonStyles } from '../../styles/CommonStyles';

export default function SearchScreen() {
    return (
    <View style={CommonStyles.emptyScreen}>
        <Text style={CommonStyles.emptyScreenTitle}>검색</Text>
        <Text style={CommonStyles.emptyScreenText}>검색 화면입니다.</Text>
    </View>
    );
}
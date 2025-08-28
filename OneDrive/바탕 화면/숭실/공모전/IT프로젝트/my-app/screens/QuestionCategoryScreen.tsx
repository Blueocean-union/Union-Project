import React from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { QuestionStackParamList, Question } from '../types/question';


type Props = NativeStackScreenProps<QuestionStackParamList, 'QuestionCategory'>;

const categories = [
  { id: 1, title: 'IT/테크', tags: '#컴퓨터 #하드웨어 #운영체제(OS)' },
  { id: 2, title: '사회/정치', tags: '#민원 #행정 #통일' },
  { id: 3, title: '경영/경제', tags: '#금융 #무역 #세금' },
  { id: 4, title: '법학', tags: '#형사사건 #민사소송 #재판' },
  { id: 5, title: '언어', tags: '#한국어 #일본어 #이탈리아어' },
  { id: 6, title: '전기/전자', tags: '#전기이론 #전자공학 #회로' },
];

export default function QuestionCategoryScreen({ navigation }: Props) {
  return (
    <View style={{ flex: 1, padding: 24 }}>
      <Text style={{ fontSize: 32, fontWeight: 'bold' }}>질문방</Text>
      <FlatList
        data={categories}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={{ backgroundColor: '#eef', padding: 16, borderRadius: 12, marginVertical: 8 }}
            onPress={() => navigation.navigate('QuestionList', { category: item })}
          >
            <Text style={{ fontSize: 18, fontWeight: 'bold' }}>{item.title}</Text>
            <Text style={{ marginTop: 4, color: '#666' }}>{item.tags}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

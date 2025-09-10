import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Linking,
} from 'react-native';
import axios from 'axios';

interface SearchResult {
  kind: string;
  title: string;
  htmlTitle: string;
  link: string;
  displayLink: string;
  snippet: string;
  htmlSnippet: string;
  cacheId?: string;
  formattedUrl: string;
}

interface GoogleSearchResponse {
  url?: {
    type: string;
    template: string;
  };
  queries?: {
    request: Array<{
      title: string;
      totalResults: string;
      startIndex: number;
      count: number;
    }>;
    nextPage?: Array<{
      title: string;
      totalResults: string;
      startIndex: number;
      count: number;
    }>;
  };
  searchInformation?: {
    searchTime: number;
    formattedSearchTime: string;
    totalResults: string;
    formattedTotalResults: string;
  };
  items: SearchResult[];
}

interface SearchTab {
  id: string;
  query: string;
  results: SearchResult[];
  isLoading: boolean;
}

export default function SearchScreen() {
  const [searchTabs, setSearchTabs] = useState<SearchTab[]>([
    { id: '1', query: '', results: [], isLoading: false }
  ]);
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [mainQuery, setMainQuery] = useState('');

  // HTML 태그 제거 및 텍스트 정리 함수
  const cleanText = (text: string) => {
    if (!text) return '';
    
    let cleaned = text;
    
    // 1단계: HTML 태그 제거
    cleaned = cleaned.replace(/<[^>]*>/g, '');
    
    // 2단계: URL 인코딩된 부분 찾아서 디코딩
    const urlEncodedPattern = /%[0-9A-Fa-f]{2}/g;
    if (urlEncodedPattern.test(cleaned)) {
      try {
        // URL 인코딩된 부분만 디코딩
        cleaned = cleaned.replace(/%[0-9A-Fa-f]{2}/g, (match) => {
          try {
            return decodeURIComponent(match);
          } catch {
            return match;
          }
        });
      } catch (e) {
        console.log('URL 디코딩 실패:', e);
      }
    }
    
    // 3단계: 전체 문자열 디코딩 시도
    try {
      cleaned = decodeURIComponent(cleaned);
    } catch (e) {
      // 실패하면 원본 유지
    }
    
    // 4단계: HTML 엔티티 제거
    cleaned = cleaned.replace(/&[a-zA-Z]+;/g, '');
    cleaned = cleaned.replace(/&#[0-9]+;/g, '');
    cleaned = cleaned.replace(/&#[xX][0-9a-fA-F]+;/g, '');
    
    // 5단계: 특수 문자 정리
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
    cleaned = cleaned.replace(/[^\w\s가-힣]/g, ' '); // 한글, 영문, 숫자, 공백만 유지
    
    // 6단계: 연속된 공백 제거
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
    
    // 7단계: 너무 짧은 텍스트는 원본 반환
    if (cleaned.length < 3) {
      return text.replace(/<[^>]*>/g, '').trim();
    }
    
    return cleaned;
  };

  // 링크 열기 함수
  const openLink = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('오류', '이 링크를 열 수 없습니다.');
      }
    } catch (error) {
      Alert.alert('오류', '링크를 여는 중 문제가 발생했습니다.');
    }
  };

  const addSearchTab = () => {
    if (searchTabs.length >= 5) {
      Alert.alert('알림', '최대 5개까지 검색 탭을 만들 수 있습니다.');
      return;
    }
    
    const newTab: SearchTab = {
      id: Date.now().toString(),
      query: '',
      results: [],
      isLoading: false
    };
    
    setSearchTabs([...searchTabs, newTab]);
    setActiveTabIndex(searchTabs.length);
  };

  const removeSearchTab = (tabId: string) => {
    if (searchTabs.length <= 1) {
      Alert.alert('알림', '최소 1개의 검색 탭은 유지해야 합니다.');
      return;
    }
    
    const newTabs = searchTabs.filter(tab => tab.id !== tabId);
    setSearchTabs(newTabs);
    
    if (activeTabIndex >= newTabs.length) {
      setActiveTabIndex(newTabs.length - 1);
    }
  };

  const updateTabQuery = (tabId: string, query: string) => {
    setSearchTabs(tabs =>
      tabs.map(tab =>
        tab.id === tabId ? { ...tab, query } : tab
      )
    );
  };

  const searchGoogle = async (query: string, tabId: string) => {
    if (!query.trim()) return;

    setSearchTabs(tabs =>
      tabs.map(tab =>
        tab.id === tabId ? { ...tab, isLoading: true } : tab
      )
    );

    try {
      console.log('검색 요청 시작:', query);
      
      // 토큰 가져오기
      const token = await AsyncStorage.getItem('accessToken');
      console.log('토큰 확인:', token ? '있음' : '없음');
      
      const response = await axios.get<GoogleSearchResponse>('http://52.78.209.115:8080/api/search', {
        params: {
          q: query.trim(),
          start: 1,
          num: 10,
          gl: 'KR',
          lr: 'lang_ko',
          safe: 'off'
        },
        headers: {
          'Authorization': token ? `Bearer ${token}` : undefined,
          'Content-Type': 'application/json'
        }
      });

      console.log('검색 응답:', response.data);
      
      // Google API 응답에서 items 배열 추출
      const searchResults = response.data?.items || [];
      
      // 디버깅: 원본 데이터 확인
      if (searchResults.length > 0) {
        console.log('첫 번째 결과 원본:', searchResults[0]);
        console.log('제목 원본:', searchResults[0].title);
        console.log('제목 정리 후:', cleanText(searchResults[0].title));
      }

      setSearchTabs(tabs =>
        tabs.map(tab =>
          tab.id === tabId 
            ? { ...tab, results: searchResults, isLoading: false }
            : tab
        )
      );
    } catch (error: any) {
      console.error('검색 오류:', error);
      console.error('오류 상세:', error.response?.data || error.message);
      
      let errorMessage = '검색 중 문제가 발생했습니다.';
      if (error.response?.status === 400) {
        errorMessage = '검색 요청이 잘못되었습니다.';
      } else if (error.response?.status === 401) {
        errorMessage = '인증이 필요합니다.';
      } else if (error.response?.status === 403) {
        errorMessage = '검색 권한이 없습니다.';
      } else if (error.response?.status === 429) {
        errorMessage = '검색 요청 한도를 초과했습니다.';
      } else if (error.response?.status >= 500) {
        errorMessage = '서버 오류가 발생했습니다.';
      }
      
      Alert.alert('오류', errorMessage);
      
      setSearchTabs(tabs =>
        tabs.map(tab =>
          tab.id === tabId ? { ...tab, isLoading: false } : tab
        )
      );
    }
  };

  const handleMainSearch = () => {
    if (mainQuery.trim()) {
      updateTabQuery(searchTabs[activeTabIndex].id, mainQuery);
      searchGoogle(mainQuery, searchTabs[activeTabIndex].id);
    }
  };

  return (
    <View style={styles.container}>
      {/* 검색 탭 헤더 */}
      <View style={styles.tabHeader}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {searchTabs.map((tab, index) => (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.tabButton,
                index === activeTabIndex && styles.activeTabButton
              ]}
              onPress={() => setActiveTabIndex(index)}
            >
              <Text style={[
                styles.tabText,
                index === activeTabIndex && styles.activeTabText
              ]}>
                {tab.query.trim() ? tab.query : '빈탭'}
              </Text>
              {searchTabs.length > 1 && (
                <TouchableOpacity
                  style={styles.removeTabButton}
                  onPress={() => removeSearchTab(tab.id)}
                >
                  <Ionicons name="close" size={16} color="#666" />
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
        
        {searchTabs.length < 5 && (
          <TouchableOpacity style={styles.addTabButton} onPress={addSearchTab}>
            <Ionicons name="add" size={24} color="#007AFF" />
          </TouchableOpacity>
        )}
      </View>

      {/* 메인 검색 입력 */}
      <View style={styles.mainSearchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.mainSearchInput}
            placeholder="검색어를 입력하세요"
            value={mainQuery}
            onChangeText={setMainQuery}
            onSubmitEditing={handleMainSearch}
            returnKeyType="search"
          />
          <TouchableOpacity onPress={handleMainSearch}>
            <Ionicons name="mic" size={20} color="#666" />
          </TouchableOpacity>
        </View>
      </View>

      {/* 검색 결과 */}
      <ScrollView style={styles.resultsContainer}>
        {searchTabs[activeTabIndex]?.isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>검색 중...</Text>
          </View>
        ) : searchTabs[activeTabIndex]?.results.length > 0 ? (
          searchTabs[activeTabIndex].results.map((result, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.resultItem}
              onPress={() => openLink(result.link)}
              activeOpacity={0.7}
            >
              <View style={styles.resultHeader}>
                <View style={styles.sourceContainer}>
                  <View style={styles.googleLogo}>
                    <Text style={styles.googleText}>G</Text>
                  </View>
                  <Text style={styles.sourceText}>Google</Text>
                </View>
                <Text style={styles.resultDate}>{result.displayLink}</Text>
              </View>
              
              <Text style={styles.resultTitle} numberOfLines={2}>
                {cleanText(result.title)}
              </Text>
              
              <Text style={styles.resultDescription} numberOfLines={3}>
                {cleanText(result.snippet)}
              </Text>
              
              <Text style={styles.resultLink} numberOfLines={1}>
                {result.formattedUrl}
              </Text>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={64} color="#CCC" />
            <Text style={styles.emptyText}>검색어를 입력하고 검색해보세요</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  tabHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E1E5E9',
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#F1F3F4',
    minWidth: 80,
    justifyContent: 'center',
  },
  activeTabButton: {
    backgroundColor: '#007AFF',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#FFF',
  },
  removeTabButton: {
    marginLeft: 8,
    padding: 2,
  },
  addTabButton: {
    padding: 8,
    marginLeft: 8,
  },
  mainSearchContainer: {
    padding: 16,
    backgroundColor: '#FFF',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F3F4',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchIcon: {
    marginRight: 12,
  },
  mainSearchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  resultsContainer: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  resultItem: {
    backgroundColor: '#FFF',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sourceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  googleLogo: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#4285F4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  googleText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  tistoryLogo: {
    marginRight: 8,
  },
  naverLogo: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#03C75A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  naverText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  sourceText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  resultDate: {
    fontSize: 12,
    color: '#999',
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    lineHeight: 22,
  },
  resultDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  resultLink: {
    fontSize: 12,
    color: '#007AFF',
    textDecorationLine: 'underline',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#999',
  },
});
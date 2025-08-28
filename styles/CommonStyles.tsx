import { StyleSheet } from 'react-native';

export const CommonStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  // 헤더(다른 화면에서 이미 쓰고 있을 수 있으니 기본 제공)
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  headerTitle: { fontSize: 18, fontWeight: '700' },

  // 🔽 문제였던 키들 추가
  emptyScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyScreenTitle: { fontSize: 22, fontWeight: '700', marginBottom: 8 },
  emptyScreenText: { fontSize: 14, color: '#666' },
});
export default CommonStyles;

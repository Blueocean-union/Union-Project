// frontend/constants/categoryIcons.ts
import { Ionicons } from '@expo/vector-icons';

export const categoryIcons: Record<string, keyof typeof Ionicons.glyphMap> = {
  'IT/테크': 'laptop-outline',
  '사회/정치': 'people-outline',
  '경영/경제': 'briefcase-outline',
  '법학': 'library-outline',
  '언어': 'chatbubble-ellipses-outline',
  '전기/전자': 'hardware-chip-outline',
};

declare module '@react-native-picker/picker' {
  import * as React from 'react';
  import { ViewStyle, TextStyle } from 'react-native';

  export interface PickerProps {
    selectedValue?: any;
    onValueChange?: (itemValue: any, itemIndex: number) => void;
    style?: ViewStyle | TextStyle | (ViewStyle | TextStyle)[];
    enabled?: boolean;
    mode?: 'dialog' | 'dropdown';
    children?: React.ReactNode; // 🔥 children 허용 추가
  }

  export class Picker extends React.Component<PickerProps> {
    static Item: React.ComponentType<{ label: string; value: any }>;
  }
}

// types/react-native-formdata.d.ts
declare global {
  interface FormData {
    // React Native의 FormData는 RNFile 객체를 허용한다.
    // TS DOM 시그니처가 엄격해서 any 허용으로 보강.
    append(name: string, value: any, fileName?: string): void;
  }
}
export {};

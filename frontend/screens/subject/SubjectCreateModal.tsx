// // screens/SubjectCreateModal.tsx
// import React, { useState } from 'react';
// import {
//   Modal,
//   View,
//   Text,
//   TextInput,
//   Button,
//   StyleSheet,
//   TouchableOpacity,
//   ActivityIndicator,
// } from 'react-native';
// import { createSubject } from '../../libs/api/subject';

// const COLORS = ['#2b3f85', '#e57373', '#64b5f6', '#81c784', '#ffd54f'];

// interface Props {
//   visible: boolean;
//   onClose: () => void;
//   onSuccess: () => void;
// }

// export default function SubjectCreateModal({ visible, onClose, onSuccess }: Props) {
//   const [name, setName] = useState('');
//   const [selectedColor, setSelectedColor] = useState(COLORS[0]);
//   const [loading, setLoading] = useState(false);

//   const handleSubmit = async () => {
//     if (!name.trim()) return;
//     setLoading(true);
//     try {
//       await createSubject({ name, color: selectedColor });
//       setName('');
//       setSelectedColor(COLORS[0]);
//       onClose();
//       onSuccess(); // 새로고침
//     } catch (e) {
//       // 과목 생성 실패 (콘솔 로그 제거)
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Modal visible={visible} animationType="slide" transparent>
//       <View style={styles.overlay}>
//         <View style={styles.modal}>
//           <Text style={styles.title}>새 과목 추가</Text>
//           <TextInput
//             placeholder="과목 이름"
//             value={name}
//             onChangeText={setName}
//             style={styles.input}
//           />
//           <Text style={styles.label}>색상 선택:</Text>
//           <View style={styles.colorList}>
//             {COLORS.map((color) => (
//               <TouchableOpacity
//                 key={color}
//                 style={[
//                   styles.colorCircle,
//                   { backgroundColor: color, borderWidth: selectedColor === color ? 2 : 0 },
//                 ]}
//                 onPress={() => setSelectedColor(color)}
//               />
//             ))}
//           </View>

//           {loading ? <ActivityIndicator /> : <Button title="추가" onPress={handleSubmit} />}
//           <Button title="취소" onPress={onClose} color="#999" />
//         </View>
//       </View>
//     </Modal>
//   );
// }

// const styles = StyleSheet.create({
//   overlay: { flex: 1, justifyContent: 'center', backgroundColor: '#00000099' },
//   modal: { margin: 32, backgroundColor: '#fff', borderRadius: 8, padding: 24, gap: 12 },
//   title: { fontSize: 20, fontWeight: 'bold', textAlign: 'center' },
//   input: { borderWidth: 1, borderColor: '#ccc', padding: 12, borderRadius: 8 },
//   label: { marginTop: 8, fontWeight: 'bold' },
//   colorList: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
//   colorCircle: { width: 32, height: 32, borderRadius: 16, borderColor: '#000' },
// });
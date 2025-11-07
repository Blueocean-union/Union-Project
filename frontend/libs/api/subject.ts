// // libs/subject.ts
// import api from './axios';

// export async function getSubjects() {
//   const res = await api.get('/api/subjects');
//   return res.data;
// }

// export async function createSubject(data: {
//   name: string;
//   color: string;
//   isFavorite?: boolean;
// }) {
//   const res = await api.post('/api/subjects', {
//     ...data,
//     isFavorite: data.isFavorite ?? false,
//   });
//   return res.data;
// }

// export async function deleteSubject(subjectId: number) {
//   const res = await api.delete(`/api/subjects/${subjectId}`);
//   return res.data;
// }

// export async function getSubject(subjectId: number) {
//   const res = await api.get(`/api/subjects/${subjectId}`);
//   return res.data;
// }

// export async function updateSubject(subjectId: number, data: {
//   name?: string;
//   color?: string;
//   isFavorite?: boolean;
// }) {
//   const res = await api.put(`/api/subjects/${subjectId}`, data);
//   return res.data;
// }
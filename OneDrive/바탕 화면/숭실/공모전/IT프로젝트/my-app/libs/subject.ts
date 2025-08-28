// libs/subject.ts
import api from './axios';

export async function getSubjects() {
  const res = await api.get('/api/subjects');
  return res.data;
}

export async function createSubject(data: {
  name: string;
  color: string;
  isFavorite?: boolean;
}) {
  const res = await api.post('/api/subjects', {
    ...data,
    isFavorite: data.isFavorite ?? false,
  });
  return res.data;
}

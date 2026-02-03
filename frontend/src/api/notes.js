import client from './client';

export const notesApi = {
  getAll: (category) => client.get('/notes', { params: { category } }),
  get: (id) => client.get(`/notes/${id}`),
  create: (note) => client.post('/notes', { note }),
  update: (id, note) => client.patch(`/notes/${id}`, { note }),
  delete: (id) => client.delete(`/notes/${id}`),
};

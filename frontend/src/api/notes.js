import client from './client';

export const notesApi = {
  getAll: (category) => client.get('/notes', { params: { category } }),
  get: (id) => client.get(`/notes/${id}`),
  create: (note) => client.post('/notes', { note }),
  update: (id, note) => client.patch(`/notes/${id}`, { note }),
  delete: (id) => client.delete(`/notes/${id}`),

  // Linked Tasks (link from note side uses task's endpoint)
  linkTask: (noteId, taskId) => client.post(`/tasks/${taskId}/linked_notes`, { note_id: noteId }),
  unlinkTask: (noteId, taskId) => client.delete(`/tasks/${taskId}/linked_notes/${noteId}`),
};

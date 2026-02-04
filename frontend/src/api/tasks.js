import client from './client';

export const tasksApi = {
  getForDate: (date) => client.get('/tasks', { params: { date } }),
  get: (id) => client.get(`/tasks/${id}`),
  create: (task) => client.post('/tasks', { task }),
  update: (id, task) => client.patch(`/tasks/${id}`, { task }),
  delete: (id) => client.delete(`/tasks/${id}`),

  // Task Updates (progress notes)
  getUpdates: (taskId) => client.get(`/tasks/${taskId}/updates`),
  addUpdate: (taskId, content) => client.post(`/tasks/${taskId}/updates`, { task_update: { content } }),
  deleteUpdate: (taskId, updateId) => client.delete(`/tasks/${taskId}/updates/${updateId}`),

  // Linked Notes
  linkNote: (taskId, noteId) => client.post(`/tasks/${taskId}/linked_notes`, { note_id: noteId }),
  unlinkNote: (taskId, noteId) => client.delete(`/tasks/${taskId}/linked_notes/${noteId}`),
};

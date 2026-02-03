import client from './client';

export const tasksApi = {
  getForDate: (date) => client.get('/tasks', { params: { date } }),
  get: (id) => client.get(`/tasks/${id}`),
  create: (task) => client.post('/tasks', { task }),
  update: (id, task) => client.patch(`/tasks/${id}`, { task }),
  delete: (id) => client.delete(`/tasks/${id}`),
};

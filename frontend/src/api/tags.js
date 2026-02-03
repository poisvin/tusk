import client from './client';

export const tagsApi = {
  getAll: () => client.get('/tags'),
  create: (tag) => client.post('/tags', { tag }),
  update: (id, tag) => client.patch(`/tags/${id}`, { tag }),
  delete: (id) => client.delete(`/tags/${id}`),
};

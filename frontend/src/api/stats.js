import client from './client';

export const statsApi = {
  getDashboard: () => client.get('/stats/dashboard'),
};

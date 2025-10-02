import api from '../utils/api';

export const artistService = {
  getAll: async (params = {}) => {
    const response = await api.get('/artists', { params });
    return response.data;
  },

  getById: async (artistId) => {
    const response = await api.get(`/artists/${artistId}`);
    return response.data;
  },

  create: async (artistData) => {
    const response = await api.post('/artists', artistData);
    return response.data;
  }
};
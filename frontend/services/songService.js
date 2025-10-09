import api from '../utils/api';

export const songService = {
  // Obtener todas las canciones
  getAll: async (params = {}) => {
    const response = await api.get('/songs', { params });
    return response.data;
  },

  // Obtener canción por ID
  getById: async (songId) => {
    const response = await api.get(`/songs/${songId}`);
    return response.data;
  },

  // Crear canción
  create: async (songData) => {
    const response = await api.post('/songs', songData);
    return response.data;
  }
};
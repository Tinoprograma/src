import api from '../utils/api';

export const annotationService = {
  // Obtener anotaciones de una canción
  getBySongId: async (songId) => {
    const response = await api.get(`/annotations/song/${songId}`);
    return response.data;
  },

  // Crear nueva anotación
  create: async (annotationData) => {
    const response = await api.post('/annotations', annotationData);
    return response.data;
  },

  // Votar anotación
  vote: async (annotationId, voteType) => {
    const response = await api.post(`/annotations/${annotationId}/vote`, { vote_type: voteType });
    return response.data;
  },

  // Actualizar anotación
  update: async (annotationId, data) => {
    const response = await api.put(`/annotations/${annotationId}`, data);
    return response.data;
  },

  // Eliminar anotación
  delete: async (annotationId) => {
    const response = await api.delete(`/annotations/${annotationId}`);
    return response.data;
  }
};
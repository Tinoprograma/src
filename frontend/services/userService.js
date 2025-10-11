import api from '../utils/api';

export const userService = {
  // Obtener perfil del usuario actual
  getProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },

  // Actualizar perfil
  updateProfile: async (profileData) => {
    const response = await api.put('/users/profile', profileData);
    return response.data;
  },

  // Obtener usuario por username
  getByUsername: async (username) => {
    const response = await api.get(`/users/${username}`);
    return response.data;
  },

  // Obtener estadísticas de usuario
  getStats: async (username) => {
    const response = await api.get(`/users/${username}/stats`);
    return response.data;
  },

  // Obtener anotaciones de usuario
  getAnnotations: async (username, params = {}) => {
    const response = await api.get(`/users/${username}/annotations`, { params });
    return response.data;
  }
};

export default userService;
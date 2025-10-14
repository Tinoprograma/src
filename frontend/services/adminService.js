import api from '../utils/api';

export const adminService = {
  // ✅ NUEVO: Verificar anotación
  verifyAnnotation: async (annotationId, verified) => {
    try {
      const response = await api.patch(
        `/admin/annotations/${annotationId}/verify`,
        { verified }
      );
      return response.data;
    } catch (error) {
      console.error('Error verificando anotación:', error);
      throw error;
    }
  },

  // ✅ NUEVO: Eliminar anotación con razón
  deleteAnnotation: async (annotationId, reason) => {
    try {
      const response = await api.delete(
        `/admin/annotations/${annotationId}`,
        { data: { reason } }
      );
      return response.data;
    } catch (error) {
      console.error('Error eliminando anotación:', error);
      throw error;
    }
  },

  // ✅ NUEVO: Actualizar letras de canción
  updateSongLyrics: async (songId, lyrics, reason) => {
    try {
      const response = await api.patch(
        `/admin/songs/${songId}/lyrics`,
        { lyrics, reason }
      );
      return response.data;
    } catch (error) {
      console.error('Error actualizando letras:', error);
      throw error;
    }
  },

  // ✅ NUEVO: Eliminar canción
  deleteSong: async (songId, reason) => {
    try {
      const response = await api.delete(
        `/admin/songs/${songId}`,
        { data: { reason } }
      );
      return response.data;
    } catch (error) {
      console.error('Error eliminando canción:', error);
      throw error;
    }
  },

  // ✅ Obtener logs de auditoría (ya existía)
  getAuditLogs: async (params = {}) => {
    try {
      const response = await api.get('/admin/audit-logs', { params });
      return response.data;
    } catch (error) {
      console.error('Error obteniendo logs:', error);
      throw error;
    }
  }
};

export default adminService;
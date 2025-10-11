import api from '../utils/api';

export const adminService = {
  // Verificar anotación
  verifyAnnotation: async (annotationId, verified) => {
    const response = await api.patch(
      `/admin/annotations/${annotationId}/verify`,
      { verified }
    );
    return response.data;
  },

  // Eliminar anotación
  deleteAnnotation: async (annotationId, reason) => {
    const response = await api.delete(
      `/admin/annotations/${annotationId}`,
      { data: { reason } }
    );
    return response.data;
  },

  // Obtener logs de auditoría
  getAuditLogs: async (params = {}) => {
    const response = await api.get('/admin/audit-logs', { params });
    return response.data;
  }
};

export default adminService;
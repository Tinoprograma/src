import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class AnnotationService {
  constructor() {
    this.baseURL = `${API_BASE_URL}/annotations`;
    
    // Configurar axios con interceptores
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Interceptor para agregar token automáticamente
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Interceptor para manejar respuestas
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error(' Error en petición:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  // Obtener todas las anotaciones de una canción
  async getBySongId(songId) {
    try {
      console.log(' Fetching annotations for song:', songId);
      
      const response = await this.client.get(`/song/${songId}`);
      
      console.log('  Annotations received:', response.data.annotations?.length || 0);
      return response.data;
    } catch (error) {
      console.error(' Error fetching annotations:', error.message);
      throw error;
    }
  }

  // Obtener una anotación específica
  async getById(annotationId) {
    try {
      console.log(' Fetching annotation:', annotationId);
      
      const response = await this.client.get(`/${annotationId}`);
      
      console.log('  Annotation received');
      return response.data;
    } catch (error) {
      console.error(' Error fetching annotation:', error.message);
      throw error;
    }
  }

  // Crear una nueva anotación
  async create(annotationData) {
    try {
      console.log(' Creating annotation:', annotationData);
      
      const response = await this.client.post('/', annotationData);
      
      console.log('  Annotation created:', response.data.annotation?.id);
      return response.data;
    } catch (error) {
      console.error(' Error creating annotation:', error.message);
      throw error;
    }
  }

  // Actualizar una anotación
  async update(annotationId, annotationData) {
    try {
      console.log(' Updating annotation:', annotationId);
      
      const response = await this.client.put(`/${annotationId}`, annotationData);
      
      console.log('  Annotation updated');
      return response.data;
    } catch (error) {
      console.error(' Error updating annotation:', error.message);
      throw error;
    }
  }

  // Eliminar una anotación
  async delete(annotationId) {
    try {
      console.log('🗑️ Deleting annotation:', annotationId);
      
      const response = await this.client.delete(`/${annotationId}`);
      
      console.log('  Annotation deleted');
      return response.data;
    } catch (error) {
      console.error(' Error deleting annotation:', error.message);
      throw error;
    }
  }

  // Votar una anotación
  async vote(annotationId, voteType) {
    try {
      console.log('👍 Voting on annotation:', annotationId, voteType);
      
      const response = await this.client.post(`/${annotationId}/vote`, { 
        vote_type: voteType 
      });
      
      console.log('  Vote recorded');
      return response.data;
    } catch (error) {
      console.error(' Error voting:', error.message);
      throw error;
    }
  }
}

// Exportar instancia única del servicio
export const annotationService = new AnnotationService();
export default annotationService;
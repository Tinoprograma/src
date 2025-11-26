import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class AlbumService {
  constructor() {
    this.baseURL = `${API_BASE_URL}/albums`;
    
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

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
  }

  async getAll(params = {}) {
    try {
      const response = await this.client.get('/', { params });
      return response.data;
    } catch (error) {
      console.error('  Error fetching albums:', error);
      throw error;
    }
  }

  async getById(albumId) {
    try {
      const response = await this.client.get(`/${albumId}`);
      return response.data;
    } catch (error) {
      console.error('  Error fetching album:', error);
      throw error;
    }
  }

  async getByArtist(artistId) {
    try {
      const response = await this.client.get(`/artist/${artistId}`);
      return response.data;
    } catch (error) {
      console.error('  Error fetching albums by artist:', error);
      throw error;
    }
  }

  async create(albumData) {
    try {
      const response = await this.client.post('/', albumData);
      return response.data;
    } catch (error) {
      console.error('  Error creating album:', error);
      throw error;
    }
  }

  async update(albumId, albumData) {
    try {
      const response = await this.client.put(`/${albumId}`, albumData);
      return response.data;
    } catch (error) {
      console.error('  Error updating album:', error);
      throw error;
    }
  }

  async delete(albumId) {
    try {
      const response = await this.client.delete(`/${albumId}`);
      return response.data;
    } catch (error) {
      console.error('  Error deleting album:', error);
      throw error;
    }
  }

  async getSongs(albumId) {
    try {
      const response = await this.client.get(`/${albumId}/songs`);
      return response.data;
    } catch (error) {
      console.error('  Error fetching album songs:', error);
      throw error;
    }
  }
}

export const albumService = new AlbumService();
export default albumService;
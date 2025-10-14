import axios from 'axios';
import api from '../utils/api';

const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';
const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
// ❌ NUNCA más: const CLIENT_SECRET = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET;

class SpotifyService {
  constructor() {
    this.accessToken = null;
    this.tokenExpiry = null;
  }

  // 🔐 NUEVO: Obtener token del BACKEND (no de Spotify directamente)
  async getAccessToken() {
    // Si ya tenemos un token válido, usarlo
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      console.log('🎵 Obteniendo token de Spotify desde backend...');

      // Llamar al backend que tiene las credenciales seguras
      const response = await api.get('/spotify/token');

      this.accessToken = response.data.access_token;
      // Token expira en 3600 segundos (1 hora)
      this.tokenExpiry = Date.now() + (response.data.expires_in * 1000);

      console.log('✅ Token de Spotify obtenido desde backend');
      return this.accessToken;
    } catch (error) {
      console.error('❌ Error obteniendo token de Spotify:', error);
      throw new Error('No se pudo obtener token de Spotify');
    }
  }

  // Buscar canción en Spotify
  async searchTrack(title, artist) {
    try {
      const token = await this.getAccessToken();
      
      const query = `track:${title} artist:${artist}`;
      
      console.log('🔍 Buscando en Spotify:', query);

      const response = await axios.get(`${SPOTIFY_API_BASE}/search`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        params: {
          q: query,
          type: 'track',
          limit: 1,
          market: 'US'
        }
      });

      const tracks = response.data.tracks.items;
      
      if (tracks.length === 0) {
        console.log('⚠️ No se encontró la canción en Spotify');
        return null;
      }

      const track = tracks[0];
      
      console.log('✅ Canción encontrada:', track.name);

      return {
        id: track.id,
        name: track.name,
        artist: track.artists.map(a => a.name).join(', '),
        album: track.album.name,
        albumCover: track.album.images[0]?.url,
        previewUrl: track.preview_url,
        externalUrl: track.external_urls.spotify,
        duration_ms: track.duration_ms,
        uri: track.uri
      };
    } catch (error) {
      console.error('❌ Error buscando en Spotify:', error);
      return null;
    }
  }

  // Obtener información de un track por ID
  async getTrack(trackId) {
    try {
      const token = await this.getAccessToken();

      const response = await axios.get(`${SPOTIFY_API_BASE}/tracks/${trackId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const track = response.data;

      return {
        id: track.id,
        name: track.name,
        artist: track.artists.map(a => a.name).join(', '),
        album: track.album.name,
        albumCover: track.album.images[0]?.url,
        previewUrl: track.preview_url,
        externalUrl: track.external_urls.spotify,
        duration_ms: track.duration_ms,
        uri: track.uri
      };
    } catch (error) {
      console.error('❌ Error obteniendo track de Spotify:', error);
      return null;
    }
  }

  // Buscar con más contexto
  async searchTrackAdvanced(title, artist, album = null, year = null) {
    try {
      const token = await this.getAccessToken();
      
      let query = `track:${title} artist:${artist}`;
      if (album) query += ` album:${album}`;
      if (year) query += ` year:${year}`;
      
      console.log('🔍 Búsqueda avanzada en Spotify:', query);

      const response = await axios.get(`${SPOTIFY_API_BASE}/search`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        params: {
          q: query,
          type: 'track',
          limit: 5,
          market: 'US'
        }
      });

      const tracks = response.data.tracks.items;
      
      if (tracks.length === 0) {
        return await this.searchTrack(title, artist);
      }

      const track = tracks[0];

      return {
        id: track.id,
        name: track.name,
        artist: track.artists.map(a => a.name).join(', '),
        album: track.album.name,
        albumCover: track.album.images[0]?.url,
        previewUrl: track.preview_url,
        externalUrl: track.external_urls.spotify,
        duration_ms: track.duration_ms,
        uri: track.uri
      };
    } catch (error) {
      console.error('❌ Error en búsqueda avanzada:', error);
      return null;
    }
  }
}

export const spotifyService = new SpotifyService();
export default spotifyService;
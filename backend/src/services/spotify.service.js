const axios = require('axios');
const logger = require('../utils/logger');

class SpotifyService {
  constructor() {
    this.clientId = process.env.SPOTIFY_CLIENT_ID;
    this.clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
    this.accessToken = null;
    this.tokenExpiry = null;
    this.spotifyApiBase = 'https://api.spotify.com/v1';
  }

  /**
   * Obtener token de acceso de Spotify
   */
  async getAccessToken() {
    // Si el token aún es válido, reutilizarlo
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      logger.info('🎵 Obteniendo token de Spotify...');

      const credentials = Buffer.from(
        `${this.clientId}:${this.clientSecret}`
      ).toString('base64');

      const response = await axios.post(
        'https://accounts.spotify.com/api/token',
        'grant_type=client_credentials',
        {
          headers: {
            'Authorization': `Basic ${credentials}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      this.accessToken = response.data.access_token;
      // Token expira en 3600 segundos (1 hora)
      this.tokenExpiry = Date.now() + (response.data.expires_in * 1000);

      logger.info('✅ Token de Spotify obtenido');
      return this.accessToken;
    } catch (error) {
      logger.error('❌ Error obteniendo token de Spotify:', error.response?.data || error.message);
      throw new Error('No se pudo obtener token de Spotify');
    }
  }

  /**
   * Buscar canción en Spotify
   */
  async searchTrack(title, artist, album = null, year = null) {
    try {
      const token = await this.getAccessToken();

      // Construir query
      let query = `track:${title} artist:${artist}`;
      if (album) query += ` album:${album}`;
      if (year) query += ` year:${year}`;

      logger.info('🔍 Buscando en Spotify:', query);

      const response = await axios.get(`${this.spotifyApiBase}/search`, {
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
        logger.info('⚠️ No se encontró la canción en Spotify');
        return null;
      }

      const track = tracks[0];

      logger.info('✅ Canción encontrada:', track.name);

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
      logger.error('❌ Error buscando en Spotify:', error.message);
      return null;
    }
  }

  /**
   * Obtener información de un track por ID
   */
  async getTrack(trackId) {
    try {
      const token = await this.getAccessToken();

      const response = await axios.get(`${this.spotifyApiBase}/tracks/${trackId}`, {
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
      logger.error('❌ Error obteniendo track de Spotify:', error.message);
      return null;
    }
  }
}

module.exports = new SpotifyService();
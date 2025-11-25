import api from '../../utils/api';

class SpotifyService {
  async searchTrack(title, artist, album = null, year = null) {
    try {
      console.log('🔍 [BACKEND] Buscando:', { title, artist });

      const response = await api.post('/spotify/search', {
        title,
        artist,
        album,
        year
      });

      if (!response.data.track) {
        console.log('⚠️ No encontrado');
        return null;
      }

      console.log('✅ Encontrado:', response.data.track.name);
      return response.data.track;
    } catch (error) {
      console.error('❌ Error:', error.message);
      return null;
    }
  }

  async getTrack(trackId) {
    try {
      const response = await api.get(`/spotify/track/${trackId}`);
      return response.data.track;
    } catch (error) {
      console.error('❌ Error:', error.message);
      return null;
    }
  }

  async searchTrackAdvanced(title, artist, album = null, year = null) {
    return this.searchTrack(title, artist, album, year);
  }
}

export const spotifyService = new SpotifyService();
export default spotifyService;
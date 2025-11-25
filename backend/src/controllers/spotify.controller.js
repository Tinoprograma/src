const spotifyService = require('../services/spotify.service');
const { AppError, asyncHandler } = require('../middleware/errorHandler.middleware');
const logger = require('../utils/logger');

class SpotifyController {
  /**
   * POST /api/spotify/search
   * Buscar canción en Spotify
   */
  search = asyncHandler(async (req, res) => {
    const { title, artist, album, year } = req.body;

    if (!title || !artist) {
      throw new AppError('Título y artista son requeridos', 400);
    }

    logger.info('Buscando en Spotify', { title, artist });

    const track = await spotifyService.searchTrack(
      title,
      artist,
      album || null,
      year || null
    );

    if (!track) {
      return res.json({
        success: true,
        track: null,
        message: 'No se encontró la canción en Spotify'
      });
    }

    res.json({
      success: true,
      track
    });
  });

  /**
   * GET /api/spotify/track/:trackId
   * Obtener información de un track
   */
  getTrack = asyncHandler(async (req, res) => {
    const { trackId } = req.params;

    logger.info('Obteniendo track de Spotify', { trackId });

    const track = await spotifyService.getTrack(trackId);

    if (!track) {
      throw new AppError('Track no encontrado', 404);
    }

    res.json({
      success: true,
      track
    });
  });
}

module.exports = new SpotifyController();
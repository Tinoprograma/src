const songRepository = require('../repositories/song.repository');
const { AppError, asyncHandler } = require('../middleware/errorHandler.middleware');
const logger = require('../utils/logger');

class SongsController {
  /**
   * GET /api/songs
   * Obtener todas las canciones con paginación, filtros y búsqueda
   */
  getAll = asyncHandler(async (req, res) => {
    const {
      page = 1,
      limit = 20,
      search = null,
      artist_id = null,
      album_id = null,
      is_single = null,
      sort = 'recent'
    } = req.query;

    logger.info('Obteniendo canciones', {
      user: req.user?.id,
      filters: { search, artist_id, album_id, is_single, sort },
      pagination: { page, limit }
    });

    const filters = {
      search: search ? search.trim() : null,
      artist_id: artist_id ? parseInt(artist_id) : null,
      album_id: album_id ? parseInt(album_id) : null,
      is_single: is_single ? is_single === 'true' : null,
      sort
    };

    const result = await songRepository.getAll(filters, { page, limit });

    res.json({
      success: true,
      songs: result.rows,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.count,
        pages: result.pages
      }
    });
  });

  /**
   * GET /api/songs/:id
   * Obtener canción por ID
   */
  getById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    logger.info('Obteniendo canción por ID', { song_id: id, user: req.user?.id });

    const song = await songRepository.getById(id);
    if (!song) {
      throw new AppError('Canción no encontrada', 404);
    }

    // Incrementar view count
    await songRepository.incrementViews(id);

    res.json({
      success: true,
      song
    });
  });

  /**
   * GET /api/songs/search/:query
   * Buscar canciones por texto completo
   */
  search = asyncHandler(async (req, res) => {
    const { query } = req.params;
    const { page = 1, limit = 20 } = req.query;

    if (!query || query.trim().length < 2) {
      throw new AppError('La búsqueda debe tener al menos 2 caracteres', 400);
    }

    logger.info('Buscando canciones', { query, page, limit });

    const result = await songRepository.search(query.trim(), { page, limit });

    res.json({
      success: true,
      songs: result.rows,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.count,
        pages: result.pages
      }
    });
  });

  /**
   * GET /api/songs/trending
   * Obtener canciones trending
   */
  getTrending = asyncHandler(async (req, res) => {
    const { limit = 10 } = req.query;

    logger.info('Obteniendo canciones trending');

    const songs = await songRepository.getTrending(parseInt(limit));

    res.json({
      success: true,
      songs
    });
  });

  /**
   * GET /api/songs/artist/:artist_id
   * Obtener canciones de un artista
   */
  getByArtist = asyncHandler(async (req, res) => {
    const { artist_id } = req.params;
    const { page = 1, limit = 20 } = req.query;

    logger.info('Obteniendo canciones del artista', {
      artist_id,
      pagination: { page, limit }
    });

    const result = await songRepository.getSongsByArtist(
      parseInt(artist_id),
      { page, limit }
    );

    res.json({
      success: true,
      songs: result.rows,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.count,
        pages: result.pages
      }
    });
  });

  /**
   * GET /api/songs/album/:album_id
   * Obtener canciones de un álbum
   */
  getByAlbum = asyncHandler(async (req, res) => {
    const { album_id } = req.params;

    logger.info('Obteniendo canciones del álbum', { album_id });

    const songs = await songRepository.getSongsByAlbum(parseInt(album_id));

    res.json({
      success: true,
      songs
    });
  });

  /**
   * GET /api/songs/:id/stats
   * Obtener estadísticas de una canción
   */
  getStats = asyncHandler(async (req, res) => {
    const { id } = req.params;

    logger.info('Obteniendo estadísticas de canción', { song_id: id });

    const stats = await songRepository.getStats(id);
    if (!stats) {
      throw new AppError('Canción no encontrada', 404);
    }

    res.json({
      success: true,
      stats
    });
  });

  /**
   * POST /api/songs
   * Crear nueva canción (solo autenticados)
   */
  create = asyncHandler(async (req, res) => {
    const {
      title,
      artist_id,
      album_id,
      track_number,
      is_single,
      lyrics,
      release_year,
      cover_image_url
    } = req.body;

    const userId = req.user?.id;

    // Validación básica
    if (!title || !title.trim()) {
      throw new AppError('El título de la canción es requerido', 400);
    }

    if (!artist_id) {
      throw new AppError('El artista es requerido', 400);
    }

    if (!lyrics || !lyrics.trim()) {
      throw new AppError('Las letras son requeridas', 400);
    }

    if (!is_single && !album_id) {
      throw new AppError('Si no es single, debes seleccionar un álbum', 400);
    }

    if (!is_single && album_id && !track_number) {
      throw new AppError('El número de track es requerido para canciones de álbum', 400);
    }

    logger.info('Creando nueva canción', {
      user: userId,
      title,
      artist_id,
      is_single
    });

    try {
      const song = await songRepository.create({
        title,
        artist_id: parseInt(artist_id),
        album_id: album_id ? parseInt(album_id) : null,
        track_number: track_number ? parseInt(track_number) : null,
        is_single: is_single || false,
        lyrics,
        release_year: release_year ? parseInt(release_year) : null,
        cover_image_url,
        created_by: userId
      });

      logger.info('Canción creada exitosamente', {
        song_id: song.id,
        user: userId
      });

      res.status(201).json({
        success: true,
        message: 'Canción creada exitosamente',
        song
      });
    } catch (error) {
      if (error.code === 'ARTIST_NOT_FOUND') {
        throw new AppError('El artista no existe', 404);
      }
      if (error.code === 'ALBUM_NOT_FOUND') {
        throw new AppError('El álbum no existe', 404);
      }
      throw error;
    }
  });

  /**
   * PUT /api/songs/:id
   * Actualizar canción (solo creador o admin)
   */
  update = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const {
      title,
      lyrics,
      album_id,
      track_number,
      is_single,
      release_year,
      cover_image_url
    } = req.body;

    const userId = req.user?.id;
    const userRole = req.user?.role;

    logger.info('Actualizando canción', { song_id: id, user: userId });

    const song = await songRepository.getById(id);
    if (!song) {
      throw new AppError('Canción no encontrada', 404);
    }

    // Verificar permisos
    if (song.created_by !== userId && userRole !== 'admin') {
      logger.warn('Intento de actualizar canción sin permisos', {
        song_id: id,
        user: userId
      });
      throw new AppError('No tienes permiso para editar esta canción', 403);
    }

    const updateData = {};
    if (title) updateData.title = title.trim();
    if (lyrics) updateData.lyrics = lyrics.trim();
    if (album_id !== undefined) updateData.album_id = album_id ? parseInt(album_id) : null;
    if (track_number !== undefined) updateData.track_number = track_number ? parseInt(track_number) : null;
    if (is_single !== undefined) updateData.is_single = is_single || false;
    if (release_year !== undefined) updateData.release_year = release_year ? parseInt(release_year) : null;
    if (cover_image_url !== undefined) updateData.cover_image_url = cover_image_url;

    try {
      const updated = await songRepository.update(id, updateData, { id: userId, role: userRole });

      logger.info('Canción actualizada exitosamente', {
        song_id: id,
        user: userId
      });

      res.json({
        success: true,
        message: 'Canción actualizada exitosamente',
        song: updated
      });
    } catch (error) {
      if (error.code === 'FORBIDDEN') {
        throw new AppError(error.message, 403);
      }
      throw error;
    }
  });

  /**
   * DELETE /api/songs/:id
   * Eliminar canción (solo creador o admin)
   */
  delete = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    logger.info('Eliminando canción', { song_id: id, user: userId });

    const song = await songRepository.getById(id);
    if (!song) {
      throw new AppError('Canción no encontrada', 404);
    }

    // Verificar permisos
    if (song.created_by !== userId && userRole !== 'admin') {
      logger.warn('Intento de eliminar canción sin permisos', {
        song_id: id,
        user: userId
      });
      throw new AppError('No tienes permiso para eliminar esta canción', 403);
    }

    try {
      await songRepository.delete(id, { id: userId, role: userRole });

      logger.info('Canción eliminada exitosamente', {
        song_id: id,
        user: userId
      });

      res.json({
        success: true,
        message: 'Canción eliminada exitosamente'
      });
    } catch (error) {
      if (error.code === 'FORBIDDEN') {
        throw new AppError(error.message, 403);
      }
      throw error;
    }
  });
}

module.exports = new SongsController();
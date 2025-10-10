const artistRepository = require('../repositories/artist.repository');
const { AppError, asyncHandler } = require('../middleware/errorHandler.middleware');
const logger = require('../utils/logger');

class ArtistsController {
  /**
   * GET /api/artists
   * Obtener todos los artistas con paginación y filtros
   */
  getAll = asyncHandler(async (req, res) => {
    const { page = 1, limit = 100, search, country_code, verified } = req.query;

    logger.info('Obteniendo artistas', {
      user: req.user?.id,
      filters: { search, country_code, verified },
      pagination: { page, limit }
    });

    const filters = {};
    if (search) filters.search = search;
    if (country_code) filters.country_code = country_code;
    if (verified !== undefined) filters.verified = verified === 'true';

    const result = await artistRepository.getAll(filters, { page, limit });

    res.json({
      success: true,
      artists: result.rows,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.count,
        pages: result.pages
      }
    });
  });

  /**
   * GET /api/artists/:id
   * Obtener artista por ID
   */
  getById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    logger.info('Obteniendo artista por ID', { artist_id: id, user: req.user?.id });

    const artist = await artistRepository.getById(id, true);

    if (!artist) {
      throw new AppError('Artista no encontrado', 404);
    }

    res.json({
      success: true,
      artist
    });
  });

  /**
   * GET /api/artists/:id/stats
   * Obtener estadísticas de un artista
   */
  getStats = asyncHandler(async (req, res) => {
    const { id } = req.params;

    logger.info('Obteniendo estadísticas de artista', { artist_id: id });

    const stats = await artistRepository.getStats(id);

    if (!stats) {
      throw new AppError('Artista no encontrado', 404);
    }

    res.json({
      success: true,
      stats
    });
  });

  /**
   * GET /api/artists/:id/songs
   * Obtener canciones de un artista
   */
  getSongs = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;

    logger.info('Obteniendo canciones de artista', {
      artist_id: id,
      pagination: { page, limit }
    });

    const result = await artistRepository.getSongs(id, { page, limit });

    if (!result.rows.length && parseInt(page) === 1) {
      // Verificar que el artista existe
      const artist = await artistRepository.getById(id);
      if (!artist) {
        throw new AppError('Artista no encontrado', 404);
      }
    }

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
   * GET /api/artists/:id/albums
   * Obtener álbumes de un artista
   */
  getAlbums = asyncHandler(async (req, res) => {
    const { id } = req.params;

    logger.info('Obteniendo álbumes de artista', { artist_id: id });

    const artist = await artistRepository.getById(id);
    if (!artist) {
      throw new AppError('Artista no encontrado', 404);
    }

    const albums = await artistRepository.getAlbums(id);

    res.json({
      success: true,
      albums
    });
  });

  /**
   * POST /api/artists
   * Crear nuevo artista (solo autenticados)
   */
  create = asyncHandler(async (req, res) => {
    const { name, country_code, bio } = req.body;
    const userId = req.user?.id;

    // Validación básica
    if (!name || !name.trim()) {
      throw new AppError('El nombre del artista es requerido', 400);
    }

    if (name.trim().length > 255) {
      throw new AppError('El nombre no puede exceder 255 caracteres', 400);
    }

    logger.info('Creando nuevo artista', {
      user: userId,
      artist_name: name
    });

    // Generar slug
    const slug = artistRepository.generateSlug(name);

    // Verificar duplicados
    const existing = await artistRepository.exists(name, slug);
    if (existing) {
      logger.warn('Intento de crear artista duplicado', {
        name,
        slug,
        user: userId
      });
      throw new AppError('Ya existe un artista con ese nombre', 409, { field: 'name' });
    }

    // Crear artista
    const artist = await artistRepository.create({
      name: name.trim(),
      slug,
      country_code: country_code || null,
      bio: bio ? bio.trim() : null,
      user_id: userId
    });

    logger.info('Artista creado exitosamente', {
      artist_id: artist.id,
      user: userId
    });

    res.status(201).json({
      success: true,
      message: 'Artista creado exitosamente',
      artist
    });
  });

  /**
   * PUT /api/artists/:id
   * Actualizar artista (solo creador o admin)
   */
  update = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, country_code, bio } = req.body;
    const userId = req.user?.id;

    logger.info('Actualizando artista', { artist_id: id, user: userId });

    const artist = await artistRepository.getById(id);
    if (!artist) {
      throw new AppError('Artista no encontrado', 404);
    }

    // Verificar permisos (solo creador o admin)
    if (artist.user_id !== userId && req.user.role !== 'admin') {
      logger.warn('Intento de actualizar artista sin permisos', {
        artist_id: id,
        user: userId
      });
      throw new AppError('No tienes permiso para editar este artista', 403);
    }

    // Preparar datos a actualizar
    const updateData = {};
    if (name) {
      const slug = artistRepository.generateSlug(name);
      const existing = await artistRepository.exists(name, slug);
      if (existing && existing.id !== parseInt(id)) {
        throw new AppError('Ya existe un artista con ese nombre', 409);
      }
      updateData.name = name.trim();
      updateData.slug = slug;
    }
    if (country_code !== undefined) updateData.country_code = country_code;
    if (bio !== undefined) updateData.bio = bio ? bio.trim() : null;

    const updated = await artistRepository.update(id, updateData);

    logger.info('Artista actualizado exitosamente', {
      artist_id: id,
      user: userId
    });

    res.json({
      success: true,
      message: 'Artista actualizado exitosamente',
      artist: updated
    });
  });

  /**
   * DELETE /api/artists/:id
   * Eliminar artista (solo creador o admin)
   */
  delete = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user?.id;

    logger.info('Eliminando artista', { artist_id: id, user: userId });

    const artist = await artistRepository.getById(id);
    if (!artist) {
      throw new AppError('Artista no encontrado', 404);
    }

    // Verificar permisos
    if (artist.user_id !== userId && req.user.role !== 'admin') {
      logger.warn('Intento de eliminar artista sin permisos', {
        artist_id: id,
        user: userId
      });
      throw new AppError('No tienes permiso para eliminar este artista', 403);
    }

    try {
      await artistRepository.delete(id);
      logger.info('Artista eliminado exitosamente', {
        artist_id: id,
        user: userId
      });

      res.json({
        success: true,
        message: 'Artista eliminado exitosamente'
      });
    } catch (error) {
      if (error.code === 'ARTIST_HAS_SONGS') {
        throw new AppError(
          'No se puede eliminar el artista porque tiene canciones asociadas',
          400,
          { songs_count: error.songsCount }
        );
      }
      throw error;
    }
  });

  /**
   * GET /api/artists/similar/:id
   * Obtener artistas similares
   */
  getSimilar = asyncHandler(async (req, res) => {
    const { id } = req.params;

    logger.info('Obteniendo artistas similares', { artist_id: id });

    const artist = await artistRepository.getById(id);
    if (!artist) {
      throw new AppError('Artista no encontrado', 404);
    }

    const similar = await artistRepository.getSimilar(id, 5);

    res.json({
      success: true,
      similar
    });
  });

  /**
   * PATCH /api/artists/:id/verify
   * Verificar artista (solo admin)
   */
  verify = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { verified } = req.body;

    if (req.user.role !== 'admin') {
      throw new AppError('Solo administradores pueden verificar artistas', 403);
    }

    logger.info('Verificando artista', {
      artist_id: id,
      verified,
      admin: req.user.id
    });

    const artist = await artistRepository.verify(id, verified);
    if (!artist) {
      throw new AppError('Artista no encontrado', 404);
    }

    res.json({
      success: true,
      message: `Artista ${verified ? 'verificado' : 'deverificado'}`,
      artist
    });
  });
}

module.exports = new ArtistsController();
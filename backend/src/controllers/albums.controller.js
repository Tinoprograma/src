const albumRepository = require('../repositories/album.repository');
const { AppError, asyncHandler } = require('../middleware/errorHandler.middleware');
const logger = require('../utils/logger');

class AlbumsController {
  /**
   * GET /api/albums
   * Obtener todos los álbumes con paginación y filtros
   */
  getAll = asyncHandler(async (req, res) => {
    const {
      page = 1,
      limit = 20,
      search = null,
      artist_id = null,
      release_year = null,
      sort = 'recent'
    } = req.query;

    logger.info('Obteniendo álbumes', {
      user: req.user?.id,
      filters: { search, artist_id, release_year, sort },
      pagination: { page, limit }
    });

    const filters = {
      search: search ? search.trim() : null,
      artist_id: artist_id ? parseInt(artist_id) : null,
      release_year: release_year ? parseInt(release_year) : null,
      sort
    };

    const result = await albumRepository.getAll(filters, { page, limit });

    res.json({
      success: true,
      albums: result.rows,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.count,
        pages: result.pages
      }
    });
  });

  /**
   * GET /api/albums/:id
   * Obtener álbum por ID
   */
  getById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    logger.info('Obteniendo álbum por ID', { album_id: id, user: req.user?.id });

    const album = await albumRepository.getById(id);
    if (!album) {
      throw new AppError('Álbum no encontrado', 404);
    }

    res.json({
      success: true,
      album
    });
  });

  /**
   * GET /api/albums/artist/:artist_id
   * Obtener álbumes de un artista
   */
  getByArtist = asyncHandler(async (req, res) => {
    const { artist_id } = req.params;
    const { page = 1, limit = 20 } = req.query;

    logger.info('Obteniendo álbumes del artista', {
      artist_id,
      pagination: { page, limit }
    });

    const result = await albumRepository.getByArtist(
      parseInt(artist_id),
      { page, limit }
    );

    res.json({
      success: true,
      albums: result.rows,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.count,
        pages: result.pages
      }
    });
  });

  /**
   * GET /api/albums/:id/songs
   * Obtener canciones de un álbum
   */
  getSongs = asyncHandler(async (req, res) => {
    const { id } = req.params;

    logger.info('Obteniendo canciones del álbum', { album_id: id });

    const album = await albumRepository.getSongs(id);
    if (!album) {
      throw new AppError('Álbum no encontrado', 404);
    }

    res.json({
      success: true,
      songs: album.songs
    });
  });

  /**
   * GET /api/albums/:id/stats
   * Obtener estadísticas del álbum
   */
  getStats = asyncHandler(async (req, res) => {
    const { id } = req.params;

    logger.info('Obteniendo estadísticas del álbum', { album_id: id });

    const stats = await albumRepository.getStats(id);
    if (!stats) {
      throw new AppError('Álbum no encontrado', 404);
    }

    res.json({
      success: true,
      stats
    });
  });

  /**
   * POST /api/albums
   * Crear nuevo álbum (solo autenticados)
   */
  create = asyncHandler(async (req, res) => {
    const {
      title,
      artist_id,
      release_year,
      description,
      cover_image_url
    } = req.body;

    const userId = req.user?.id;

    // Validación básica
    if (!title || !title.trim()) {
      throw new AppError('El título del álbum es requerido', 400);
    }

    if (title.trim().length > 255) {
      throw new AppError('El título no puede exceder 255 caracteres', 400);
    }

    if (!artist_id) {
      throw new AppError('El artista es requerido', 400);
    }

    logger.info('Creando nuevo álbum', {
      user: userId,
      title,
      artist_id
    });

    try {
      const album = await albumRepository.create({
        title,
        artist_id: parseInt(artist_id),
        release_year: release_year ? parseInt(release_year) : null,
        description: description || null,
        cover_image_url: cover_image_url || null,
        created_by: userId
      });

      logger.info('Álbum creado exitosamente', {
        album_id: album.id,
        user: userId
      });

      res.status(201).json({
        success: true,
        message: 'Álbum creado exitosamente',
        album
      });
    } catch (error) {
      if (error.code === 'ARTIST_NOT_FOUND') {
        throw new AppError('El artista no existe', 404);
      }
      throw error;
    }
  });

  /**
   * PUT /api/albums/:id
   * Actualizar álbum (solo creador o admin)
   */
  update = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const {
      title,
      release_year,
      description,
      cover_image_url
    } = req.body;

    const userId = req.user?.id;
    const userRole = req.user?.role;

    logger.info('Actualizando álbum', { album_id: id, user: userId });

    const album = await albumRepository.getById(id);
    if (!album) {
      throw new AppError('Álbum no encontrado', 404);
    }

    // Verificar permisos
    if (album.created_by !== userId && userRole !== 'admin') {
      logger.warn('Intento de actualizar álbum sin permisos', {
        album_id: id,
        user: userId
      });
      throw new AppError('No tienes permiso para editar este álbum', 403);
    }

    const updateData = {};
    if (title) updateData.title = title.trim();
    if (release_year !== undefined) updateData.release_year = release_year ? parseInt(release_year) : null;
    if (description !== undefined) updateData.description = description;
    if (cover_image_url !== undefined) updateData.cover_image_url = cover_image_url;

    try {
      const updated = await albumRepository.update(id, updateData, { id: userId, role: userRole });

      logger.info('Álbum actualizado exitosamente', {
        album_id: id,
        user: userId
      });

      res.json({
        success: true,
        message: 'Álbum actualizado exitosamente',
        album: updated
      });
    } catch (error) {
      if (error.code === 'FORBIDDEN') {
        throw new AppError(error.message, 403);
      }
      throw error;
    }
  });

  /**
   * DELETE /api/albums/:id
   * Eliminar álbum (solo creador o admin)
   */
  delete = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    logger.info('Eliminando álbum', { album_id: id, user: userId });

    const album = await albumRepository.getById(id);
    if (!album) {
      throw new AppError('Álbum no encontrado', 404);
    }

    // Verificar permisos
    if (album.created_by !== userId && userRole !== 'admin') {
      logger.warn('Intento de eliminar álbum sin permisos', {
        album_id: id,
        user: userId
      });
      throw new AppError('No tienes permiso para eliminar este álbum', 403);
    }

    try {
      await albumRepository.delete(id, { id: userId, role: userRole });

      logger.info('Álbum eliminado exitosamente', {
        album_id: id,
        user: userId
      });

      res.json({
        success: true,
        message: 'Álbum eliminado exitosamente'
      });
    } catch (error) {
      if (error.code === 'FORBIDDEN') {
        throw new AppError(error.message, 403);
      }
      throw error;
    }
  });
}

module.exports = new AlbumsController();
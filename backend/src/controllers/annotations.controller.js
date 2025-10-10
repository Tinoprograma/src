const annotationRepository = require('../repositories/annotation.repository');
const songRepository = require('../repositories/song.repository');
const { AppError, asyncHandler } = require('../middleware/errorHandler.middleware');
const logger = require('../utils/logger');

class AnnotationsController {
  /**
   * GET /api/annotations/song/:song_id
   * Obtener anotaciones de una canción
   */
  getBySong = asyncHandler(async (req, res) => {
    const { song_id } = req.params;
    const { page = 1, limit = 20, sort = 'votes' } = req.query;

    logger.info('Obteniendo anotaciones de canción', {
      song_id,
      sort,
      pagination: { page, limit }
    });

    const result = await annotationRepository.getBySong(
      parseInt(song_id),
      { sort },
      { page, limit }
    );

    res.json({
      success: true,
      annotations: result.rows,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.count,
        pages: result.pages
      }
    });
  });

  /**
   * GET /api/annotations/:id
   * Obtener anotación por ID
   */
  getById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    logger.info('Obteniendo anotación por ID', { annotation_id: id });

    const annotation = await annotationRepository.getById(id);
    if (!annotation) {
      throw new AppError('Anotación no encontrada', 404);
    }

    res.json({
      success: true,
      annotation
    });
  });

  /**
   * GET /api/annotations/user/:username
   * Obtener anotaciones de un usuario
   */
  getByUser = asyncHandler(async (req, res) => {
    const { username } = req.params;
    const { page = 1, limit = 20 } = req.query;

    logger.info('Obteniendo anotaciones de usuario', { username });

    const result = await annotationRepository.getByUser(
      username,
      { page, limit }
    );

    res.json({
      success: true,
      annotations: result.rows,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.count,
        pages: result.pages
      }
    });
  });

  /**
   * GET /api/annotations/verified
   * Obtener anotaciones verificadas
   */
  getVerified = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20 } = req.query;

    logger.info('Obteniendo anotaciones verificadas', { page, limit });

    const result = await annotationRepository.getVerified({ page, limit });

    res.json({
      success: true,
      annotations: result.rows,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.count,
        pages: result.pages
      }
    });
  });

  /**
   * GET /api/annotations/:id/stats
   * Obtener estadísticas de una anotación
   */
  getStats = asyncHandler(async (req, res) => {
    const { id } = req.params;

    logger.info('Obteniendo estadísticas de anotación', { annotation_id: id });

    const stats = await annotationRepository.getStats(id);
    if (!stats) {
      throw new AppError('Anotación no encontrada', 404);
    }

    res.json({
      success: true,
      stats
    });
  });

  /**
   * POST /api/annotations
   * Crear nueva anotación
   */
  create = asyncHandler(async (req, res) => {
    const {
      song_id,
      text_selection,
      start_char,
      end_char,
      explanation,
      cultural_context
    } = req.body;

    const userId = req.user?.id;

    // Validación básica
    if (!song_id) {
      throw new AppError('ID de canción requerido', 400);
    }

    if (!text_selection || !text_selection.trim()) {
      throw new AppError('Texto seleccionado requerido', 400);
    }

    if (text_selection.trim().length > 500) {
      throw new AppError('Texto seleccionado no puede exceder 500 caracteres', 400);
    }

    if (start_char === undefined || start_char === null || start_char < 0) {
      throw new AppError('Posición inicial válida requerida', 400);
    }

    if (end_char === undefined || end_char === null || end_char <= 0) {
      throw new AppError('Posición final válida requerida', 400);
    }

    if (!explanation || explanation.trim().length < 10) {
      throw new AppError('Explicación debe tener al menos 10 caracteres', 400);
    }

    logger.info('Creando nueva anotación', {
      user: userId,
      song_id,
      text_length: text_selection.length
    });

    try {
      const annotation = await annotationRepository.create({
        song_id: parseInt(song_id),
        user_id: userId,
        text_selection,
        start_char: parseInt(start_char),
        end_char: parseInt(end_char),
        explanation,
        cultural_context: cultural_context || null
      });

      // Incrementar contador de anotaciones en la canción
      await songRepository.updateAnnotationCount(parseInt(song_id), 1);

      logger.info('Anotación creada exitosamente', {
        annotation_id: annotation.id,
        user: userId
      });

      res.status(201).json({
        success: true,
        message: 'Anotación creada exitosamente',
        annotation
      });
    } catch (error) {
      if (error.code === 'SONG_NOT_FOUND') {
        throw new AppError('La canción no existe', 404);
      }
      throw error;
    }
  });

  /**
   * PUT /api/annotations/:id
   * Actualizar anotación
   */
  update = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { explanation, cultural_context } = req.body;
    const userId = req.user?.id;

    logger.info('Actualizando anotación', { annotation_id: id, user: userId });

    const annotation = await annotationRepository.getById(id);
    if (!annotation) {
      throw new AppError('Anotación no encontrada', 404);
    }

    // Verificar permisos
    if (annotation.user_id !== userId) {
      logger.warn('Intento de actualizar anotación sin permisos', {
        annotation_id: id,
        user: userId
      });
      throw new AppError('No tienes permiso para editar esta anotación', 403);
    }

    try {
      const updated = await annotationRepository.update(
        id,
        { explanation, cultural_context },
        userId
      );

      logger.info('Anotación actualizada exitosamente', {
        annotation_id: id,
        user: userId
      });

      res.json({
        success: true,
        message: 'Anotación actualizada exitosamente',
        annotation: updated
      });
    } catch (error) {
      if (error.code === 'FORBIDDEN') {
        throw new AppError(error.message, 403);
      }
      throw error;
    }
  });

  /**
   * DELETE /api/annotations/:id
   * Eliminar anotación
   */
  delete = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user?.id;

    logger.info('Eliminando anotación', { annotation_id: id, user: userId });

    const annotation = await annotationRepository.getById(id);
    if (!annotation) {
      throw new AppError('Anotación no encontrada', 404);
    }

    // Verificar permisos
    if (annotation.user_id !== userId) {
      logger.warn('Intento de eliminar anotación sin permisos', {
        annotation_id: id,
        user: userId
      });
      throw new AppError('No tienes permiso para eliminar esta anotación', 403);
    }

    try {
      await annotationRepository.delete(id, userId);

      // Decrementar contador de anotaciones en la canción
      await songRepository.updateAnnotationCount(annotation.song_id, -1);

      logger.info('Anotación eliminada exitosamente', {
        annotation_id: id,
        user: userId
      });

      res.json({
        success: true,
        message: 'Anotación eliminada exitosamente'
      });
    } catch (error) {
      if (error.code === 'FORBIDDEN') {
        throw new AppError(error.message, 403);
      }
      throw error;
    }
  });

  /**
   * POST /api/annotations/:id/vote
   * Votar una anotación
   */
  vote = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { vote_type } = req.body;
    const userId = req.user?.id;

    if (!['up', 'down'].includes(vote_type)) {
      throw new AppError('Tipo de voto inválido. Debe ser "up" o "down"', 400);
    }

    logger.info('Votando anotación', {
      annotation_id: id,
      vote_type,
      user: userId
    });

    const annotation = await annotationRepository.getById(id);
    if (!annotation) {
      throw new AppError('Anotación no encontrada', 404);
    }

    try {
      const updated = await annotationRepository.vote(id, vote_type, userId);

      logger.info('Voto registrado', {
        annotation_id: id,
        vote_type,
        user: userId
      });

      res.json({
        success: true,
        message: 'Voto registrado exitosamente',
        annotation: updated
      });
    } catch (error) {
      if (error.code === 'INVALID_VOTE') {
        throw new AppError(error.message, 400);
      }
      throw error;
    }
  });

  /**
   * PATCH /api/annotations/:id/verify
   * Verificar anotación (admin/moderator)
   */
  verify = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { verified } = req.body;

    logger.info('Verificando anotación', {
      annotation_id: id,
      verified,
      user: req.user?.id
    });

    const annotation = await annotationRepository.getById(id);
    if (!annotation) {
      throw new AppError('Anotación no encontrada', 404);
    }

    const updated = await annotationRepository.verify(id, verified);

    logger.info('Anotación verificada/deverificada', {
      annotation_id: id,
      verified
    });

    res.json({
      success: true,
      message: `Anotación ${verified ? 'verificada' : 'deverificada'}`,
      annotation: updated
    });
  });

  /**
   * POST /api/annotations/search/:query
   * Buscar anotaciones
   */
  search = asyncHandler(async (req, res) => {
    const { query } = req.params;
    const { page = 1, limit = 20 } = req.query;

    if (!query || query.trim().length < 2) {
      throw new AppError('La búsqueda debe tener al menos 2 caracteres', 400);
    }

    logger.info('Buscando anotaciones', { query, page, limit });

    const result = await annotationRepository.search(
      query.trim(),
      { page, limit }
    );

    res.json({
      success: true,
      annotations: result.rows,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.count,
        pages: result.pages
      }
    });
  });
}

module.exports = new AnnotationsController();
const userRepository = require('../repositories/user.repository');
const { AppError, asyncHandler } = require('../middleware/errorHandler.middleware');
const logger = require('../utils/logger');

class UsersController {
  /**
   * GET /api/users/profile
   * Obtener perfil del usuario actual
   */
  getProfile = asyncHandler(async (req, res) => {
    const userId = req.user?.id;

    logger.info('Obteniendo perfil de usuario', { user: userId });

    const user = await userRepository.getById(userId);
    if (!user) {
      throw new AppError('Usuario no encontrado', 404);
    }

    res.json({
      success: true,
      user
    });
  });

  /**
   * PUT /api/users/profile
   * Actualizar perfil del usuario actual
   */
  updateProfile = asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    const { display_name, country_code, region } = req.body;

    logger.info('Actualizando perfil de usuario', { user: userId });

    const user = await userRepository.getById(userId);
    if (!user) {
      throw new AppError('Usuario no encontrado', 404);
    }

    const updated = await userRepository.update(userId, {
      display_name,
      country_code,
      region
    });

    logger.info('Perfil actualizado exitosamente', { user: userId });

    res.json({
      success: true,
      message: 'Perfil actualizado exitosamente',
      user: updated
    });
  });

  /**
   * GET /api/users/:username
   * Obtener usuario público por username
   */
  getUserByUsername = asyncHandler(async (req, res) => {
    const { username } = req.params;

    logger.info('Obteniendo usuario público', { username });

    const user = await userRepository.getByUsername(username);
    if (!user) {
      throw new AppError('Usuario no encontrado', 404);
    }

    res.json({
      success: true,
      user
    });
  });

  /**
   * GET /api/users/:username/stats
   * Obtener estadísticas de usuario
   */
  getUserStats = asyncHandler(async (req, res) => {
    const { username } = req.params;

    logger.info('Obteniendo estadísticas de usuario', { username });

    const user = await userRepository.getByUsername(username);
    if (!user) {
      throw new AppError('Usuario no encontrado', 404);
    }

    const stats = await userRepository.getStats(user.id);

    res.json({
      success: true,
      stats
    });
  });

  /**
   * GET /api/users/:username/annotations
   * Obtener anotaciones de un usuario
   */
  getUserAnnotations = asyncHandler(async (req, res) => {
    const { username } = req.params;
    const { page = 1, limit = 20 } = req.query;

    logger.info('Obteniendo anotaciones de usuario', { username, page, limit });

    const user = await userRepository.getByUsername(username);
    if (!user) {
      throw new AppError('Usuario no encontrado', 404);
    }

    const result = await userRepository.getAnnotations(user.id, { page, limit });

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

module.exports = new UsersController();
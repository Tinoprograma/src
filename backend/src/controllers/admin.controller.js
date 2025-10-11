const annotationRepository = require('../repositories/annotation.repository');
const songRepository = require('../repositories/song.repository');
const albumRepository = require('../repositories/album.repository');
const artistRepository = require('../repositories/artist.repository');
const userRepository = require('../repositories/user.repository');
const { AppError, asyncHandler } = require('../middleware/errorHandler.middleware');
const logger = require('../utils/logger');
const { logAudit } = require('../middleware/admin.middleware');

class AdminController {
  // ========== ANOTACIONES ==========

  /**
   * PATCH /api/admin/annotations/:annotationId/verify
   * Verificar anotación
   */
  verifyAnnotation = asyncHandler(async (req, res) => {
    const { annotationId } = req.params;
    const { verified } = req.body;
    const adminId = req.user.id;

    logger.info('Verificando anotación', {
      annotation_id: annotationId,
      verified,
      admin: adminId
    });

    const annotation = await annotationRepository.getById(annotationId);
    if (!annotation) {
      throw new AppError('Anotación no encontrada', 404);
    }

    const updated = await annotationRepository.verify(annotationId, verified);

    await logAudit(
      adminId,
      `Anotación ${verified ? 'verificada' : 'deverificada'}`,
      'annotation',
      annotationId,
      { is_verified: annotation.is_verified },
      { is_verified: verified }
    );

    res.json({
      success: true,
      message: 'Anotación actualizada',
      annotation: updated
    });
  });

  /**
   * DELETE /api/admin/annotations/:annotationId
   * Eliminar anotación
   */
  deleteAnnotation = asyncHandler(async (req, res) => {
    const { annotationId } = req.params;
    const { reason } = req.body;
    const adminId = req.user.id;

    logger.info('Eliminando anotación', { annotation_id: annotationId, admin: adminId });

    const annotation = await annotationRepository.getById(annotationId);
    if (!annotation) {
      throw new AppError('Anotación no encontrada', 404);
    }

    await annotationRepository.updateStatus(annotationId, 'deleted', reason);
    await songRepository.updateAnnotationCount(annotation.song_id, -1);

    await logAudit(
      adminId,
      'Anotación eliminada',
      'annotation',
      annotationId,
      { explanation: annotation.explanation.substring(0, 100) + '...' },
      null,
      reason || 'Sin especificar'
    );

    res.json({
      success: true,
      message: 'Anotación eliminada'
    });
  });

  // ========== CANCIONES ==========

  /**
   * PATCH /api/admin/songs/:songId/lyrics
   * Actualizar letras de canción
   */
  updateSongLyrics = asyncHandler(async (req, res) => {
    const { songId } = req.params;
    const { lyrics, reason } = req.body;
    const adminId = req.user.id;

    logger.info('Actualizando letras de canción', { song_id: songId, admin: adminId });

    const song = await songRepository.getById(songId);
    if (!song) {
      throw new AppError('Canción no encontrada', 404);
    }

    const updated = await songRepository.update(
      songId,
      { lyrics },
      { id: adminId, role: 'admin' }
    );

    await logAudit(
      adminId,
      'Letras actualizadas',
      'song',
      songId,
      { lyrics: song.lyrics.substring(0, 100) + '...' },
      { lyrics: lyrics.substring(0, 100) + '...' },
      reason || 'Corrección'
    );

    res.json({
      success: true,
      message: 'Letras actualizadas',
      song: updated
    });
  });

  /**
   * DELETE /api/admin/songs/:songId
   * Eliminar canción
   */
  deleteSong = asyncHandler(async (req, res) => {
    const { songId } = req.params;
    const { reason } = req.body;
    const adminId = req.user.id;

    logger.info('Eliminando canción', { song_id: songId, admin: adminId });

    const song = await songRepository.getById(songId);
    if (!song) {
      throw new AppError('Canción no encontrada', 404);
    }

    await songRepository.delete(songId, { id: adminId, role: 'admin' });

    await logAudit(
      adminId,
      'Canción eliminada',
      'song',
      songId,
      { title: song.title },
      null,
      reason || 'Sin especificar'
    );

    res.json({
      success: true,
      message: 'Canción eliminada'
    });
  });

  // ========== ARTISTAS ==========

  /**
   * PATCH /api/admin/artists/:artistId
   * Actualizar artista
   */
  updateArtist = asyncHandler(async (req, res) => {
    const { artistId } = req.params;
    const { name, country_code, bio, reason } = req.body;
    const adminId = req.user.id;

    logger.info('Actualizando artista', { artist_id: artistId, admin: adminId });

    const artist = await artistRepository.getById(artistId);
    if (!artist) {
      throw new AppError('Artista no encontrado', 404);
    }

    const updated = await artistRepository.update(artistId, {
      name,
      country_code,
      bio
    });

    await logAudit(
      adminId,
      'Artista actualizado',
      'artist',
      artistId,
      { name: artist.name, country_code: artist.country_code },
      { name, country_code },
      reason || 'Corrección'
    );

    res.json({
      success: true,
      message: 'Artista actualizado',
      artist: updated
    });
  });

  /**
   * DELETE /api/admin/artists/:artistId
   * Eliminar artista
   */
  deleteArtist = asyncHandler(async (req, res) => {
    const { artistId } = req.params;
    const { reason } = req.body;
    const adminId = req.user.id;

    logger.info('Eliminando artista', { artist_id: artistId, admin: adminId });

    const artist = await artistRepository.getById(artistId);
    if (!artist) {
      throw new AppError('Artista no encontrado', 404);
    }

    await artistRepository.delete(artistId);

    await logAudit(
      adminId,
      'Artista eliminado',
      'artist',
      artistId,
      { name: artist.name },
      null,
      reason || 'Sin especificar'
    );

    res.json({
      success: true,
      message: 'Artista eliminado'
    });
  });

  // ========== ÁLBUMES ==========

  /**
   * PATCH /api/admin/albums/:albumId
   * Actualizar álbum
   */
  updateAlbum = asyncHandler(async (req, res) => {
    const { albumId } = req.params;
    const { title, release_year, description, reason } = req.body;
    const adminId = req.user.id;

    logger.info('Actualizando álbum', { album_id: albumId, admin: adminId });

    const album = await albumRepository.getById(albumId);
    if (!album) {
      throw new AppError('Álbum no encontrado', 404);
    }

    const updated = await albumRepository.update(
      albumId,
      { title, release_year, description },
      { id: adminId, role: 'admin' }
    );

    await logAudit(
      adminId,
      'Álbum actualizado',
      'album',
      albumId,
      { title: album.title, release_year: album.release_year },
      { title, release_year },
      reason || 'Corrección'
    );

    res.json({
      success: true,
      message: 'Álbum actualizado',
      album: updated
    });
  });

  /**
   * DELETE /api/admin/albums/:albumId
   * Eliminar álbum
   */
  deleteAlbum = asyncHandler(async (req, res) => {
    const { albumId } = req.params;
    const { reason } = req.body;
    const adminId = req.user.id;

    logger.info('Eliminando álbum', { album_id: albumId, admin: adminId });

    const album = await albumRepository.getById(albumId);
    if (!album) {
      throw new AppError('Álbum no encontrado', 404);
    }

    await albumRepository.delete(albumId, { id: adminId, role: 'admin' });

    await logAudit(
      adminId,
      'Álbum eliminado',
      'album',
      albumId,
      { title: album.title },
      null,
      reason || 'Sin especificar'
    );

    res.json({
      success: true,
      message: 'Álbum eliminado'
    });
  });

  // ========== AUDITORÍA ==========

  /**
   * GET /api/admin/audit-logs
   * Obtener logs de auditoría
   */
  getAuditLogs = asyncHandler(async (req, res) => {
    const { page = 1, limit = 50 } = req.query;

    logger.info('Obteniendo logs de auditoría', { page, limit });

    const offset = (page - 1) * limit;
    const sequelize = require('../config/database');

    const [logs, total] = await Promise.all([
      sequelize.query(
        `SELECT al.*, u.username 
         FROM audit_logs al
         LEFT JOIN users u ON al.admin_id = u.id
         ORDER BY al.created_at DESC
         LIMIT :limit OFFSET :offset`,
        {
          replacements: { limit: parseInt(limit), offset },
          type: sequelize.QueryTypes.SELECT
        }
      ),
      sequelize.query(
        'SELECT COUNT(*) as total FROM audit_logs',
        { type: sequelize.QueryTypes.SELECT }
      )
    ]);

    res.json({
      success: true,
      logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total[0].total,
        pages: Math.ceil(total[0].total / limit)
      }
    });
  });

  // ========== USUARIOS (Admin management) ==========

  /**
   * GET /api/admin/users
   * Obtener lista de usuarios (admin)
   */
  getAllUsers = asyncHandler(async (req, res) => {
    const { page = 1, limit = 50, role = null } = req.query;

    logger.info('Obteniendo lista de usuarios', { page, limit, role });

    const filters = role ? { role } : {};
    const result = await userRepository.getAll(filters, { page, limit });

    res.json({
      success: true,
      users: result.rows,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.count,
        pages: result.pages
      }
    });
  });

  /**
   * PATCH /api/admin/users/:userId/role
   * Cambiar rol de usuario
   */
  updateUserRole = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { role, reason } = req.body;
    const adminId = req.user.id;

    logger.info('Cambiando rol de usuario', { user_id: userId, role, admin: adminId });

    const user = await userRepository.getById(userId);
    if (!user) {
      throw new AppError('Usuario no encontrado', 404);
    }

    const updated = await userRepository.updateRole(userId, role);

    await logAudit(
      adminId,
      `Rol cambiado a ${role}`,
      'user',
      userId,
      { role: user.role },
      { role },
      reason || 'Sin especificar'
    );

    res.json({
      success: true,
      message: 'Rol actualizado',
      user: updated
    });
  });

  /**
   * DELETE /api/admin/users/:userId
   * Eliminar usuario (muy destructivo)
   */
  deleteUser = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { reason } = req.body;
    const adminId = req.user.id;

    if (adminId === parseInt(userId)) {
      throw new AppError('No puedes eliminar tu propia cuenta', 400);
    }

    logger.warn('Eliminando usuario', { user_id: userId, admin: adminId });

    const user = await userRepository.getById(userId);
    if (!user) {
      throw new AppError('Usuario no encontrado', 404);
    }

    await userRepository.delete(userId);

    await logAudit(
      adminId,
      'Usuario eliminado',
      'user',
      userId,
      { username: user.username, email: user.email },
      null,
      reason || 'Sin especificar'
    );

    res.json({
      success: true,
      message: 'Usuario eliminado'
    });
  });
}

module.exports = new AdminController();
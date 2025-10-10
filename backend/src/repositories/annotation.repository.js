const { Annotation, User, Song } = require('../models');
const { Op } = require('sequelize');

/**
 * Repository para operaciones de Anotaciones
 * Centraliza toda la lógica de acceso a datos
 */
class AnnotationRepository {
  /**
   * Obtener anotaciones de una canción con paginación
   */
  async getBySong(songId, filters = {}, pagination = {}) {
    const {
      sort = 'votes', // 'votes', 'recent', 'oldest'
      status = 'active'
    } = filters;

    const { page = 1, limit = 20 } = pagination;
    const offset = (page - 1) * limit;

    // Ordenamiento
    const orderMap = {
      votes: [['upvotes', 'DESC'], ['downvotes', 'ASC']],
      recent: [['created_at', 'DESC']],
      oldest: [['created_at', 'ASC']]
    };
    const order = orderMap[sort] || orderMap.votes;

    const where = {
      song_id: songId,
      status: status || 'active'
    };

    const result = await Annotation.findAndCountAll({
      where,
      include: [
        {
          association: 'user',
          attributes: ['id', 'username', 'display_name', 'reputation_score'],
          required: false
        }
      ],
      attributes: {
        include: [
          [
            require('sequelize').sequelize.literal('(upvotes - downvotes)'),
            'score'
          ]
        ]
      },
      limit: parseInt(limit),
      offset,
      order,
      subQuery: false,
      distinct: true
    });

    return {
      rows: result.rows,
      count: result.count,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(result.count / limit)
    };
  }

  /**
   * Obtener anotación por ID
   */
  async getById(id) {
    return await Annotation.findByPk(id, {
      include: [
        {
          association: 'user',
          attributes: ['id', 'username', 'display_name', 'reputation_score']
        },
        {
          association: 'song',
          attributes: ['id', 'title', 'slug']
        }
      ]
    });
  }

  /**
   * Crear nueva anotación
   */
  async create(data) {
    // data = { song_id, user_id, text_selection, start_char, end_char, explanation, cultural_context }

    // Validar que la canción existe
    const song = await Song.findByPk(data.song_id);
    if (!song) {
      const error = new Error('Canción no encontrada');
      error.code = 'SONG_NOT_FOUND';
      throw error;
    }

    const annotation = await Annotation.create({
      song_id: data.song_id,
      user_id: data.user_id,
      text_selection: data.text_selection.trim(),
      start_char: data.start_char,
      end_char: data.end_char,
      explanation: data.explanation.trim(),
      cultural_context: data.cultural_context ? data.cultural_context.trim() : null,
      status: 'active',
      is_verified: false
    });

    return annotation;
  }

  /**
   * Actualizar anotación
   */
  async update(id, data, userId) {
    const annotation = await Annotation.findByPk(id);
    if (!annotation) return null;

    // Verificar permisos (solo creador)
    if (annotation.user_id !== userId) {
      const error = new Error('No tienes permiso para editar esta anotación');
      error.code = 'FORBIDDEN';
      error.statusCode = 403;
      throw error;
    }

    const updateData = {};
    if (data.explanation) updateData.explanation = data.explanation.trim();
    if (data.cultural_context !== undefined) {
      updateData.cultural_context = data.cultural_context ? data.cultural_context.trim() : null;
    }

    return await annotation.update(updateData);
  }

  /**
   * Eliminar anotación (soft delete)
   */
  async delete(id, userId) {
    const annotation = await Annotation.findByPk(id);
    if (!annotation) return null;

    // Verificar permisos
    if (annotation.user_id !== userId) {
      const error = new Error('No tienes permiso para eliminar esta anotación');
      error.code = 'FORBIDDEN';
      error.statusCode = 403;
      throw error;
    }

    // Soft delete: marcar como deleted
    await annotation.update({ status: 'deleted' });
    return annotation;
  }

  /**
   * Votar una anotación
   */
  async vote(id, voteType, userId) {
    // voteType: 'up' o 'down'
    const annotation = await Annotation.findByPk(id);
    if (!annotation) return null;

    // TODO: Implementar tabla de votos para evitar votos duplicados
    // Por ahora simplemente incrementamos

    if (voteType === 'up') {
      await annotation.increment('upvotes');
    } else if (voteType === 'down') {
      await annotation.increment('downvotes');
    } else {
      const error = new Error('Tipo de voto inválido');
      error.code = 'INVALID_VOTE';
      throw error;
    }

    return await Annotation.findByPk(id);
  }

  /**
   * Obtener anotaciones de un usuario
   */
  async getByUser(userId, pagination = {}) {
    const { page = 1, limit = 20 } = pagination;
    const offset = (page - 1) * limit;

    const result = await Annotation.findAndCountAll({
      where: {
        user_id: userId,
        status: 'active'
      },
      include: [
        {
          association: 'song',
          attributes: ['id', 'title', 'slug']
        }
      ],
      limit: parseInt(limit),
      offset,
      order: [['created_at', 'DESC']],
      distinct: true
    });

    return {
      rows: result.rows,
      count: result.count,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(result.count / limit)
    };
  }

  /**
   * Obtener anotaciones verificadas
   */
  async getVerified(pagination = {}) {
    const { page = 1, limit = 20 } = pagination;
    const offset = (page - 1) * limit;

    const result = await Annotation.findAndCountAll({
      where: {
        is_verified: true,
        status: 'active'
      },
      include: [
        {
          association: 'user',
          attributes: ['id', 'username', 'display_name']
        },
        {
          association: 'song',
          attributes: ['id', 'title', 'slug']
        }
      ],
      limit: parseInt(limit),
      offset,
      order: [['upvotes', 'DESC']],
      distinct: true
    });

    return {
      rows: result.rows,
      count: result.count,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(result.count / limit)
    };
  }

  /**
   * Verificar anotación (admin/moderator)
   */
  async verify(id, verified = true) {
    const annotation = await Annotation.findByPk(id);
    if (!annotation) return null;

    return await annotation.update({ is_verified: verified });
  }

  /**
   * Cambiar estado de anotación
   */
  async updateStatus(id, status, reason = null) {
    // status: 'active', 'pending', 'rejected', 'hidden', 'deleted'
    const annotation = await Annotation.findByPk(id);
    if (!annotation) return null;

    const updateData = { status };
    if (reason) {
      updateData.rejection_reason = reason;
    }

    return await annotation.update(updateData);
  }

  /**
   * Obtener anotaciones pendientes de verificación
   */
  async getPending(pagination = {}) {
    const { page = 1, limit = 20 } = pagination;
    const offset = (page - 1) * limit;

    const result = await Annotation.findAndCountAll({
      where: {
        status: 'pending'
      },
      include: [
        {
          association: 'user',
          attributes: ['id', 'username', 'display_name']
        },
        {
          association: 'song',
          attributes: ['id', 'title', 'slug']
        }
      ],
      limit: parseInt(limit),
      offset,
      order: [['created_at', 'ASC']],
      distinct: true
    });

    return {
      rows: result.rows,
      count: result.count,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(result.count / limit)
    };
  }

  /**
   * Obtener estadísticas de una anotación
   */
  async getStats(id) {
    const annotation = await Annotation.findByPk(id);
    if (!annotation) return null;

    return {
      ...annotation.toJSON(),
      score: annotation.upvotes - annotation.downvotes,
      engagement: annotation.upvotes + annotation.downvotes
    };
  }

  /**
   * Buscar anotaciones
   */
  async search(query, pagination = {}) {
    const { page = 1, limit = 20 } = pagination;
    const offset = (page - 1) * limit;

    const where = {
      status: 'active',
      [Op.or]: [
        { explanation: { [Op.like]: `%${query}%` } },
        { text_selection: { [Op.like]: `%${query}%` } },
        { cultural_context: { [Op.like]: `%${query}%` } }
      ]
    };

    const result = await Annotation.findAndCountAll({
      where,
      include: [
        {
          association: 'user',
          attributes: ['id', 'username', 'display_name']
        },
        {
          association: 'song',
          attributes: ['id', 'title', 'slug']
        }
      ],
      limit: parseInt(limit),
      offset,
      order: [['upvotes', 'DESC']],
      distinct: true
    });

    return {
      rows: result.rows,
      count: result.count,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(result.count / limit)
    };
  }
}

module.exports = new AnnotationRepository();
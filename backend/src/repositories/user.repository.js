const { User, Annotation } = require('../models');
const { Op } = require('sequelize');

/**
 * Repository para operaciones de Usuarios
 * Centraliza toda la lógica de acceso a datos
 */
class UserRepository {
  /**
   * Obtener usuario por ID
   */
  async getById(id) {
    return await User.findByPk(id, {
      attributes: { exclude: ['password_hash'] }
    });
  }

  /**
   * Obtener usuario por email (incluye contraseña para login)
   */
  async getByEmail(email) {
    return await User.findOne({
      where: { email: email.toLowerCase() }
    });
  }

  /**
   * Obtener usuario por username (perfil público)
   */
  async getByUsername(username) {
    return await User.findOne({
      where: { username: username.toLowerCase() },
      attributes: { exclude: ['password_hash', 'email'] }
    });
  }

  /**
   * Obtener todos los usuarios con paginación
   */
  async getAll(filters = {}, pagination = {}) {
    const {
      search = null,
      role = null,
      country_code = null,
      sort = 'recent' // 'recent', 'reputation', 'username'
    } = filters;

    const { page = 1, limit = 50 } = pagination;
    const offset = (page - 1) * limit;

    const where = {};
    if (role) where.role = role;
    if (country_code) where.country_code = country_code;

    // Búsqueda por username o display_name
    if (search) {
      where[Op.or] = [
        { username: { [Op.like]: `%${search}%` } },
        { display_name: { [Op.like]: `%${search}%` } }
      ];
    }

    // Ordenamiento
    const orderMap = {
      recent: [['created_at', 'DESC']],
      reputation: [['reputation_score', 'DESC']],
      username: [['username', 'ASC']]
    };
    const order = orderMap[sort] || orderMap.recent;

    const result = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password_hash'] },
      limit: parseInt(limit),
      offset,
      order,
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
   * Crear nuevo usuario
   */
  async create(data) {
    // data = { email, username, password_hash, display_name, country_code }

    // Verificar duplicados
    const existingEmail = await User.findOne({
      where: { email: data.email.toLowerCase() }
    });
    if (existingEmail) {
      const error = new Error('El email ya está registrado');
      error.code = 'EMAIL_EXISTS';
      error.statusCode = 409;
      throw error;
    }

    const existingUsername = await User.findOne({
      where: { username: data.username.toLowerCase() }
    });
    if (existingUsername) {
      const error = new Error('El username ya está registrado');
      error.code = 'USERNAME_EXISTS';
      error.statusCode = 409;
      throw error;
    }

    const user = await User.create({
      email: data.email.toLowerCase(),
      username: data.username.toLowerCase(),
      password_hash: data.password_hash,
      display_name: data.display_name || null,
      country_code: data.country_code || null,
      reputation_score: 0,
      role: 'user'
    });

    // No retornar contraseña
    const userJSON = user.toJSON();
    delete userJSON.password_hash;
    return userJSON;
  }

  /**
   * Actualizar usuario
   */
  async update(id, data) {
    const user = await User.findByPk(id);
    if (!user) return null;

    const updateData = {};
    if (data.display_name !== undefined) {
      updateData.display_name = data.display_name ? data.display_name.trim() : null;
    }
    if (data.country_code !== undefined) {
      updateData.country_code = data.country_code;
    }
    if (data.region !== undefined) {
      updateData.region = data.region;
    }

    await user.update(updateData);

    // No retornar contraseña
    const userJSON = user.toJSON();
    delete userJSON.password_hash;
    return userJSON;
  }

  /**
   * Actualizar contraseña
   */
  async updatePassword(id, newPasswordHash) {
    const user = await User.findByPk(id);
    if (!user) return null;

    await user.update({ password_hash: newPasswordHash });
    return user;
  }

  /**
   * Incrementar reputación
   */
  async incrementReputation(id, points = 1) {
    return await User.increment('reputation_score', {
      where: { id },
      by: points
    });
  }

  /**
   * Decrementar reputación
   */
  async decrementReputation(id, points = 1) {
    return await User.increment('reputation_score', {
      where: { id },
      by: -points
    });
  }

  /**
   * Cambiar rol de usuario (admin)
   */
  async updateRole(id, role) {
    if (!['user', 'moderator', 'admin'].includes(role)) {
      const error = new Error('Rol inválido');
      error.code = 'INVALID_ROLE';
      throw error;
    }

    const user = await User.findByPk(id);
    if (!user) return null;

    return await user.update({ role });
  }

  /**
   * Obtener anotaciones de un usuario
   */
  async getAnnotations(userId, pagination = {}) {
    const { page = 1, limit = 20 } = pagination;
    const offset = (page - 1) * limit;

    const result = await Annotation.findAndCountAll({
      where: { user_id: userId, status: 'active' },
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
   * Obtener estadísticas de un usuario
   */
  async getStats(userId) {
    const user = await User.findByPk(userId);
    if (!user) return null;

    const annotationStats = await Annotation.findAll({
      where: { user_id: userId, status: 'active' },
      attributes: [
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'total_annotations'],
        [require('sequelize').fn('SUM', require('sequelize').col('upvotes')), 'total_upvotes'],
        [require('sequelize').fn('SUM', require('sequelize').col('downvotes')), 'total_downvotes']
      ],
      raw: true
    });

    const stats = annotationStats[0] || {
      total_annotations: 0,
      total_upvotes: 0,
      total_downvotes: 0
    };

    return {
      ...user.toJSON(),
      stats: {
        annotations_count: stats.total_annotations,
        upvotes_received: stats.total_upvotes || 0,
        downvotes_received: stats.total_downvotes || 0,
        reputation_score: user.reputation_score
      }
    };
  }

  /**
   * Obtener usuarios moderadores
   */
  async getModerators(limit = 10) {
    return await User.findAll({
      where: {
        role: ['moderator', 'admin']
      },
      attributes: { exclude: ['password_hash', 'email'] },
      limit: parseInt(limit),
      order: [['reputation_score', 'DESC']]
    });
  }

  /**
   * Obtener usuarios verificados (con más reputación)
   */
  async getVerified(limit = 10) {
    return await User.findAll({
      where: {
        reputation_score: {
          [Op.gte]: 100 // Umbral de reputación
        }
      },
      attributes: { exclude: ['password_hash', 'email'] },
      limit: parseInt(limit),
      order: [['reputation_score', 'DESC']]
    });
  }

  /**
   * Eliminar usuario (solo para admins)
   */
  async delete(id) {
    const user = await User.findByPk(id);
    if (!user) return null;

    await user.destroy();
    return user;
  }

  /**
   * Verificar que email y username son únicos
   */
  async exists(email, username) {
    return await User.findOne({
      where: {
        [Op.or]: [
          { email: email.toLowerCase() },
          { username: username.toLowerCase() }
        ]
      },
      attributes: ['id', 'email', 'username']
    });
  }
}

module.exports = new UserRepository();
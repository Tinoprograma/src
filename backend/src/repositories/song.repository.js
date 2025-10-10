const { Song, Artist, Album, Annotation } = require('../models');
const { Op } = require('sequelize');

/**
 * Repository para operaciones de Canciones
 * Centraliza toda la lógica de acceso a datos
 */
class SongRepository {
  /**
   * Obtener todas las canciones con paginación y filtros
   */
  async getAll(filters = {}, pagination = {}) {
    const {
      search = null,
      artist_id = null,
      album_id = null,
      is_single = null,
      sort = 'recent' // 'recent', 'views', 'annotations'
    } = filters;

    const { page = 1, limit = 20 } = pagination;
    const offset = (page - 1) * limit;

    const where = {};
    if (artist_id) where.artist_id = artist_id;
    if (album_id) where.album_id = album_id;
    if (is_single !== null) where.is_single = is_single;

    // Búsqueda por título o artista
    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { '$artist.name$': { [Op.like]: `%${search}%` } }
      ];
    }

    // Ordenamiento
    const orderMap = {
      recent: [['created_at', 'DESC']],
      views: [['view_count', 'DESC']],
      annotations: [['annotation_count', 'DESC']],
      title: [['title', 'ASC']]
    };
    const order = orderMap[sort] || orderMap.recent;

    const result = await Song.findAndCountAll({
      where,
      include: [
        {
          association: 'artist',
          attributes: ['id', 'name', 'slug'],
          required: !!search // INNER JOIN si hay búsqueda
        },
        {
          association: 'album',
          attributes: ['id', 'title'],
          required: false
        }
      ],
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
   * Obtener canción por ID con todas sus relaciones
   */
  async getById(id) {
    return await Song.findByPk(id, {
      include: [
        {
          association: 'artist',
          attributes: ['id', 'name', 'slug']
        },
        {
          association: 'album',
          attributes: ['id', 'title', 'release_year']
        },
        {
          association: 'annotations',
          attributes: ['id', 'explanation'],
          separate: true,
          where: { status: 'active' },
          limit: 10
        }
      ]
    });
  }

  /**
   * Obtener por slug con datos completos
   */
  async getBySlug(slug) {
    return await Song.findOne({
      where: { slug },
      include: [
        { association: 'artist', attributes: ['id', 'name', 'slug'] },
        { association: 'album', attributes: ['id', 'title'] }
      ]
    });
  }

  /**
   * Crear nueva canción
   */
  async create(data) {
    // data = { title, artist_id, album_id, track_number, is_single, lyrics, release_year, cover_image_url, created_by }

    // Validar que artista existe
    const artist = await Artist.findByPk(data.artist_id);
    if (!artist) {
      const error = new Error('Artista no encontrado');
      error.code = 'ARTIST_NOT_FOUND';
      throw error;
    }

    // Si es álbum, validar que existe
    if (!data.is_single && data.album_id) {
      const album = await Album.findByPk(data.album_id);
      if (!album) {
        const error = new Error('Álbum no encontrado');
        error.code = 'ALBUM_NOT_FOUND';
        throw error;
      }
    }

    // Generar slug
    const slug = this.generateSlug(data.title);

    const song = await Song.create({
      title: data.title.trim(),
      artist_id: data.artist_id,
      album_id: data.album_id || null,
      track_number: data.track_number || null,
      is_single: data.is_single || false,
      slug,
      lyrics: data.lyrics.trim(),
      release_year: data.release_year || null,
      cover_image_url: data.cover_image_url || null,
      created_by: data.created_by || null
    });

    return song;
  }

  /**
   * Actualizar canción
   */
  async update(id, data, userId) {
    const song = await Song.findByPk(id);
    if (!song) return null;

    // Verificar permisos (creador o admin)
    if (song.created_by !== userId && userId.role !== 'admin') {
      const error = new Error('No tienes permiso para editar esta canción');
      error.code = 'FORBIDDEN';
      error.statusCode = 403;
      throw error;
    }

    // Si cambia el título, regenerar slug
    if (data.title && data.title !== song.title) {
      data.slug = this.generateSlug(data.title);
    }

    return await song.update(data);
  }

  /**
   * Eliminar canción
   */
  async delete(id, userId) {
    const song = await Song.findByPk(id);
    if (!song) return null;

    // Verificar permisos
    if (song.created_by !== userId && userId.role !== 'admin') {
      const error = new Error('No tienes permiso para eliminar esta canción');
      error.code = 'FORBIDDEN';
      error.statusCode = 403;
      throw error;
    }

    await song.destroy();
    return song;
  }

  /**
   * Obtener canciones de un artista
   */
  async getSongsByArtist(artistId, pagination = {}) {
    const { page = 1, limit = 20 } = pagination;
    const offset = (page - 1) * limit;

    const result = await Song.findAndCountAll({
      where: { artist_id: artistId },
      include: [
        {
          association: 'album',
          attributes: ['id', 'title']
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
   * Obtener canciones de un álbum
   */
  async getSongsByAlbum(albumId) {
    return await Song.findAll({
      where: { album_id: albumId },
      attributes: { exclude: ['lyrics'] },
      order: [['track_number', 'ASC']]
    });
  }

  /**
   * Incrementar view count
   */
  async incrementViews(id) {
    return await Song.increment('view_count', {
      where: { id }
    });
  }

  /**
   * Actualizar annotation count
   */
  async updateAnnotationCount(id, delta = 1) {
    return await Song.increment('annotation_count', {
      where: { id },
      by: delta
    });
  }

  /**
   * Búsqueda de texto completo
   */
  async search(query, pagination = {}) {
    const { page = 1, limit = 20 } = pagination;
    const offset = (page - 1) * limit;

    const where = {
      [Op.or]: [
        { title: { [Op.like]: `%${query}%` } },
        { lyrics: { [Op.like]: `%${query}%` } }
      ]
    };

    const result = await Song.findAndCountAll({
      where,
      include: [
        { association: 'artist', attributes: ['id', 'name', 'slug'] }
      ],
      limit: parseInt(limit),
      offset,
      order: [['view_count', 'DESC']],
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
   * Obtener canciones trending
   */
  async getTrending(limit = 10) {
    return await Song.findAll({
      include: [
        { association: 'artist', attributes: ['id', 'name', 'slug'] }
      ],
      limit: parseInt(limit),
      order: [['view_count', 'DESC']],
      subQuery: false
    });
  }

  /**
   * Obtener estadísticas de una canción
   */
  async getStats(id) {
    const song = await Song.findByPk(id);
    if (!song) return null;

    const [annotationStats] = await Song.findAll({
      where: { id },
      attributes: [
        [require('sequelize').fn('COUNT', require('sequelize').col('annotations.id')), 'total_annotations'],
        [require('sequelize').fn('SUM', require('sequelize').col('annotations.upvotes')), 'total_upvotes']
      ],
      include: [
        {
          association: 'annotations',
          attributes: [],
          required: false,
          where: { status: 'active' }
        }
      ],
      raw: true,
      subQuery: false
    });

    return {
      ...song.toJSON(),
      stats: {
        view_count: song.view_count,
        annotation_count: song.annotation_count,
        total_upvotes: annotationStats?.total_upvotes || 0
      }
    };
  }

  /**
   * Generar slug
   */
  generateSlug(title) {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Verificar existencia
   */
  async exists(title, slug) {
    return await Song.findOne({
      where: {
        [Op.or]: [
          { title: title.toLowerCase() },
          { slug }
        ]
      },
      attributes: ['id']
    });
  }
}

module.exports = new SongRepository();
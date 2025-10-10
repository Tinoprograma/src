const { Artist, Song, Album } = require('../models');
const { Op } = require('sequelize');

/**
 * Repository para operaciones de Artistas
 * Centraliza toda la lógica de acceso a datos
 */
class ArtistRepository {
  /**
   * Obtener todos los artistas con paginación
   */
  async getAll(filters = {}, pagination = {}) {
    const { 
      search = null, 
      country_code = null, 
      verified = null 
    } = filters;

    const { page = 1, limit = 100 } = pagination;
    const offset = (page - 1) * limit;

    const where = {};
    if (country_code) where.country_code = country_code;
    if (verified !== null) where.verified = verified;

    // Búsqueda por nombre
    if (search) {
      where.name = {
        [Op.like]: `%${search}%`
      };
    }

    const result = await Artist.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      order: [['name', 'ASC']],
      attributes: {
        exclude: ['bio'] // No traer bios grandes en listados
      },
      distinct: true // Para paginación correcta con búsqueda
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
   * Obtener artista por ID con todas sus relaciones
   */
  async getById(id, includeDetails = false) {
    const include = [
      {
        association: 'albums',
        attributes: ['id', 'title', 'release_year', 'cover_image_url'],
        through: { attributes: [] },
        order: [['release_year', 'DESC']]
      }
    ];

    if (includeDetails) {
      include.push({
        association: 'songs',
        attributes: ['id', 'title', 'annotation_count', 'view_count'],
        through: { attributes: [] }
      });
    }

    return await Artist.findByPk(id, { include });
  }

  /**
   * Obtener artista por slug
   */
  async getBySlug(slug) {
    return await Artist.findOne({
      where: { slug },
      include: [
        {
          association: 'albums',
          attributes: ['id', 'title', 'release_year', 'cover_image_url'],
          order: [['release_year', 'DESC']]
        }
      ]
    });
  }

  /**
   * Crear nuevo artista
   */
  async create(data) {
    // data = { name, country_code, bio, user_id }
    const artist = await Artist.create({
      name: data.name,
      slug: data.slug || this.generateSlug(data.name),
      country_code: data.country_code || null,
      bio: data.bio || null,
      user_id: data.user_id || null,
      verified: false,
      image_url: data.image_url || null
    });

    return artist;
  }

  /**
   * Actualizar artista
   */
  async update(id, data) {
    const artist = await Artist.findByPk(id);
    if (!artist) return null;

    // Si se cambia el nombre, actualizar slug
    if (data.name && data.name !== artist.name) {
      data.slug = this.generateSlug(data.name);
    }

    return await artist.update(data);
  }

  /**
   * Eliminar artista
   */
  async delete(id) {
    const artist = await Artist.findByPk(id);
    if (!artist) return null;

    // Verificar si tiene canciones
    const songCount = await Song.count({ where: { artist_id: id } });
    if (songCount > 0) {
      const error = new Error('No se puede eliminar artista con canciones asociadas');
      error.code = 'ARTIST_HAS_SONGS';
      throw error;
    }

    await artist.destroy();
    return artist;
  }

  /**
   * Obtener canciones de un artista
   */
  async getSongs(artistId, pagination = {}) {
    const { page = 1, limit = 20 } = pagination;
    const offset = (page - 1) * limit;

    const result = await Song.findAndCountAll({
      where: { artist_id: artistId },
      limit: parseInt(limit),
      offset,
      order: [['created_at', 'DESC']],
      attributes: {
        exclude: ['lyrics'] // No traer letras en listados
      },
      include: [
        {
          association: 'artist',
          attributes: ['id', 'name', 'slug']
        }
      ]
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
   * Obtener álbumes de un artista
   */
  async getAlbums(artistId) {
    return await Album.findAll({
      where: { artist_id: artistId },
      order: [['release_year', 'DESC']],
      attributes: ['id', 'title', 'release_year', 'cover_image_url', 'total_tracks']
    });
  }

  /**
   * Verificar artista (solo admin)
   */
  async verify(id, verified = true) {
    const artist = await Artist.findByPk(id);
    if (!artist) return null;

    return await artist.update({ verified });
  }

  /**
   * Obtener artistas verificados
   */
  async getVerified(pagination = {}) {
    const { page = 1, limit = 50 } = pagination;
    const offset = (page - 1) * limit;

    const result = await Artist.findAndCountAll({
      where: { verified: true },
      limit: parseInt(limit),
      offset,
      order: [['name', 'ASC']],
      attributes: {
        exclude: ['bio']
      }
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
   * Obtener estadísticas de un artista
   */
  async getStats(id) {
    const artist = await Artist.findByPk(id);
    if (!artist) return null;

    const songs = await Song.findAll({
      where: { artist_id: id },
      attributes: [
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'total_songs'],
        [require('sequelize').fn('SUM', require('sequelize').col('view_count')), 'total_views'],
        [require('sequelize').fn('SUM', require('sequelize').col('annotation_count')), 'total_annotations']
      ],
      raw: true
    });

    const stats = songs[0] || {
      total_songs: 0,
      total_views: 0,
      total_annotations: 0
    };

    return {
      ...artist.toJSON(),
      stats
    };
  }

  /**
   * Buscar artistas similares (por país)
   */
  async getSimilar(id, limit = 5) {
    const artist = await Artist.findByPk(id);
    if (!artist) return [];

    return await Artist.findAll({
      where: {
        country_code: artist.country_code,
        id: {
          [Op.ne]: id // Excluir el artista actual
        }
      },
      limit,
      order: [['name', 'ASC']],
      attributes: ['id', 'name', 'slug', 'image_url', 'country_code']
    });
  }

  /**
   * Generar slug
   */
  generateSlug(name) {
    return name
      .toLowerCase()
      .normalize('NFD') // Eliminar acentos
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, '') // Eliminar caracteres especiales
      .replace(/[\s_-]+/g, '-') // Espacios a guiones
      .replace(/^-+|-+$/g, ''); // Eliminar guiones al inicio/final
  }

  /**
   * Verificar existencia por nombre o slug
   */
  async exists(name, slug) {
    return await Artist.findOne({
      where: {
        [Op.or]: [
          { name: name.toLowerCase() },
          { slug }
        ]
      },
      attributes: ['id']
    });
  }
}

module.exports = new ArtistRepository();
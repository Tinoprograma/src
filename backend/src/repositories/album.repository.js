const { Album, Artist, Song } = require('../models');
const { Op } = require('sequelize');

class AlbumRepository {
  async getAll(filters = {}, pagination = {}) {
    const {
      search = null,
      artist_id = null,
      release_year = null,
      sort = 'recent'
    } = filters;

    const { page = 1, limit = 20 } = pagination;
    const offset = (page - 1) * limit;

    const where = {};
    if (artist_id) where.artist_id = artist_id;
    if (release_year) where.release_year = release_year;

    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { '$artist.name$': { [Op.like]: `%${search}%` } }
      ];
    }

    const orderMap = {
      recent: [['created_at', 'DESC']],
      'year-desc': [['release_year', 'DESC']],
      'year-asc': [['release_year', 'ASC']],
      title: [['title', 'ASC']]
    };
    const order = orderMap[sort] || orderMap.recent;

    const result = await Album.findAndCountAll({
      where,
      include: [
        {
          association: 'artist',
          attributes: ['id', 'name', 'slug'],
          required: !!search
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

  async getById(id) {
    return await Album.findByPk(id, {
      include: [
        {
          association: 'artist',
          attributes: ['id', 'name', 'slug']
        },
        {
          association: 'songs',
          attributes: ['id', 'title', 'track_number', 'annotation_count', 'view_count'],
          order: [['track_number', 'ASC']],
          separate: true
        }
      ]
    });
  }

  async getBySlug(slug) {
    return await Album.findOne({
      where: { slug },
      include: [
        {
          association: 'artist',
          attributes: ['id', 'name', 'slug']
        },
        {
          association: 'songs',
          attributes: ['id', 'title', 'track_number'],
          order: [['track_number', 'ASC']]
        }
      ]
    });
  }

  async create(data) {
    const artist = await Artist.findByPk(data.artist_id);
    if (!artist) {
      const error = new Error('Artista no encontrado');
      error.code = 'ARTIST_NOT_FOUND';
      throw error;
    }

    const slug = this.generateSlug(data.title);

    const album = await Album.create({
      title: data.title.trim(),
      artist_id: data.artist_id,
      slug,
      release_year: data.release_year || null,
      description: data.description || null,
      cover_image_url: data.cover_image_url || null,
      created_by: data.created_by || null
    });

    return album;
  }

  async update(id, data, userId) {
    const album = await Album.findByPk(id);
    if (!album) return null;

    if (album.created_by !== userId && userId.role !== 'admin') {
      const error = new Error('No tienes permiso para editar este álbum');
      error.code = 'FORBIDDEN';
      error.statusCode = 403;
      throw error;
    }

    if (data.title && data.title !== album.title) {
      data.slug = this.generateSlug(data.title);
    }

    return await album.update(data);
  }

  async delete(id, userId) {
    const album = await Album.findByPk(id);
    if (!album) return null;

    if (album.created_by !== userId && userId.role !== 'admin') {
      const error = new Error('No tienes permiso para eliminar este álbum');
      error.code = 'FORBIDDEN';
      error.statusCode = 403;
      throw error;
    }

    await album.destroy();
    return album;
  }

  async getByArtist(artistId, pagination = {}) {
    const { page = 1, limit = 20 } = pagination;
    const offset = (page - 1) * limit;

    const result = await Album.findAndCountAll({
      where: { artist_id: artistId },
      include: [
        {
          association: 'artist',
          attributes: ['id', 'name', 'slug']
        }
      ],
      limit: parseInt(limit),
      offset,
      order: [['release_year', 'DESC'], ['created_at', 'DESC']],
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

  async getSongs(albumId) {
    return await Album.findByPk(albumId, {
      attributes: ['id', 'title'],
      include: [
        {
          association: 'songs',
          attributes: ['id', 'title', 'track_number', 'annotation_count'],
          order: [['track_number', 'ASC']]
        }
      ]
    });
  }

  async getStats(id) {
    const album = await Album.findByPk(id);
    if (!album) return null;

    const songs = await Song.findAll({
      where: { album_id: id },
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
      ...album.toJSON(),
      stats
    };
  }

  generateSlug(title) {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  async exists(title, slug) {
    return await Album.findOne({
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

module.exports = new AlbumRepository();
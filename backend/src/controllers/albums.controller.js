// ✅ DESPUÉS - Solo Sequelize
const { Album } = require('../models');
const { AppError } = require('../middleware/errorHandler.middleware');
const albumRepository = require('../repositories/album.repository');
const logger = require('../utils/logger');


class AlbumsController {
  async getAll(req, res, next) {
    try {
      const { page = 1, limit = 20, artist_id } = req.query;
      const offset = (page - 1) * limit;

      const albums = await Album.findAndCountAll({
        where: artist_id ? { artist_id } : {},
        include: [
          {
            association: 'artist',
            attributes: ['id', 'name', 'slug']
          },
          {
            association: 'songs',
            attributes: ['id'],
            through: { attributes: [] }
          }
        ],
        limit: parseInt(limit),
        offset,
        order: [['release_year', 'DESC'], ['created_at', 'DESC']]
      });

      res.json({
        success: true,
        albums: albums.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: albums.count,
          pages: Math.ceil(albums.count / limit)
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const { id } = req.params;

      const album = await Album.findByPk(id, {
        include: [
          {
            association: 'artist',
            attributes: ['id', 'name', 'slug']
          },
          {
            association: 'songs',
            attributes: ['id', 'title', 'track_number', 'annotation_count'],
            through: { attributes: [] },
            order: [['track_number', 'ASC']]
          }
        ]
      });

      if (!album) {
        throw new AppError('Álbum no encontrado', 404);
      }

      res.json({
        success: true,
        album
      });
    } catch (error) {
      next(error);
    }
  }

  async getAll(req, res, next) {
  try {
    const result = await albumRepository.getAll(
      { artist_id: req.query.artist_id },
      { page: req.query.page, limit: req.query.limit }
    );

    res.json({
      success: true,
      albums: result.rows,
      pagination: { /* ... */ }
    });
  } catch (error) {
    next(error);
  }
}

  async create(req, res, next) {
    try {
      const { title, artist_id, release_year, description } = req.body;
      const created_by = req.user?.id;

      // Validar que el artista exista
      const artist = await Artist.findByPk(artist_id);
      if (!artist) {
        throw new AppError('Artista no encontrado', 404);
      }

      // Generar slug
      const slug = title.toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');

      const album = await Album.create({
        title,
        artist_id,
        slug,
        release_year,
        description,
        created_by
      });

      const albumWithRelations = await Album.findByPk(album.id, {
        include: [{ association: 'artist', attributes: ['name'] }]
      });

      res.status(201).json({
        success: true,
        message: 'Álbum creado exitosamente',
        album: albumWithRelations
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const { title, release_year, description, cover_image_url } = req.body;

      const album = await Album.findByPk(id);
      if (!album) {
        throw new AppError('Álbum no encontrado', 404);
      }

      // Validar permisos (solo creador o admin)
      if (album.created_by !== req.user.id && req.user.role !== 'admin') {
        throw new AppError('No tienes permiso para editar este álbum', 403);
      }

      await album.update({
        title,
        release_year,
        description,
        cover_image_url
      });

      res.json({
        success: true,
        message: 'Álbum actualizado exitosamente',
        album
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const { id } = req.params;

      const album = await Album.findByPk(id);
      if (!album) {
        throw new AppError('Álbum no encontrado', 404);
      }

      // Validar permisos
      if (album.created_by !== req.user.id && req.user.role !== 'admin') {
        throw new AppError('No tienes permiso para eliminar este álbum', 403);
      }

      // Actualizar canciones para que sean singles
      await Song.update(
        { album_id: null, is_single: true },
        { where: { album_id: id } }
      );

      await album.destroy();

      res.json({
        success: true,
        message: 'Álbum eliminado exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }

  async getSongs(req, res, next) {
    try {
      const { id } = req.params;

      const album = await Album.findByPk(id, {
        include: [
          {
            association: 'songs',
            attributes: ['id', 'title', 'track_number', 'artist_id', 'annotation_count'],
            order: [['track_number', 'ASC']]
          }
        ]
      });

      if (!album) {
        throw new AppError('Álbum no encontrado', 404);
      }

      res.json({
        success: true,
        songs: album.songs
      });
    } catch (error) {
      next(error);
    }
  }
}



module.exports = new AlbumsController();
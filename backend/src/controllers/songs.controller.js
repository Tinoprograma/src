const sequelize = require('../config/database');
const songs = require('../models/Song.model.js');

class SongsController {
  // Obtener todas las canciones con paginación
  async getAll(req, res) {
    try {
      const { page = 1, limit = 20, search = '' } = req.query;
      const offset = (page - 1) * limit;

      let whereClause = {};
      if (search) {
        whereClause = {
          [sequelize.Op.or]: [
            { title: { [sequelize.Op.like]: `%${search}%` } }
          ]
        };
      }

      const [songs, total] = await Promise.all([
        sequelize.query(
          `SELECT s.*, a.name as artist_name 
           FROM songs s 
           LEFT JOIN artists a ON s.artist_id = a.id 
           ORDER BY s.created_at DESC 
           LIMIT :limit OFFSET :offset`,
          {
            replacements: { limit: parseInt(limit), offset },
            type: sequelize.QueryTypes.SELECT
          }
        ),
        sequelize.query(
          'SELECT COUNT(*) as total FROM songs',
          { type: sequelize.QueryTypes.SELECT }
        )
      ]);

      res.json({
        songs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: total[0].total,
          pages: Math.ceil(total[0].total / limit)
        }
      });
    } catch (error) {
      console.error('Error obteniendo canciones:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  // Obtener canción por ID
  async getById(req, res) {
    try {
      const { id } = req.params;

      const [song] = await sequelize.query(
        `SELECT s.*, a.name as artist_name, a.slug as artist_slug
         FROM songs s
         LEFT JOIN artists a ON s.artist_id = a.id
         WHERE s.id = :id`,
        {
          replacements: { id },
          type: sequelize.QueryTypes.SELECT
        }
      );

      if (!song) {
        return res.status(404).json({ message: 'Canción no encontrada' });
      }

      // Incrementar view_count
      await sequelize.query(
        'UPDATE songs SET view_count = view_count + 1 WHERE id = :id',
        { replacements: { id } }
      );

      res.json({ song });
    } catch (error) {
      console.error('Error obteniendo canción:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  // Crear nueva canción
  async create(req, res) {
    try {
      const { title, artist_id, lyrics, album, release_year } = req.body;
      const created_by = req.user ? req.user.id : null;

      // Generar slug
      const slug = title.toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');

      const [result] = await sequelize.query(
        `INSERT INTO songs (title, artist_id, slug, lyrics, album, release_year, created_by)
         VALUES (:title, :artist_id, :slug, :lyrics, :album, :release_year, :created_by)`,
        {
          replacements: { title, artist_id, slug, lyrics, album, release_year, created_by }
        }
      );

      const [newSong] = await sequelize.query(
        'SELECT * FROM songs WHERE id = :id',
        {
          replacements: { id: result },
          type: sequelize.QueryTypes.SELECT
        }
      );

      res.status(201).json({
        message: 'Canción creada exitosamente',
        song: newSong
      });
    } catch (error) {
      console.error('Error creando canción:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  // Actualizar canción
  async update(req, res) {
    try {
      const { id } = req.params;
      const { title, lyrics, album, release_year } = req.body;

      const [song] = await sequelize.query(
        'SELECT * FROM songs WHERE id = :id',
        {
          replacements: { id },
          type: sequelize.QueryTypes.SELECT
        }
      );

      if (!song) {
        return res.status(404).json({ message: 'Canción no encontrada' });
      }

      await sequelize.query(
        `UPDATE songs 
         SET title = :title, lyrics = :lyrics, album = :album, release_year = :release_year
         WHERE id = :id`,
        {
          replacements: { id, title, lyrics, album, release_year }
        }
      );

      const [updatedSong] = await sequelize.query(
        'SELECT * FROM songs WHERE id = :id',
        {
          replacements: { id },
          type: sequelize.QueryTypes.SELECT
        }
      );

      res.json({
        message: 'Canción actualizada exitosamente',
        song: updatedSong
      });
    } catch (error) {
      console.error('Error actualizando canción:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  // Eliminar canción
  async delete(req, res) {
    try {
      const { id } = req.params;

      const [song] = await sequelize.query(
        'SELECT * FROM songs WHERE id = :id',
        {
          replacements: { id },
          type: sequelize.QueryTypes.SELECT
        }
      );

      if (!song) {
        return res.status(404).json({ message: 'Canción no encontrada' });
      }

      await sequelize.query(
        'DELETE FROM songs WHERE id = :id',
        { replacements: { id } }
      );

      res.json({ message: 'Canción eliminada exitosamente' });
    } catch (error) {
      console.error('Error eliminando canción:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }
}

module.exports = new SongsController();
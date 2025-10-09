const sequelize = require('../config/database');
const Song = require('../models/Song.model.js');

class SongsController {
  // Obtener todas las canciones con paginación
  async getAll(req, res) {
    try {
      const { page = 1, limit = 20, search = '' } = req.query;
      const offset = (page - 1) * limit;

      let whereClause = '';
      let replacements = { limit: parseInt(limit), offset };

      if (search) {
        whereClause = 'WHERE s.title LIKE :search OR a.name LIKE :search';
        replacements.search = `%${search}%`;
      }

      const [songs, total] = await Promise.all([
        sequelize.query(
          `SELECT s.*, a.name as artist_name 
           FROM songs s 
           LEFT JOIN artists a ON s.artist_id = a.id 
           ${whereClause}
           ORDER BY s.created_at DESC 
           LIMIT :limit OFFSET :offset`,
          {
            replacements,
            type: sequelize.QueryTypes.SELECT
          }
        ),
        sequelize.query(
          `SELECT COUNT(*) as total FROM songs s LEFT JOIN artists a ON s.artist_id = a.id ${whereClause}`,
          { 
            replacements: search ? { search: `%${search}%` } : {},
            type: sequelize.QueryTypes.SELECT 
          }
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
      console.error('❌ Error obteniendo canciones:', error);
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
      console.error('❌ Error obteniendo canción:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  // Crear nueva canción
  async create(req, res) {
    try {
      const { 
        title, 
        artist_id, 
        album_id, 
        track_number, 
        is_single, 
        lyrics, 
        release_year,
        cover_image_url 
      } = req.body;
      
      const created_by = req.user ? req.user.id : null;

      // Validación básica
      if (!title || !title.trim()) {
        return res.status(400).json({ message: 'El título es requerido' });
      }

      if (!artist_id) {
        return res.status(400).json({ message: 'El artista es requerido' });
      }

      if (!lyrics || !lyrics.trim()) {
        return res.status(400).json({ message: 'Las letras son requeridas' });
      }

      // Validación de álbum
      if (!is_single && !album_id) {
        return res.status(400).json({ message: 'Si no es single, debes seleccionar un álbum' });
      }

      if (!is_single && album_id && !track_number) {
        return res.status(400).json({ message: 'El número de track es requerido para canciones de álbum' });
      }

      // Generar slug
      const slug = title.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');

      console.log('📝 Creando canción:', { 
        title, 
        artist_id, 
        album_id: album_id || null, 
        is_single,
        track_number: track_number || null 
      });

      // 🔥 CORRECCIÓN: Inserción SQL con todos los campos correctos
      const [result] = await sequelize.query(
        `INSERT INTO songs (
          title, 
          artist_id, 
          album_id, 
          track_number, 
          is_single, 
          slug, 
          lyrics, 
          release_year, 
          cover_image_url, 
          created_by
        ) VALUES (
          :title, 
          :artist_id, 
          :album_id, 
          :track_number, 
          :is_single, 
          :slug, 
          :lyrics, 
          :release_year, 
          :cover_image_url, 
          :created_by
        )`,
        {
          replacements: { 
            title: title.trim(), 
            artist_id, 
            album_id: album_id || null, 
            track_number: track_number || null, 
            is_single: is_single ? 1 : 0, 
            slug, 
            lyrics: lyrics.trim(), 
            release_year: release_year || null, 
            cover_image_url: cover_image_url || null, 
            created_by 
          }
        }
      );

      // Si pertenece a un álbum, actualizar el total_tracks
      if (album_id) {
        await sequelize.query(
          `UPDATE albums 
           SET total_tracks = (SELECT COUNT(*) FROM songs WHERE album_id = :album_id)
           WHERE id = :album_id`,
          { replacements: { album_id } }
        );
      }

      const [newSong] = await sequelize.query(
        'SELECT * FROM songs WHERE id = :id',
        {
          replacements: { id: result },
          type: sequelize.QueryTypes.SELECT
        }
      );

      console.log('✅ Canción creada exitosamente:', newSong.title);

      res.status(201).json({
        message: 'Canción creada exitosamente',
        song: newSong
      });
    } catch (error) {
      console.error('❌ Error creando canción:', error);
      console.error('Stack:', error.stack);
      res.status(500).json({ 
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Actualizar canción
  async update(req, res) {
    try {
      const { id } = req.params;
      const { 
        title, 
        lyrics, 
        album_id, 
        track_number, 
        is_single, 
        release_year,
        cover_image_url 
      } = req.body;

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
         SET title = :title, 
             lyrics = :lyrics, 
             album_id = :album_id, 
             track_number = :track_number, 
             is_single = :is_single, 
             release_year = :release_year,
             cover_image_url = :cover_image_url
         WHERE id = :id`,
        {
          replacements: { 
            id, 
            title, 
            lyrics, 
            album_id: album_id || null, 
            track_number: track_number || null, 
            is_single: is_single ? 1 : 0, 
            release_year,
            cover_image_url: cover_image_url || null
          }
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
      console.error('❌ Error actualizando canción:', error);
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

      const album_id = song.album_id;

      await sequelize.query(
        'DELETE FROM songs WHERE id = :id',
        { replacements: { id } }
      );

      // Actualizar total_tracks del álbum si tenía uno
      if (album_id) {
        await sequelize.query(
          `UPDATE albums 
           SET total_tracks = (SELECT COUNT(*) FROM songs WHERE album_id = :album_id)
           WHERE id = :album_id`,
          { replacements: { album_id } }
        );
      }

      res.json({ message: 'Canción eliminada exitosamente' });
    } catch (error) {
      console.error('❌ Error eliminando canción:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }
}

module.exports = new SongsController();
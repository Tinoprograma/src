const sequelize = require('../config/database');

class AlbumsController {
  // Obtener todos los álbumes
  async getAll(req, res) {
    try {
      const { page = 1, limit = 20, artist_id } = req.query;
      const offset = (page - 1) * limit;

      let whereClause = '';
      let replacements = { limit: parseInt(limit), offset };

      if (artist_id) {
        whereClause = 'WHERE al.artist_id = :artist_id';
        replacements.artist_id = artist_id;
      }

      const [albums, total] = await Promise.all([
        sequelize.query(
          `SELECT al.*, 
                  ar.name as artist_name,
                  COUNT(DISTINCT s.id) as song_count
           FROM albums al
           LEFT JOIN artists ar ON al.artist_id = ar.id
           LEFT JOIN songs s ON al.id = s.album_id AND s.is_single = false
           ${whereClause}
           GROUP BY al.id
           ORDER BY al.release_year DESC, al.created_at DESC
           LIMIT :limit OFFSET :offset`,
          {
            replacements,
            type: sequelize.QueryTypes.SELECT
          }
        ),
        sequelize.query(
          `SELECT COUNT(*) as total FROM albums al ${whereClause}`,
          {
            replacements,
            type: sequelize.QueryTypes.SELECT
          }
        )
      ]);

      res.json({
        albums,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: total[0].total,
          pages: Math.ceil(total[0].total / limit)
        }
      });
    } catch (error) {
      console.error('❌ Error obteniendo álbumes:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  // Obtener álbum por ID
  async getById(req, res) {
    try {
      const { id } = req.params;

      const [album] = await sequelize.query(
        `SELECT al.*, 
                ar.name as artist_name,
                ar.slug as artist_slug,
                COUNT(DISTINCT s.id) as song_count
         FROM albums al
         LEFT JOIN artists ar ON al.artist_id = ar.id
         LEFT JOIN songs s ON al.id = s.album_id
         WHERE al.id = :id
         GROUP BY al.id`,
        {
          replacements: { id },
          type: sequelize.QueryTypes.SELECT
        }
      );

      if (!album) {
        return res.status(404).json({ message: 'Álbum no encontrado' });
      }

      res.json({ album });
    } catch (error) {
      console.error('❌ Error obteniendo álbum:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  // Obtener álbumes por artista
  async getByArtist(req, res) {
    try {
      const { artist_id } = req.params;

      const albums = await sequelize.query(
        `SELECT al.*, 
                COUNT(DISTINCT s.id) as song_count
         FROM albums al
         LEFT JOIN songs s ON al.id = s.album_id
         WHERE al.artist_id = :artist_id
         GROUP BY al.id
         ORDER BY al.release_year DESC`,
        {
          replacements: { artist_id },
          type: sequelize.QueryTypes.SELECT
        }
      );

      res.json({ albums });
    } catch (error) {
      console.error('❌ Error obteniendo álbumes del artista:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  // Crear nuevo álbum
  async create(req, res) {
    try {
      const { title, artist_id, release_year, description } = req.body;
      const created_by = req.user ? req.user.id : null;

      // Generar slug
      const slug = title.toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');

      const [result] = await sequelize.query(
        `INSERT INTO albums (title, artist_id, slug, release_year, description, created_by)
         VALUES (:title, :artist_id, :slug, :release_year, :description, :created_by)`,
        {
          replacements: { title, artist_id, slug, release_year, description, created_by }
        }
      );

      const [newAlbum] = await sequelize.query(
        'SELECT * FROM albums WHERE id = :id',
        {
          replacements: { id: result },
          type: sequelize.QueryTypes.SELECT
        }
      );

      console.log('✅ Álbum creado:', newAlbum.title);

      res.status(201).json({
        message: 'Álbum creado exitosamente',
        album: newAlbum
      });
    } catch (error) {
      console.error('❌ Error creando álbum:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  // Actualizar álbum
  async update(req, res) {
    try {
      const { id } = req.params;
      const { title, release_year, description, cover_image_url } = req.body;

      const [album] = await sequelize.query(
        'SELECT * FROM albums WHERE id = :id',
        {
          replacements: { id },
          type: sequelize.QueryTypes.SELECT
        }
      );

      if (!album) {
        return res.status(404).json({ message: 'Álbum no encontrado' });
      }

      await sequelize.query(
        `UPDATE albums 
         SET title = :title, 
             release_year = :release_year, 
             description = :description,
             cover_image_url = :cover_image_url
         WHERE id = :id`,
        {
          replacements: { id, title, release_year, description, cover_image_url }
        }
      );

      const [updatedAlbum] = await sequelize.query(
        'SELECT * FROM albums WHERE id = :id',
        {
          replacements: { id },
          type: sequelize.QueryTypes.SELECT
        }
      );

      res.json({
        message: 'Álbum actualizado exitosamente',
        album: updatedAlbum
      });
    } catch (error) {
      console.error('❌ Error actualizando álbum:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  // Eliminar álbum
  async delete(req, res) {
    try {
      const { id } = req.params;

      const [album] = await sequelize.query(
        'SELECT * FROM albums WHERE id = :id',
        {
          replacements: { id },
          type: sequelize.QueryTypes.SELECT
        }
      );

      if (!album) {
        return res.status(404).json({ message: 'Álbum no encontrado' });
      }

      // Actualizar canciones para que sean singles
      await sequelize.query(
        'UPDATE songs SET album_id = NULL, is_single = true WHERE album_id = :id',
        { replacements: { id } }
      );

      // Eliminar álbum
      await sequelize.query(
        'DELETE FROM albums WHERE id = :id',
        { replacements: { id } }
      );

      res.json({ message: 'Álbum eliminado exitosamente' });
    } catch (error) {
      console.error('❌ Error eliminando álbum:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  // Obtener canciones del álbum
  async getSongs(req, res) {
    try {
      const { id } = req.params;

      const songs = await sequelize.query(
        `SELECT s.*, 
                ar.name as artist_name
         FROM songs s
         LEFT JOIN artists ar ON s.artist_id = ar.id
         WHERE s.album_id = :id
         ORDER BY s.track_number ASC, s.created_at ASC`,
        {
          replacements: { id },
          type: sequelize.QueryTypes.SELECT
        }
      );

      res.json({ songs });
    } catch (error) {
      console.error('❌ Error obteniendo canciones del álbum:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }
}

module.exports = new AlbumsController();
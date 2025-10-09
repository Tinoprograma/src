const sequelize = require('../config/database');
const { logAudit } = require('../middleware/admin.middleware');

class AdminController {
  // ANOTACIONES
  
  async verifyAnnotation(req, res) {
    try {
      const { annotationId } = req.params;
      const { verified } = req.body;
      const adminId = req.user.id;

      const [annotation] = await sequelize.query(
        'SELECT * FROM annotations WHERE id = :id',
        { replacements: { annotationId }, type: sequelize.QueryTypes.SELECT }
      );

      if (!annotation) {
        return res.status(404).json({ message: 'Anotación no encontrada' });
      }

      const oldValue = { is_verified: annotation.is_verified };
      
      await sequelize.query(
        'UPDATE annotations SET is_verified = :verified WHERE id = :id',
        { replacements: { verified: verified ? 1 : 0, id: annotationId } }
      );

      await logAudit(
        adminId,
        `Anotación ${verified ? 'verificada' : 'deverificada'}`,
        'annotation',
        annotationId,
        oldValue,
        { is_verified: verified }
      );

      res.json({ message: 'Anotación actualizada' });
    } catch (error) {
      console.error('Error verificando anotación:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  async deleteAnnotation(req, res) {
    try {
      const { annotationId } = req.params;
      const { reason } = req.body;
      const adminId = req.user.id;

      const [annotation] = await sequelize.query(
        'SELECT * FROM annotations WHERE id = :id',
        { replacements: { annotationId }, type: sequelize.QueryTypes.SELECT }
      );

      if (!annotation) {
        return res.status(404).json({ message: 'Anotación no encontrada' });
      }

      await sequelize.query(
        'DELETE FROM annotations WHERE id = :id',
        { replacements: { id: annotationId } }
      );

      await logAudit(
        adminId,
        'Anotación eliminada',
        'annotation',
        annotationId,
        annotation,
        null,
        reason || 'Sin especificar'
      );

      res.json({ message: 'Anotación eliminada' });
    } catch (error) {
      console.error('Error eliminando anotación:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  // CANCIONES

  async updateSongLyrics(req, res) {
    try {
      const { songId } = req.params;
      const { lyrics, reason } = req.body;
      const adminId = req.user.id;

      const [song] = await sequelize.query(
        'SELECT * FROM songs WHERE id = :id',
        { replacements: { id: songId }, type: sequelize.QueryTypes.SELECT }
      );

      if (!song) {
        return res.status(404).json({ message: 'Canción no encontrada' });
      }

      const oldLyrics = song.lyrics;

      await sequelize.query(
        'UPDATE songs SET lyrics = :lyrics WHERE id = :id',
        { replacements: { lyrics, id: songId } }
      );

      await logAudit(
        adminId,
        'Letras actualizadas',
        'song',
        songId,
        { lyrics: oldLyrics.substring(0, 100) + '...' },
        { lyrics: lyrics.substring(0, 100) + '...' },
        reason || 'Corrección'
      );

      res.json({ message: 'Letras actualizadas' });
    } catch (error) {
      console.error('Error actualizando letras:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  async deleteSong(req, res) {
    try {
      const { songId } = req.params;
      const { reason } = req.body;
      const adminId = req.user.id;

      const [song] = await sequelize.query(
        'SELECT * FROM songs WHERE id = :id',
        { replacements: { id: songId }, type: sequelize.QueryTypes.SELECT }
      );

      if (!song) {
        return res.status(404).json({ message: 'Canción no encontrada' });
      }

      // Eliminar anotaciones asociadas
      await sequelize.query(
        'DELETE FROM annotations WHERE song_id = :id',
        { replacements: { id: songId } }
      );

      // Eliminar la canción
      await sequelize.query(
        'DELETE FROM songs WHERE id = :id',
        { replacements: { id: songId } }
      );

      await logAudit(
        adminId,
        'Canción eliminada',
        'song',
        songId,
        { title: song.title },
        null,
        reason || 'Sin especificar'
      );

      res.json({ message: 'Canción eliminada' });
    } catch (error) {
      console.error('Error eliminando canción:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  // ARTISTAS

  async updateArtist(req, res) {
    try {
      const { artistId } = req.params;
      const { name, country_code, bio, reason } = req.body;
      const adminId = req.user.id;

      const [artist] = await sequelize.query(
        'SELECT * FROM artists WHERE id = :id',
        { replacements: { id: artistId }, type: sequelize.QueryTypes.SELECT }
      );

      if (!artist) {
        return res.status(404).json({ message: 'Artista no encontrado' });
      }

      const oldArtist = { name: artist.name, country_code: artist.country_code };

      await sequelize.query(
        'UPDATE artists SET name = :name, country_code = :country_code, bio = :bio WHERE id = :id',
        { replacements: { name, country_code, bio, id: artistId } }
      );

      await logAudit(
        adminId,
        'Artista actualizado',
        'artist',
        artistId,
        oldArtist,
        { name, country_code },
        reason || 'Corrección'
      );

      res.json({ message: 'Artista actualizado' });
    } catch (error) {
      console.error('Error actualizando artista:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  async deleteArtist(req, res) {
    try {
      const { artistId } = req.params;
      const { reason } = req.body;
      const adminId = req.user.id;

      const [artist] = await sequelize.query(
        'SELECT * FROM artists WHERE id = :id',
        { replacements: { id: artistId }, type: sequelize.QueryTypes.SELECT }
      );

      if (!artist) {
        return res.status(404).json({ message: 'Artista no encontrado' });
      }

      // Verificar si tiene canciones
      const [songs] = await sequelize.query(
        'SELECT COUNT(*) as count FROM songs WHERE artist_id = :id',
        { replacements: { id: artistId }, type: sequelize.QueryTypes.SELECT }
      );

      if (songs.count > 0) {
        return res.status(400).json({ message: 'No se puede eliminar un artista con canciones' });
      }

      await sequelize.query(
        'DELETE FROM artists WHERE id = :id',
        { replacements: { id: artistId } }
      );

      await logAudit(
        adminId,
        'Artista eliminado',
        'artist',
        artistId,
        { name: artist.name },
        null,
        reason || 'Sin especificar'
      );

      res.json({ message: 'Artista eliminado' });
    } catch (error) {
      console.error('Error eliminando artista:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  // ÁLBUMES

  async updateAlbum(req, res) {
    try {
      const { albumId } = req.params;
      const { title, release_year, description, reason } = req.body;
      const adminId = req.user.id;

      const [album] = await sequelize.query(
        'SELECT * FROM albums WHERE id = :id',
        { replacements: { id: albumId }, type: sequelize.QueryTypes.SELECT }
      );

      if (!album) {
        return res.status(404).json({ message: 'Álbum no encontrado' });
      }

      const oldAlbum = { title: album.title, release_year: album.release_year };

      await sequelize.query(
        'UPDATE albums SET title = :title, release_year = :release_year, description = :description WHERE id = :id',
        { replacements: { title, release_year, description, id: albumId } }
      );

      await logAudit(
        adminId,
        'Álbum actualizado',
        'album',
        albumId,
        oldAlbum,
        { title, release_year },
        reason || 'Corrección'
      );

      res.json({ message: 'Álbum actualizado' });
    } catch (error) {
      console.error('Error actualizando álbum:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  async deleteAlbum(req, res) {
    try {
      const { albumId } = req.params;
      const { reason } = req.body;
      const adminId = req.user.id;

      const [album] = await sequelize.query(
        'SELECT * FROM albums WHERE id = :id',
        { replacements: { id: albumId }, type: sequelize.QueryTypes.SELECT }
      );

      if (!album) {
        return res.status(404).json({ message: 'Álbum no encontrado' });
      }

      // Actualizar canciones para que sean singles
      await sequelize.query(
        'UPDATE songs SET album_id = NULL, is_single = 1 WHERE album_id = :id',
        { replacements: { id: albumId } }
      );

      // Eliminar el álbum
      await sequelize.query(
        'DELETE FROM albums WHERE id = :id',
        { replacements: { id: albumId } }
      );

      await logAudit(
        adminId,
        'Álbum eliminado',
        'album',
        albumId,
        { title: album.title },
        null,
        reason || 'Sin especificar'
      );

      res.json({ message: 'Álbum eliminado' });
    } catch (error) {
      console.error('Error eliminando álbum:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  // AUDITORÍA

  async getAuditLogs(req, res) {
    try {
      const { page = 1, limit = 50 } = req.query;
      const offset = (page - 1) * limit;

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
        logs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: total[0].total
        }
      });
    } catch (error) {
      console.error('Error obteniendo logs de auditoría:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }
}

module.exports = new AdminController();
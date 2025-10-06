const sequelize = require('../config/database');
const Annotation = require('../models/Annotation.model.js');

class AnnotationsController {
  // Obtener anotaciones de una canción
  async getBySong(req, res) {
    try {
      const { song_id } = req.params;
      const { page = 1, limit = 20, sort = 'votes' } = req.query;
      const offset = (page - 1) * limit;

      let orderBy = 'a.created_at DESC';
      if (sort === 'votes') {
        orderBy = 'a.upvotes DESC, a.downvotes ASC';
      }

      // 👇 QUERY CORREGIDA CON is_verified
      const [annotations, total] = await Promise.all([
        sequelize.query(
          `SELECT a.*, 
                  u.username, u.display_name, u.reputation_score,
                  (a.upvotes - a.downvotes) as score
           FROM annotations a
           LEFT JOIN users u ON a.user_id = u.id
           WHERE a.song_id = :song_id AND a.status = 'active'
           ORDER BY ${orderBy}
           LIMIT :limit OFFSET :offset`,
          {
            replacements: { song_id, limit: parseInt(limit), offset },
            type: sequelize.QueryTypes.SELECT
          }
        ),
        sequelize.query(
          'SELECT COUNT(*) as total FROM annotations WHERE song_id = :song_id AND status = "active"',
          {
            replacements: { song_id },
            type: sequelize.QueryTypes.SELECT
          }
        )
      ]);

      res.json({
        annotations,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: total[0].total,
          pages: Math.ceil(total[0].total / limit)
        }
      });
    } catch (error) {
      console.error('❌ Error obteniendo anotaciones:', error);
      res.status(500).json({ 
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Crear nueva anotación
  async create(req, res) {
    try {
      const {
        song_id,
        text_selection,
        start_char,
        end_char,
        explanation,
        cultural_context
      } = req.body;

      const user_id = req.user.id;

      console.log('📝 Creando anotación:', {
        song_id,
        user_id,
        text_selection: text_selection.substring(0, 50) + '...'
      });

      const [result] = await sequelize.query(
        `INSERT INTO annotations 
         (song_id, user_id, text_selection, start_char, end_char, explanation, cultural_context, status)
         VALUES (:song_id, :user_id, :text_selection, :start_char, :end_char, :explanation, :cultural_context, 'active')`,
        {
          replacements: {
            song_id,
            user_id,
            text_selection,
            start_char,
            end_char,
            explanation,
            cultural_context
          }
        }
      );

      // Incrementar contador de anotaciones de la canción
      await sequelize.query(
        'UPDATE songs SET annotation_count = annotation_count + 1 WHERE id = :song_id',
        { replacements: { song_id } }
      );

      // 👇 QUERY CORREGIDA para obtener la anotación con is_verified
      const [newAnnotation] = await sequelize.query(
        `SELECT a.*, u.username, u.display_name 
         FROM annotations a
         LEFT JOIN users u ON a.user_id = u.id
         WHERE a.id = :id`,
        {
          replacements: { id: result },
          type: sequelize.QueryTypes.SELECT
        }
      );

      console.log('✅ Anotación creada:', newAnnotation.id);

      res.status(201).json({
        message: 'Anotación creada exitosamente',
        annotation: newAnnotation
      });
    } catch (error) {
      console.error('❌ Error creando anotación:', error);
      res.status(500).json({ 
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Votar anotación
  async vote(req, res) {
    try {
      const { id } = req.params;
      const { vote_type } = req.body; // 'up' or 'down'
      const user_id = req.user.id;

      if (!['up', 'down'].includes(vote_type)) {
        return res.status(400).json({ message: 'Tipo de voto inválido' });
      }

      const [annotation] = await sequelize.query(
        'SELECT * FROM annotations WHERE id = :id',
        {
          replacements: { id },
          type: sequelize.QueryTypes.SELECT
        }
      );

      if (!annotation) {
        return res.status(404).json({ message: 'Anotación no encontrada' });
      }

      // TODO: Verificar si ya votó (implementar tabla de votos)
      // Por ahora simplemente incrementamos

      const column = vote_type === 'up' ? 'upvotes' : 'downvotes';
      await sequelize.query(
        `UPDATE annotations SET ${column} = ${column} + 1 WHERE id = :id`,
        { replacements: { id } }
      );

      const [updatedAnnotation] = await sequelize.query(
        'SELECT * FROM annotations WHERE id = :id',
        {
          replacements: { id },
          type: sequelize.QueryTypes.SELECT
        }
      );

      console.log(`👍 Voto ${vote_type} registrado en anotación:`, id);

      res.json({
        message: 'Voto registrado',
        annotation: updatedAnnotation
      });
    } catch (error) {
      console.error('❌ Error votando anotación:', error);
      res.status(500).json({ 
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Actualizar anotación
  async update(req, res) {
    try {
      const { id } = req.params;
      const { explanation, cultural_context } = req.body;
      const user_id = req.user.id;

      const [annotation] = await sequelize.query(
        'SELECT * FROM annotations WHERE id = :id',
        {
          replacements: { id },
          type: sequelize.QueryTypes.SELECT
        }
      );

      if (!annotation) {
        return res.status(404).json({ message: 'Anotación no encontrada' });
      }

      if (annotation.user_id !== user_id) {
        return res.status(403).json({ message: 'No tienes permiso para editar esta anotación' });
      }

      await sequelize.query(
        'UPDATE annotations SET explanation = :explanation, cultural_context = :cultural_context WHERE id = :id',
        {
          replacements: { id, explanation, cultural_context }
        }
      );

      const [updatedAnnotation] = await sequelize.query(
        'SELECT * FROM annotations WHERE id = :id',
        {
          replacements: { id },
          type: sequelize.QueryTypes.SELECT
        }
      );

      console.log('✅ Anotación actualizada:', id);

      res.json({
        message: 'Anotación actualizada exitosamente',
        annotation: updatedAnnotation
      });
    } catch (error) {
      console.error('❌ Error actualizando anotación:', error);
      res.status(500).json({ 
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Eliminar anotación
  async delete(req, res) {
    try {
      const { id } = req.params;
      const user_id = req.user.id;

      const [annotation] = await sequelize.query(
        'SELECT * FROM annotations WHERE id = :id',
        {
          replacements: { id },
          type: sequelize.QueryTypes.SELECT
        }
      );

      if (!annotation) {
        return res.status(404).json({ message: 'Anotación no encontrada' });
      }

      if (annotation.user_id !== user_id) {
        return res.status(403).json({ message: 'No tienes permiso para eliminar esta anotación' });
      }

      await sequelize.query(
        'UPDATE annotations SET status = "deleted" WHERE id = :id',
        { replacements: { id } }
      );

      // Decrementar contador
      await sequelize.query(
        'UPDATE songs SET annotation_count = annotation_count - 1 WHERE id = :song_id',
        { replacements: { song_id: annotation.song_id } }
      );

      console.log('🗑️  Anotación eliminada:', id);

      res.json({ message: 'Anotación eliminada exitosamente' });
    } catch (error) {
      console.error('❌ Error eliminando anotación:', error);
      res.status(500).json({ 
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

module.exports = new AnnotationsController();
const sequelize = require('../config/database');

class ArtistsController {
  async getAll(req, res) {
    try {
      const { page = 1, limit = 100 } = req.query;
      const offset = (page - 1) * limit;

      const [artists, total] = await Promise.all([
        sequelize.query(
          'SELECT * FROM artists ORDER BY name ASC LIMIT :limit OFFSET :offset',
          {
            replacements: { limit: parseInt(limit), offset },
            type: sequelize.QueryTypes.SELECT
          }
        ),
        sequelize.query(
          'SELECT COUNT(*) as total FROM artists',
          { type: sequelize.QueryTypes.SELECT }
        )
      ]);

      res.json({
        artists,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: total[0].total
        }
      });
    } catch (error) {
      console.error('Error obteniendo artistas:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  async create(req, res) {
    try {
      // 1. OBTENER EL ID DEL USUARIO del token
      // El middleware authenticateToken asegura que req.user existe y tiene el id.
      const userId = req.user.id; 
      
      // 2. Desestructuración con valor por defecto para 'bio' (para evitar el error NOT NULL)
      const { name, country_code, bio = null } = req.body; 

      // 3. Generación del slug (se mantiene)
      const slug = name.toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');

      // 4. INSERCIÓN SQL CORREGIDA: Incluir user_id en la consulta y los reemplazos
      const [result] = await sequelize.query(
        `INSERT INTO artists (name, slug, country_code, bio, user_id) 
         VALUES (:name, :slug, :country_code, :bio, :user_id)`, // 👈 AÑADIDO user_id
        {
          replacements: { name, slug, country_code, bio, user_id: userId } // 👈 AÑADIDO user_id
        }
      );

      // 5. Obtener el nuevo artista
      const [newArtist] = await sequelize.query(
        'SELECT * FROM artists WHERE id = :id',
        {
          replacements: { id: result },
          type: sequelize.QueryTypes.SELECT
        }
      );

      res.status(201).json({ 
        message: 'Artista creado exitosamente', 
        artist: newArtist[0] 
      });

    } catch (error) {
      console.error('Error creando artista:', error);
      // Podrías loguear error.message para ver el error exacto de SQL
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  
}

module.exports = new ArtistsController();
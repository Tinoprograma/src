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
      console.error('❌ Error obteniendo artistas:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  async create(req, res) {
    try {
      // 1. Obtener el ID del usuario del token
      const userId = req.user ? req.user.id : null;
      
      // 2. Desestructuración de los datos
      const { name, country_code, bio } = req.body;

      // 3. Validación básica
      if (!name || !name.trim()) {
        return res.status(400).json({ message: 'El nombre del artista es requerido' });
      }

      // 4. Generación del slug
      const slug = name.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
        .replace(/[^\w\s-]/g, '') // Eliminar caracteres especiales
        .replace(/[\s_-]+/g, '-') // Reemplazar espacios con guiones
        .replace(/^-+|-+$/g, ''); // Eliminar guiones al inicio/final

      // 5. Verificar si el slug ya existe
      const [existingArtist] = await sequelize.query(
        'SELECT * FROM artists WHERE slug = :slug',
        {
          replacements: { slug },
          type: sequelize.QueryTypes.SELECT
        }
      );

      // Si existe, agregar número al slug
      let finalSlug = slug;
      if (existingArtist) {
        const timestamp = Date.now();
        finalSlug = `${slug}-${timestamp}`;
      }

      console.log('📝 Creando artista:', { name, slug: finalSlug, country_code });

      // 6. Inserción SQL con todos los campos
      const [result] = await sequelize.query(
        `INSERT INTO artists (name, slug, country_code, bio, user_id) 
         VALUES (:name, :slug, :country_code, :bio, :user_id)`,
        {
          replacements: { 
            name: name.trim(), 
            slug: finalSlug, 
            country_code: country_code || null, 
            bio: bio || null, 
            user_id: userId 
          }
        }
      );

      // 7. Obtener el artista creado
      const [newArtist] = await sequelize.query(
        'SELECT * FROM artists WHERE id = :id',
        {
          replacements: { id: result },
          type: sequelize.QueryTypes.SELECT
        }
      );

      console.log('✅ Artista creado exitosamente:', newArtist.name);

      res.status(201).json({ 
        message: 'Artista creado exitosamente', 
        artist: newArtist
      });

    } catch (error) {
      console.error('❌ Error creando artista:', error);
      console.error('Stack:', error.stack);
      
      // Manejo específico de errores de MySQL
      if (error.original && error.original.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ 
          message: 'Ya existe un artista con ese nombre' 
        });
      }
      
      res.status(500).json({ 
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  async getById(req, res) {
    try {
      const { id } = req.params;

      const [artist] = await sequelize.query(
        'SELECT * FROM artists WHERE id = :id',
        {
          replacements: { id },
          type: sequelize.QueryTypes.SELECT
        }
      );

      if (!artist) {
        return res.status(404).json({ message: 'Artista no encontrado' });
      }

      res.json({ artist });
    } catch (error) {
      console.error('❌ Error obteniendo artista:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const { name, country_code, bio } = req.body;

      const [artist] = await sequelize.query(
        'SELECT * FROM artists WHERE id = :id',
        {
          replacements: { id },
          type: sequelize.QueryTypes.SELECT
        }
      );

      if (!artist) {
        return res.status(404).json({ message: 'Artista no encontrado' });
      }

      // Regenerar slug si cambia el nombre
      let slug = artist.slug;
      if (name && name !== artist.name) {
        slug = name.toLowerCase()
          .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
          .replace(/[^\w\s-]/g, '')
          .replace(/[\s_-]+/g, '-')
          .replace(/^-+|-+$/g, '');
      }

      await sequelize.query(
        `UPDATE artists 
         SET name = :name, slug = :slug, country_code = :country_code, bio = :bio
         WHERE id = :id`,
        {
          replacements: { id, name, slug, country_code, bio }
        }
      );

      const [updatedArtist] = await sequelize.query(
        'SELECT * FROM artists WHERE id = :id',
        {
          replacements: { id },
          type: sequelize.QueryTypes.SELECT
        }
      );

      res.json({
        message: 'Artista actualizado exitosamente',
        artist: updatedArtist
      });
    } catch (error) {
      console.error('❌ Error actualizando artista:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;

      const [artist] = await sequelize.query(
        'SELECT * FROM artists WHERE id = :id',
        {
          replacements: { id },
          type: sequelize.QueryTypes.SELECT
        }
      );

      if (!artist) {
        return res.status(404).json({ message: 'Artista no encontrado' });
      }

      // Verificar si tiene canciones asociadas
      const [songs] = await sequelize.query(
        'SELECT COUNT(*) as count FROM songs WHERE artist_id = :id',
        {
          replacements: { id },
          type: sequelize.QueryTypes.SELECT
        }
      );

      if (songs.count > 0) {
        return res.status(400).json({ 
          message: 'No se puede eliminar el artista porque tiene canciones asociadas' 
        });
      }

      await sequelize.query(
        'DELETE FROM artists WHERE id = :id',
        { replacements: { id } }
      );

      res.json({ message: 'Artista eliminado exitosamente' });
    } catch (error) {
      console.error('❌ Error eliminando artista:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }
}

module.exports = new ArtistsController();
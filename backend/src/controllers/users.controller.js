const User = require('../models/User.model.js');
const { validationResult } = require('express-validator');

class UsersController {
  // Obtener perfil del usuario actual
  async getProfile(req, res) {
    try {
      const user = await User.findByPk(req.user.id, {
        attributes: { exclude: ['password_hash'] }
      });

      if (!user) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }

      res.json({ user });
    } catch (error) {
      console.error('Error obteniendo perfil:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  // Obtener usuario por username
  async getUserByUsername(req, res) {
    try {
      const { username } = req.params;

      const user = await User.findOne({
        where: { username },
        attributes: { exclude: ['password_hash', 'email'] }
      });

      if (!user) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }

      res.json({ user });
    } catch (error) {
      console.error('Error obteniendo usuario:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  // Actualizar perfil
  async updateProfile(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { display_name, country_code, region } = req.body;

      const user = await User.findByPk(req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }

      await user.update({
        display_name,
        country_code,
        region
      });

      const updatedUser = user.toJSON();
      delete updatedUser.password_hash;

      res.json({
        message: 'Perfil actualizado exitosamente',
        user: updatedUser
      });
    } catch (error) {
      console.error('Error actualizando perfil:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  // Obtener estadísticas del usuario
  async getUserStats(req, res) {
    try {
      const { username } = req.params;

      const user = await User.findOne({
        where: { username },
        attributes: ['id', 'username', 'display_name', 'reputation_score', 'created_at']
      });

      if (!user) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }

      // TODO: Agregar conteos reales cuando tengamos las relaciones
      const stats = {
        annotations_count: 0,
        songs_added: 0,
        upvotes_received: 0
      };

      res.json({
        user,
        stats
      });
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }
}

module.exports = new UsersController();
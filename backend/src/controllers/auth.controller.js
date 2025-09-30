const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sequelize = require('../config/database');

class AuthController {
  // Registro de usuario
  async register(req, res) {
    try {
      const { email, username, password, display_name, country_code } = req.body;

      // Verificar si el email ya existe
      const [existingUser] = await sequelize.query(
        'SELECT * FROM users WHERE email = :email OR username = :username',
        {
          replacements: { email, username },
          type: sequelize.QueryTypes.SELECT
        }
      );

      if (existingUser) {
        return res.status(400).json({
          message: 'El email o username ya está registrado'
        });
      }

      // Hash de la contraseña
      const password_hash = await bcrypt.hash(password, 10);

      // Crear usuario
      const [result] = await sequelize.query(
        `INSERT INTO users (email, username, password_hash, display_name, country_code)
         VALUES (:email, :username, :password_hash, :display_name, :country_code)`,
        {
          replacements: { email, username, password_hash, display_name, country_code }
        }
      );

      const [newUser] = await sequelize.query(
        'SELECT id, email, username, display_name, country_code FROM users WHERE id = :id',
        {
          replacements: { id: result },
          type: sequelize.QueryTypes.SELECT
        }
      );

      // Generar token JWT
      const token = jwt.sign(
        { userId: newUser.id },
        process.env.JWT_SECRET || 'secret-key',
        { expiresIn: '24h' }
      );

      res.status(201).json({
        message: 'Usuario registrado exitosamente',
        token,
        user: newUser
      });
    } catch (error) {
      console.error('Error en registro:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  // Login de usuario
  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Buscar usuario
      const [user] = await sequelize.query(
        'SELECT * FROM users WHERE email = :email',
        {
          replacements: { email },
          type: sequelize.QueryTypes.SELECT
        }
      );

      if (!user) {
        return res.status(401).json({ message: 'Credenciales inválidas' });
      }

      // Verificar contraseña
      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Credenciales inválidas' });
      }

      // Generar token
      const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET || 'secret-key',
        { expiresIn: '24h' }
      );

      const userResponse = { ...user };
      delete userResponse.password_hash;

      res.json({
        message: 'Login exitoso',
        token,
        user: userResponse
      });
    } catch (error) {
      console.error('Error en login:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  // Obtener usuario actual
  async me(req, res) {
    try {
      const [user] = await sequelize.query(
        'SELECT id, email, username, display_name, country_code, reputation_score FROM users WHERE id = :id',
        {
          replacements: { id: req.user.id },
          type: sequelize.QueryTypes.SELECT
        }
      );

      res.json({ user });
    } catch (error) {
      console.error('Error obteniendo usuario:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }
}

module.exports = new AuthController();
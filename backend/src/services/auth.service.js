

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/user.repository');
const logger = require('../utils/logger');

class AuthService {
  /**
   
   * @param {Object} userData - Datos del usuario { email, username, password, display_name, country_code }
   * @returns {Object} { user, token }
   */
  async register(userData) {
    const { email, username, password, display_name, country_code } = userData;

    // Validar email y username
    const existing = await userRepository.exists(email, username);
    if (existing) {
      if (existing.email === email.toLowerCase()) {
        const error = new Error('El email ya est� registrado');
        error.code = 'EMAIL_EXISTS';
        error.statusCode = 409;
        throw error;
      }
      if (existing.username === username.toLowerCase()) {
        const error = new Error('El username ya est� registrado');
        error.code = 'USERNAME_EXISTS';
        error.statusCode = 409;
        throw error;
      }
    }

    // Hash 
    const password_hash = await this.hashPassword(password);

    // Crear usuario
    const user = await userRepository.create({
      email,
      username,
      password_hash,
      display_name: display_name || null,
      country_code: country_code || null
    });

    // Generar token
    const token = this.generateToken(user.id);

    logger.info('Usuario registrado exitosamente', {
      user_id: user.id,
      email: user.email
    });

    // Retornar sin password_hash
    const userResponse = user.toJSON();
    delete userResponse.password_hash;

    return {
      user: userResponse,
      token
    };
  }

  /**
   * Login de usuario
   * @param {string} email
   * @param {string} password
   * @returns {Object} { user, token }
   */

  async login(email, password) {

    // Buscar usuario por email
    const user = await userRepository.getByEmail(email);
    if (!user) {
      logger.warn('Intento de login con email no registrado', { email });
      const error = new Error('Credenciales inv�lidas');
      error.code = 'INVALID_CREDENTIALS';
      error.statusCode = 401;
      throw error;
    }

    // Verificar contrasena
    const isValidPassword = await this.verifyPassword(password, user.password_hash);
    if (!isValidPassword) {
      logger.warn('Intento de login con contrase�a incorrecta', {
        user_id: user.id,
        email
      });
      const error = new Error('Credenciales inv�lidas');
      error.code = 'INVALID_CREDENTIALS';
      error.statusCode = 401;
      throw error;
    }

    // Generar token
    const token = this.generateToken(user.id);

    logger.info('Login exitoso', {
      user_id: user.id,
      email: user.email
    });

    // Retornar sin password_hash
    const userResponse = user.toJSON();
    delete userResponse.password_hash;

    return {
      user: userResponse,
      token
    };
  }

  /**
   * Verificar token JWT
   * @param {string} token
   * @returns {Object} decoded payload
   */
  verifyToken(token) {
    try {
      const decoded = jwt.verify(token, this.getJwtSecret());
      return decoded;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        const err = new Error('Token expirado');
        err.code = 'TOKEN_EXPIRED';
        err.statusCode = 401;
        throw err;
      }
      const err = new Error('Token inv�lido');
      err.code = 'INVALID_TOKEN';
      err.statusCode = 403;
      throw err;
    }
  }

  /**
   * Refrescar token JWT
   * @param {number} userId
   * @returns {string} nuevo token
   */
  refreshToken(userId) {
    logger.info('Token refrescado', { user_id: userId });
    return this.generateToken(userId);
  }

  /**
   * Cambiar contrasena
   * @param {number} userId
   * @param {string} currentPassword
   * @param {string} newPassword
   */
  async changePassword(userId, currentPassword, newPassword) {
    // Obtener usuario con cotra 

    const user = await userRepository.getById(userId);
    if (!user) {
      const error = new Error('Usuario no encontrado');
      error.code = 'USER_NOT_FOUND';
      error.statusCode = 404;
      throw error;
    }

    // Obtener contraseñna
    const userWithPassword = await userRepository.getByEmail(user.email);

    // Verificar contraseña
    const isValid = await this.verifyPassword(
      currentPassword,
      userWithPassword.password_hash
    );

    if (!isValid) {
      logger.warn('Intento de cambiar contrase�a con contrase�a incorrecta', {
        user_id: userId
      });
      const error = new Error('Contrase�a actual incorrecta');
      error.code = 'INVALID_PASSWORD';
      error.statusCode = 401;
      throw error;
    }

    // Validar que nueva contraseñna
    if (currentPassword === newPassword) {
      const error = new Error('La nueva contrase�a debe ser diferente');
      error.code = 'SAME_PASSWORD';
      error.statusCode = 400;
      throw error;
    }

    // Hashear nueva contraseñna
    const newPasswordHash = await this.hashPassword(newPassword);

    // Actualizar
    await userRepository.updatePassword(userId, newPasswordHash);

    logger.info('Contrase�a cambiada exitosamente', { user_id: userId });
  }

  /**
   * Hashear contraseña
   * @param {string} password
   * @returns {string} hash
   */
  async hashPassword(password) {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  }

  /**
   * Verificar contraseña
   * @param {string} password - 
   * @param {string} hash - 
   * @returns {boolean}
   */
  async verifyPassword(password, hash) {
    return await bcrypt.compare(password, hash);
  }

  /**
   * Generar JWT token
   * @param {number} userId
   * @returns {string} token
   */
  generateToken(userId) {
    const payload = { userId };
    const secret = this.getJwtSecret();
    const options = { expiresIn: '24h' };

    return jwt.sign(payload, secret, options);
  }

  /**
   * Obtener JWT secret 
   * @returns {string}
   */
  getJwtSecret() {
    const secret = process.env.JWT_SECRET;

    if (!secret || secret === 'secret-key') {
      logger.error('�  JWT_SECRET no configurado o usa valor por defecto inseguro');
      // En producci�n, esto deber�a fallar
      if (process.env.NODE_ENV === 'production') {
        throw new Error('JWT_SECRET debe estar configurado en producci�n');
      }
    }

    return secret || 'secret-key';
  }

  /**
   * Validar fortaleza de contrase
   * @param {string} password
   * @returns {Object} { valid: boolean, errors: string[] }
   */
  validatePasswordStrength(password) {
    const errors = [];

    if (password.length < 8) {
      errors.push('La contrase�a debe tener al menos 8 caracteres');
    }
    return {
      valid: errors.length === 0,
      errors
    };
  }
}

module.exports = new AuthService();

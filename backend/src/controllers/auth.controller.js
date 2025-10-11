const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/user.repository');
const { AppError, asyncHandler } = require('../middleware/errorHandler.middleware');
const logger = require('../utils/logger');

class AuthController {
  /**
   * POST /api/auth/register
   * Registrar nuevo usuario
   */
  register = asyncHandler(async (req, res) => {
    const { email, username, password, display_name, country_code } = req.body;

    // Validación básica
    if (!email || !email.trim()) {
      throw new AppError('Email requerido', 400);
    }

    if (!username || username.trim().length < 3) {
      throw new AppError('Username debe tener al menos 3 caracteres', 400);
    }

    if (!password || password.length < 8) {
      throw new AppError('Contraseña debe tener al menos 8 caracteres', 400);
    }

    logger.info('Intento de registro', { email, username });

    try {
      // Verificar si email o username ya existen
      const existing = await userRepository.exists(email, username);
      if (existing) {
        logger.warn('Intento de registro con datos duplicados', {
          email: existing.email === email.toLowerCase() ? email : undefined,
          username: existing.username === username.toLowerCase() ? username : undefined
        });

        if (existing.email === email.toLowerCase()) {
          throw new AppError('El email ya está registrado', 409);
        }
        if (existing.username === username.toLowerCase()) {
          throw new AppError('El username ya está registrado', 409);
        }
      }

      // Hash de la contraseña
      const password_hash = await bcrypt.hash(password, 10);

      // Crear usuario
      const user = await userRepository.create({
        email,
        username,
        password_hash,
        display_name: display_name || null,
        country_code: country_code || null
      });

      // Generar token JWT
      const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET || 'secret-key',
        { expiresIn: '24h' }
      );

      logger.info('Usuario registrado exitosamente', { user_id: user.id, email });

      res.status(201).json({
        success: true,
        message: 'Usuario registrado exitosamente',
        token,
        user
      });
    } catch (error) {
      if (error.code === 'EMAIL_EXISTS') {
        throw new AppError('El email ya está registrado', 409);
      }
      if (error.code === 'USERNAME_EXISTS') {
        throw new AppError('El username ya está registrado', 409);
      }
      throw error;
    }
  });

  /**
   * POST /api/auth/login
   * Iniciar sesión
   */
  login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Validación básica
    if (!email || !email.trim()) {
      throw new AppError('Email requerido', 400);
    }

    if (!password) {
      throw new AppError('Contraseña requerida', 400);
    }

    logger.info('Intento de login', { email });

    // Buscar usuario por email (incluye contraseña)
    const user = await userRepository.getByEmail(email);
    if (!user) {
      logger.warn('Intento de login con email no registrado', { email });
      throw new AppError('Credenciales inválidas', 401);
    }

    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      logger.warn('Intento de login con contraseña incorrecta', {
        user_id: user.id,
        email
      });
      throw new AppError('Credenciales inválidas', 401);
    }

    // Generar token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'secret-key',
      { expiresIn: '24h' }
    );

    // Preparar respuesta (sin contraseña)
    const userResponse = user.toJSON();
    delete userResponse.password_hash;

    logger.info('Login exitoso', { user_id: user.id, email });

    res.json({
      success: true,
      message: 'Login exitoso',
      token,
      user: userResponse
    });
  });

  /**
   * GET /api/auth/me
   * Obtener usuario actual (verificar token)
   */
  me = asyncHandler(async (req, res) => {
    const userId = req.user?.id;

    logger.info('Obteniendo usuario actual', { user_id: userId });

    const user = await userRepository.getById(userId);
    if (!user) {
      throw new AppError('Usuario no encontrado', 404);
    }

    res.json({
      success: true,
      user
    });
  });

  /**
   * POST /api/auth/refresh
   * Refrescar token JWT
   */
  refresh = asyncHandler(async (req, res) => {
    const userId = req.user?.id;

    logger.info('Refrescando token', { user_id: userId });

    const user = await userRepository.getById(userId);
    if (!user) {
      throw new AppError('Usuario no encontrado', 404);
    }

    // Generar nuevo token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: 'Token refrescado',
      token
    });
  });

  /**
   * POST /api/auth/logout
   * Cerrar sesión (stateless con JWT)
   */
  logout = asyncHandler(async (req, res) => {
    const userId = req.user?.id;

    logger.info('Usuario cerró sesión', { user_id: userId });

    // Con JWT no hay sesión en servidor, solo notificamos al cliente
    res.json({
      success: true,
      message: 'Logout exitoso'
    });
  });

  /**
   * POST /api/auth/change-password
   * Cambiar contraseña
   */
  changePassword = asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    const { currentPassword, newPassword } = req.body;

    // Validación
    if (!currentPassword) {
      throw new AppError('Contraseña actual requerida', 400);
    }

    if (!newPassword || newPassword.length < 8) {
      throw new AppError('Nueva contraseña debe tener al menos 8 caracteres', 400);
    }

    if (currentPassword === newPassword) {
      throw new AppError('La nueva contraseña debe ser diferente', 400);
    }

    logger.info('Intento de cambiar contraseña', { user_id: userId });

    // Obtener usuario (con contraseña)
    const user = await userRepository.getById(userId);
    if (!user) {
      throw new AppError('Usuario no encontrado', 404);
    }

    // Verificar contraseña actual
    const userWithPassword = await userRepository.getByEmail(user.email);
    const isValidPassword = await bcrypt.compare(
      currentPassword,
      userWithPassword.password_hash
    );

    if (!isValidPassword) {
      logger.warn('Intento de cambiar contraseña con contraseña incorrecta', {
        user_id: userId
      });
      throw new AppError('Contraseña actual incorrecta', 401);
    }

    // Hashear nueva contraseña
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    // Actualizar
    await userRepository.updatePassword(userId, newPasswordHash);

    logger.info('Contraseña cambiada exitosamente', { user_id: userId });

    res.json({
      success: true,
      message: 'Contraseña cambiada exitosamente'
    });
  });

  /**
   * POST /api/auth/verify-token
   * Verificar si un token es válido
   */
  verifyToken = asyncHandler(async (req, res) => {
    const userId = req.user?.id;

    logger.info('Verificando token', { user_id: userId });

    const user = await userRepository.getById(userId);
    if (!user) {
      throw new AppError('Usuario no encontrado', 404);
    }

    res.json({
      success: true,
      message: 'Token válido',
      user
    });
  });
}

module.exports = new AuthController();
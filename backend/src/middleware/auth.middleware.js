// backend/src/middleware/auth.middleware.js
const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/user.repository');

// Autenticación requerida - AHORA ES ASYNC
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        message: 'Token de acceso requerido',
        code: 'NO_TOKEN'
      });
    }

    // jwt.verify es síncrono
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret-key');
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          message: 'Token expirado',
          code: 'TOKEN_EXPIRED'
        });
      }
      return res.status(403).json({ 
        message: 'Token inválido',
        code: 'INVALID_TOKEN'
      });
    }
    
    // Obtener usuario completo de la BD
    const user = await userRepository.getById(decoded.userId);
    
    if (!user) {
      return res.status(404).json({
        message: 'Usuario no encontrado',
        code: 'USER_NOT_FOUND'
      });
    }

    // Pasar usuario completo a req.user
    req.user = {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role
    };

    next();
    
  } catch (error) {
    console.error('Error en authenticateToken:', error);
    return res.status(500).json({ 
      message: 'Error interno en autenticación',
      code: 'AUTH_ERROR'
    });
  }
};

// Autenticación opcional - AHORA ES ASYNC
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret-key');
        
        // Obtener usuario completo si es posible
        const user = await userRepository.getById(decoded.userId);
        
        if (user) {
          req.user = {
            id: user.id,
            email: user.email,
            username: user.username,
            role: user.role
          };
        }
      } catch (error) {
        // Si el token falla, simplemente no autenticar
        console.debug('Token opcional inválido, continuando sin autenticación');
      }
    }
    next();
  } catch (error) {
    console.error('Error en optionalAuth:', error);
    // Continuar sin autenticación
    next(); 
  }
};

module.exports = {
  authenticateToken,
  optionalAuth
};
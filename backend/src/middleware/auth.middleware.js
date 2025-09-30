const jwt = require('jsonwebtoken');
const { User } = require('../models'); // Descomentar cuando tengamos modelos

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

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // TODO: Buscar usuario cuando tengamos modelos
    const user = await User.findByPk(decoded.userId);
    if (!user) {
     return res.status(401).json({ message: 'Usuario no encontrado' });
    }
    
    req.user = { id: decoded.userId }; // Temporalmente
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
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
};

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = { id: decoded.userId };
    }
    
    next();
  } catch (error) {
    // Si hay error en token opcional, continuar sin usuario
    req.user = null;
    next();
  }
};

module.exports = {
  authenticateToken,
  optionalAuth
};
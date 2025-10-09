const jwt = require('jsonwebtoken');

// Eliminamos 'async' ya que jwt.verify es síncrono.
// Esto asegura que cualquier error sea capturado y manejado correctamente.
const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        message: 'Token de acceso requerido',
        code: 'NO_TOKEN'
      });
    }

    // jwt.verify lanza un error síncrono si falla
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret-key');
    
    req.user = { id: decoded.userId };
    next();
    
  } catch (error) {
    // Si jwt.verify falla, se ejecuta este bloque
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: 'Token expirado',
        code: 'TOKEN_EXPIRED'
      });
    }
    
    // Para cualquier otro error de verificación (Token inválido, etc.)
    return res.status(403).json({ 
      message: 'Token inválido',
      code: 'INVALID_TOKEN'
    });
  }
};

const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret-key');
      req.user = { id: decoded.userId };
    }
    next();
  } catch (error) {
    // Si el token opcional falla, simplemente se ignora y se llama a next()
    next(); 
  }
};

module.exports = {
  authenticateToken,
  optionalAuth
};
const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por ventana
  message: 'Demasiadas solicitudes desde esta IP, intenta de nuevo más tarde'
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // máximo 5 intentos de login
  message: 'Demasiados intentos de login, intenta de nuevo más tarde'
});

module.exports = {
  apiLimiter,
  authLimiter
};
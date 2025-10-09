const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticateToken } = require('../middleware/auth.middleware');
const { validateUserRegistration, validateUserLogin } = require('../middleware/validation.middleware');

// Registro de usuario
router.post('/register', validateUserRegistration, authController.register);

// Login
router.post('/login', validateUserLogin, authController.login);

// Obtener usuario actual (requiere autenticación)
router.get('/me', authenticateToken, authController.me);

// Logout (opcional, ya que JWT es stateless)
router.post('/logout', authenticateToken, (req, res) => {
  res.json({ message: 'Logout exitoso' });
});

module.exports = router;
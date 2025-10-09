const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users.controller');
const { authenticateToken, optionalAuth } = require('../middleware/auth.middleware');

// Obtener perfil del usuario actual
router.get('/profile', authenticateToken, usersController.getProfile);

// Actualizar perfil del usuario actual
router.put('/profile', authenticateToken, usersController.updateProfile);

// Obtener usuario público por username
router.get('/:username', optionalAuth, usersController.getUserByUsername);

// Obtener estadísticas de usuario
router.get('/:username/stats', optionalAuth, usersController.getUserStats);

module.exports = router;
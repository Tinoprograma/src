// backend/src/routes/users.routes.js
const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

// Rutas protegidas (requieren autenticación)
router.get('/profile', authenticateToken, usersController.getProfile);
router.put('/profile', authenticateToken, usersController.updateProfile);

// Rutas públicas dinámicas (Con :username)
// Estas permiten ver perfiles públicos sin autenticación
router.get('/:username/stats', usersController.getUserStats);
router.get('/:username/annotations', usersController.getUserAnnotations);
router.get('/:username', usersController.getUserByUsername);

module.exports = router;
const express = require('express');
const router = express.Router();
const songsController = require('../controllers/songs.controller');
const { authenticateToken, optionalAuth } = require('../middleware/auth.middleware');
const { validateSong } = require('../middleware/validation.middleware');

// Rutas públicas
router.get('/', optionalAuth, songsController.getAll);
router.get('/:id', optionalAuth, songsController.getById);

// Rutas protegidas (requieren autenticación)
router.post('/', authenticateToken, validateSong, songsController.create);
router.put('/:id', authenticateToken, validateSong, songsController.update);
router.delete('/:id', authenticateToken, songsController.delete);

module.exports = router;
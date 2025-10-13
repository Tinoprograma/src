// backend/src/routes/songs.routes.js
const express = require('express');
const router = express.Router();
const songsController = require('../controllers/songs.controller');
const { authenticateToken, optionalAuth } = require('../middleware/auth.middleware');
const { validateSong } = require('../middleware/validation.middleware');


// Rutas públicas específicas 
router.get('/trending', songsController.getTrending);
router.get('/search/:query', songsController.search);

// Rutas dinámicas 
router.get('/:id/stats', songsController.getStats);
router.get('/:id', songsController.getById);

// Ruta GET genérica 
router.get('/', songsController.getAll);

// Rutas protegidas (requieren autenticación)
router.post('/', authenticateToken, validateSong, songsController.create);
router.put('/:id', authenticateToken, validateSong, songsController.update);
router.delete('/:id', authenticateToken, songsController.delete);

module.exports = router;
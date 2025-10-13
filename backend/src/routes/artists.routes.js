// backend/src/routes/artists.routes.js
const express = require('express');
const router = express.Router();
const artistsController = require('../controllers/artists.controller');
const { authenticateToken } = require('../middleware/auth.middleware');


// Rutas públicas específicas 
// Estas rutas NO necesitan autenticación

// Rutas dinámicas 
router.get('/:id/stats', artistsController.getStats);
router.get('/:id/songs', artistsController.getSongs);
router.get('/:id/albums', artistsController.getAlbums);
router.get('/:id/similar', artistsController.getSimilar);
router.get('/:id', artistsController.getById);

// Ruta GET genérica - Lista todos los artistas
router.get('/', artistsController.getAll);

// Rutas protegidas (requieren autenticación)
router.post('/', authenticateToken, artistsController.create);
router.put('/:id', authenticateToken, artistsController.update);
router.delete('/:id', authenticateToken, artistsController.delete);
router.patch('/:id/verify', authenticateToken, artistsController.verify);

module.exports = router;
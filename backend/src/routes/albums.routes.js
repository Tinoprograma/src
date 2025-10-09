const express = require('express');
const router = express.Router();
const albumsController = require('../controllers/albums.controller');
const { authenticateToken, optionalAuth } = require('../middleware/auth.middleware');

// Rutas públicas
router.get('/', optionalAuth, albumsController.getAll);
router.get('/:id', optionalAuth, albumsController.getById);
router.get('/artist/:artist_id', optionalAuth, albumsController.getByArtist);
router.get('/:id/songs', optionalAuth, albumsController.getSongs);

// Rutas protegidas (requieren autenticación)
router.post('/', authenticateToken, albumsController.create);
router.put('/:id', authenticateToken, albumsController.update);
router.delete('/:id', authenticateToken, albumsController.delete);

module.exports = router;
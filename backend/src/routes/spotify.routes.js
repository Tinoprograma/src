const express = require('express');
const router = express.Router();
const spotifyController = require('../controllers/spotify.controller');

// POST /api/spotify/search - Buscar canción
router.post('/search', spotifyController.search);

// GET /api/spotify/track/:trackId - Obtener track por ID
router.get('/track/:trackId', spotifyController.getTrack);

module.exports = router;
const express = require('express');
const router = express.Router();
const artistsController = require('../controllers/artists.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

router.get('/', artistsController.getAll);
router.post('/', authenticateToken, artistsController.create);

module.exports = router;
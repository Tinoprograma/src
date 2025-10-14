// backend/routes/spotify.js (BACKEND - Node.js)
const express = require('express');
const axios = require('axios');
const router = express.Router();

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET; // ✅ Seguro en .env

let cachedToken = null;
let tokenExpiry = null;

router.get('/token', async (req, res) => {
  try {
    // Verificar si tenemos token válido
    if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
      return res.json({ 
        access_token: cachedToken,
        expires_in: Math.floor((tokenExpiry - Date.now()) / 1000)
      });
    }

    const credentials = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
    
    const response = await axios.post(
      'https://accounts.spotify.com/api/token',
      'grant_type=client_credentials',
      {
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    cachedToken = response.data.access_token;
    tokenExpiry = Date.now() + (response.data.expires_in * 1000);

    res.json({
      access_token: cachedToken,
      expires_in: response.data.expires_in
    });
  } catch (error) {
    console.error('Error obteniendo token Spotify:', error);
    res.status(500).json({ error: 'No se pudo obtener token de Spotify' });
  }
});

module.exports = router;
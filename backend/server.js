// backend/server.js
const app = require('./src/app');

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || 'localhost';

app.listen(PORT, HOST, () => {
  console.log(`🚀 Servidor Sabelo ejecutándose en http://${HOST}:${PORT}`);
  console.log(`📱 Frontend esperado en ${process.env.FRONTEND_URL}`);
  console.log(`🌍 Entorno: ${process.env.NODE_ENV}`);
});
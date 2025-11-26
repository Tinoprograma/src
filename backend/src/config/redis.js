const redis = require('redis');
require('dotenv').config();

const client = redis.createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  retry_strategy: (options) => {
    if (options.error && options.error.code === 'ECONNREFUSED') {
      console.error('❌ Redis servidor rechazó la conexión');
      return new Error('Redis servidor rechazó la conexión');
    }
    if (options.total_retry_time > 1000 * 60 * 60) {
      console.error('❌ Timeout de retry de Redis excedido');
      return new Error('Timeout de retry excedido');
    }
    if (options.attempt > 10) {
      return undefined;
    }
    // Reconnect after
    return Math.min(options.attempt * 100, 3000);
  }
});

client.on('connect', () => {
  console.log('  Conectado a Redis');
});

client.on('error', (err) => {
  console.error('❌ Error de Redis:', err);
});

module.exports = client;
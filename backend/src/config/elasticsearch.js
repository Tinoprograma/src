const { Client } = require('@elastic/elasticsearch');
require('dotenv').config();

const client = new Client({
  node: process.env.ELASTICSEARCH_NODE || 'http://localhost:9200',
  requestTimeout: 30000,
  maxRetries: 3,
  resurrectStrategy: 'ping'
});

// Test connection
async function testConnection() {
  try {
    const health = await client.cluster.health();
    console.log('  Elasticsearch conectado:', health.body.status);
  } catch (error) {
    console.error(' Error conectando a Elasticsearch:', error.message);
  }
}

testConnection();

module.exports = client;
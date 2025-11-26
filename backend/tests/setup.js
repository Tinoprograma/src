require('dotenv').config({ path: '.env.test' });
const sequelize = require('../config/database');

beforeAll(async () => {
  await sequelize.sync({ force: true });
});

afterAll(async () => {

  try {
    await sequelize.close();
  } catch (error) {
    console.error('Error cerrando Sequelize:', error);
  }
});


jest.setTimeout(30000); // 30 segundos de timeout
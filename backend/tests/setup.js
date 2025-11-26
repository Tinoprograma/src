require('dotenv').config({ path: '.env.test' });
const sequelize = require('../config/database');

beforeAll(async () => {
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});

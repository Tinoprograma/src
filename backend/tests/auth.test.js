const request = require('supertest');
const app = require('../src/app');

describe('AUTH - Registro y Login', () => {

  test('Registro exitoso de usuario', async () => {

    const email = `juan_${Date.now()}@mail.com`;
    const username = `juan_${Date.now()}`;

    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email,
        username,
        password: '12345678',        
        display_name: 'Juan Pérez',
        country_code: 'AR'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('token');
  });

  test('Registro falla si faltan datos', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'sinusuario@mail.com'
      });

    expect(res.statusCode).toBe(400);
  });

});

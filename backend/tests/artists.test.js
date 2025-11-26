const request = require('supertest');
const app = require('../src/app');

let token;

beforeAll(async () => {
  const email = `admin_${Date.now()}@mail.com`;
  const username = `admin_${Date.now()}`;
  const password = '12345678';

  // REGISTRO
  await request(app)
    .post('/api/auth/register')
    .send({
      email,
      username,
      password
    });

  // LOGIN (ACA sale el token REAL)
  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({
      email,
      password
    });

  token = loginRes.body.token;
});

test('Crear artista correctamente', async () => {
  const res = await request(app)
    .post('/api/artists')
    .set('Authorization', `Bearer ${token}`)
    .send({
      name: 'Artista Test'
    });

  expect(res.statusCode).toBe(201);
});

test('No permite crear artista sin nombre', async () => {
  const res = await request(app)
    .post('/api/artists')
    .set('Authorization', `Bearer ${token}`)
    .send({});

  expect(res.statusCode).toBe(400);
});

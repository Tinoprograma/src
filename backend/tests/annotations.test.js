const request = require('supertest');
const app = require('../src/app');

let token;
let songId;

beforeAll(async () => {
  const email = `ana_${Date.now()}@mail.com`;
  const username = `ana_${Date.now()}`;
  const password = '12345678';

  // Registro
  await request(app).post('/api/auth/register').send({
    email,
    username,
    password
  });

  // Login
  const loginRes = await request(app).post('/api/auth/login').send({
    email,
    password
  });

  token = loginRes.body.token;

  // Crear artista
  const artist = await request(app)
    .post('/api/artists')
    .set('Authorization', `Bearer ${token}`)
    .send({ name: 'Artista Test' });

  // Crear canción
  const song = await request(app)
    .post('/api/songs')
    .set('Authorization', `Bearer ${token}`)
    .send({
      title: 'Canción Test',
      artist_id: artist.body.id,
      duration: 180
    });

  songId = song.body.id;
});

test('Crear anotación correctamente', async () => {
  const res = await request(app)
    .post('/api/annotations')
    .set('Authorization', `Bearer ${token}`)
    .send({
      start_time: 10,
      end_time: 20,
      text: 'Anotación test',
      song_id: songId    
    });

  expect(res.statusCode).toBe(201);
});

test('No permite crear anotacion con rangos invalidos', async () => {
  const res = await request(app)
    .post('/api/annotations')
    .set('Authorization', `Bearer ${token}`)
    .send({
      start_time: 30,
      end_time: 10,
      text: 'Mal rango',
      song_id: songId
    });

  expect(res.statusCode).toBe(400);
});

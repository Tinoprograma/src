const request = require('supertest');
const app = require('../src/app');

let token;
let songId;

beforeAll(async () => {
  const timestamp = Date.now();
  const email = `ana_${timestamp}@mail.com`;
  const username = `ana_${timestamp}`;
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

  // Crear artista con nombre único
  const artist = await request(app)
    .post('/api/artists')
    .set('Authorization', `Bearer ${token}`)
    .send({ name: `Artista Test ${timestamp}` });

  if (artist.statusCode !== 201) {
    console.error(' Error creando artista:', artist.body);
    throw new Error('No se pudo crear el artista');
  }

  const artistId = artist.body.artist.id; // Acceder a la estructura 

  // Crear canción CON TODOS LOS CAMPOS REQUERIDOS
  const song = await request(app)
    .post('/api/songs')
    .set('Authorization', `Bearer ${token}`)
    .send({
      title: `Canción Test ${timestamp}`,
      artist_id: parseInt(artistId), //  Convertir a número
      lyrics: 'Verso uno de la canción\nEsto es el coro\nVerso dos aquí\nFin de la canción',
      is_single: true // no requerir album_id
    });

  if (song.statusCode !== 201) {
    console.error(' Error creando canción:', song.body);
    throw new Error('No se pudo crear la canción');
  }

  songId = song.body.song.id; //  Acceder a la estructura 
});

test('Crear anotación correctamente', async () => {
  const res = await request(app)
    .post('/api/annotations')
    .set('Authorization', `Bearer ${token}`)
    .send({
      song_id: songId,
      text_selection: 'Verso uno',
      start_char: 0,
      end_char: 9,
      explanation: 'Esta es una explicación de prueba que tiene más de 10 caracteres'
    });

  expect(res.statusCode).toBe(201);
});

test('No permite crear anotacion con rangos invalidos', async () => {
  const res = await request(app)
    .post('/api/annotations')
    .set('Authorization', `Bearer ${token}`)
    .send({
      song_id: songId,
      text_selection: 'texto',
      start_char: 50,
      end_char: 10,
      explanation: 'Explicación de prueba con rango inválido'
    });

  expect(res.statusCode).toBe(400);
});
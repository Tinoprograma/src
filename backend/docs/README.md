# Documentación del Backend — Sabelo API

> Plataforma comunitaria para anotaciones musicales. API RESTful construida con Node.js + Express.js y MySQL/Sequelize.

## Tecnologías

- **Framework:** Express.js 5.1.0
- **Base de datos:** MySQL + Sequelize ORM
- **Autenticación:** JWT (JSON Web Tokens), 24h de expiración
- **Contraseñas:** bcryptjs (10 salt rounds)
- **Arquitectura:** Repository pattern, controladores class-based singleton

## Autenticación

Los endpoints protegidos requieren un token JWT en el header:

```
Authorization: Bearer <token>
```

El token se obtiene al registrarse (`POST /api/auth/register`) o al iniciar sesión (`POST /api/auth/login`).

## Convenciones de respuesta

**Respuesta exitosa:**
```json
{
  "success": true,
  "data": { ... }
}
```

**Respuesta de error:**
```json
{
  "success": false,
  "message": "Descripción del error"
}
```

**Paginación (en endpoints de lista):**
```json
{
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

## Controladores

| Controlador | Archivo | Prefijo | Descripción |
|-------------|---------|---------|-------------|
| [AdminController](./controllers/admin.md) | `src/controllers/admin.controller.js` | `/api/admin` | Gestión administrativa de usuarios, contenido y auditoría |
| [AlbumsController](./controllers/albums.md) | `src/controllers/albums.controller.js` | `/api/albums` | CRUD de álbumes musicales |
| [AnnotationsController](./controllers/annotations.md) | `src/controllers/annotations.controller.js` | `/api/annotations` | Gestión de anotaciones en letras, votación y verificación |
| [ArtistsController](./controllers/artists.md) | `src/controllers/artists.controller.js` | `/api/artists` | Perfiles de artistas, similares y verificación |
| [AuthController](./controllers/auth.md) | `src/controllers/auth.controller.js` | `/api/auth` | Registro, login, JWT y cambio de contraseña |
| [SongsController](./controllers/songs.md) | `src/controllers/songs.controller.js` | `/api/songs` | CRUD de canciones, búsqueda, trending y estadísticas |
| [SpotifyController](./controllers/spotify.md) | `src/controllers/spotify.controller.js` | `/api/spotify` | Integración con Spotify API |
| [UsersController](./controllers/users.md) | `src/controllers/users.controller.js` | `/api/users` | Perfiles de usuario, estadísticas y anotaciones |
| [TestController](./controllers/test.md) | `src/controllers/test.controller.js` | `/` | Health check y pruebas de conectividad |

## Resumen de endpoints por controlador

### AdminController — 12 endpoints
| Método | Ruta | Descripción |
|--------|------|-------------|
| PATCH | `/api/admin/annotations/:annotationId` | Verificar anotación |
| DELETE | `/api/admin/annotations/:annotationId` | Eliminar anotación |
| PUT | `/api/admin/songs/:songId` | Actualizar letras |
| DELETE | `/api/admin/songs/:songId` | Eliminar canción |
| PUT | `/api/admin/artists/:artistId` | Actualizar artista |
| DELETE | `/api/admin/artists/:artistId` | Eliminar artista |
| PUT | `/api/admin/albums/:albumId` | Actualizar álbum |
| DELETE | `/api/admin/albums/:albumId` | Eliminar álbum |
| GET | `/api/admin/audit-logs` | Logs de auditoría |
| GET | `/api/admin/users` | Listar usuarios |
| PUT | `/api/admin/users/:userId` | Cambiar rol |
| DELETE | `/api/admin/users/:userId` | Eliminar usuario |

### AlbumsController — 8 endpoints
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/albums` | Listar álbumes |
| GET | `/api/albums/:id` | Obtener álbum |
| GET | `/api/albums/artist/:artist_id` | Álbumes de artista |
| GET | `/api/albums/:id/songs` | Canciones del álbum |
| GET | `/api/albums/:id/stats` | Estadísticas |
| POST | `/api/albums` | Crear álbum |
| PUT | `/api/albums/:id` | Actualizar álbum |
| DELETE | `/api/albums/:id` | Eliminar álbum |

### AnnotationsController — 11 endpoints
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/annotations/song/:song_id` | Anotaciones de canción |
| GET | `/api/annotations/:id` | Obtener anotación |
| GET | `/api/annotations/user/:username` | Anotaciones de usuario |
| GET | `/api/annotations/verified` | Anotaciones verificadas |
| GET | `/api/annotations/:id/stats` | Estadísticas |
| POST | `/api/annotations` | Crear anotación |
| PUT | `/api/annotations/:id` | Actualizar anotación |
| DELETE | `/api/annotations/:id` | Eliminar anotación |
| POST | `/api/annotations/:id/vote` | Votar anotación |
| PATCH | `/api/annotations/:id/verify` | Verificar anotación |
| POST | `/api/annotations/search/:query` | Buscar anotaciones |

### ArtistsController — 10 endpoints
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/artists` | Listar artistas |
| GET | `/api/artists/:id` | Obtener artista |
| GET | `/api/artists/:id/stats` | Estadísticas |
| GET | `/api/artists/:id/songs` | Canciones del artista |
| GET | `/api/artists/:id/albums` | Álbumes del artista |
| POST | `/api/artists` | Crear artista |
| PUT | `/api/artists/:id` | Actualizar artista |
| DELETE | `/api/artists/:id` | Eliminar artista |
| GET | `/api/artists/:id/similar` | Artistas similares |
| PATCH | `/api/artists/:id/verify` | Verificar artista |

### AuthController — 7 endpoints
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/auth/register` | Registrar usuario |
| POST | `/api/auth/login` | Iniciar sesión |
| GET | `/api/auth/me` | Usuario actual |
| POST | `/api/auth/refresh` | Refrescar token |
| POST | `/api/auth/logout` | Cerrar sesión |
| POST | `/api/auth/change-password` | Cambiar contraseña |
| POST | `/api/auth/verify-token` | Verificar token |

### SongsController — 10 endpoints
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/songs` | Listar canciones |
| GET | `/api/songs/:id` | Obtener canción |
| GET | `/api/songs/search/:query` | Buscar canciones |
| GET | `/api/songs/trending` | Canciones en tendencia |
| GET | `/api/songs/artist/:artist_id` | Canciones de artista |
| GET | `/api/songs/album/:album_id` | Canciones de álbum |
| GET | `/api/songs/:id/stats` | Estadísticas |
| POST | `/api/songs` | Crear canción |
| PUT | `/api/songs/:id` | Actualizar canción |
| DELETE | `/api/songs/:id` | Eliminar canción |

### SpotifyController — 2 endpoints
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/spotify/search` | Buscar track en Spotify |
| GET | `/api/spotify/track/:trackId` | Obtener track por ID |

### UsersController — 5 endpoints
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/users/profile` | Perfil propio |
| PUT | `/api/users/profile` | Actualizar perfil |
| GET | `/api/users/:username` | Perfil público |
| GET | `/api/users/:username/stats` | Estadísticas de usuario |
| GET | `/api/users/:username/annotations` | Anotaciones del usuario |

### TestController — 3 endpoints
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/health` | Health check |
| GET | `/test/auth` | Prueba de autenticación |
| GET | `/test/mysql` | Prueba de base de datos |

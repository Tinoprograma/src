# AlbumsController

> Controlador para la gestión de álbumes musicales. Provee operaciones CRUD completas, consulta de canciones por álbum y estadísticas.

## Información general

- **Archivo:** `src/controllers/albums.controller.js`
- **Prefijo de rutas:** `/api/albums`
- **Autenticación:** Opcional para lectura, requerida para escritura

---

## Endpoints

### `GET /api/albums` — Listar álbumes

**Descripción:** Retorna una lista paginada de álbumes con soporte para filtros y ordenamiento.

**Autenticación:** No requerida

**Parámetros de query:**
| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `page` | int | No | Número de página (default: 1) |
| `limit` | int | No | Álbumes por página (default: 20) |
| `search` | string | No | Búsqueda por título |
| `artist_id` | int | No | Filtrar por artista |
| `release_year` | int | No | Filtrar por año de lanzamiento |
| `sort` | string | No | Orden: `recent` (default) |

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "albums": [
    {
      "id": 1,
      "title": "Mi Sangre",
      "artist_id": 3,
      "release_year": 2004,
      "description": "...",
      "cover_image_url": "https://...",
      "created_by": 5
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

---

### `GET /api/albums/:id` — Obtener álbum por ID

**Descripción:** Retorna los detalles completos de un álbum específico.

**Autenticación:** No requerida

**Parámetros de ruta:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `id` | int | ID del álbum |

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "album": {
    "id": 1,
    "title": "Mi Sangre",
    "artist_id": 3,
    "release_year": 2004,
    "description": "...",
    "cover_image_url": "https://...",
    "created_by": 5
  }
}
```

**Errores posibles:**
| Código | Descripción |
|--------|-------------|
| 404 | Álbum no encontrado |

---

### `GET /api/albums/artist/:artist_id` — Álbumes de un artista

**Descripción:** Retorna todos los álbumes que pertenecen a un artista específico.

**Autenticación:** No requerida

**Parámetros de ruta:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `artist_id` | int | ID del artista |

**Parámetros de query:**
| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `page` | int | No | Número de página (default: 1) |
| `limit` | int | No | Álbumes por página (default: 20) |

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "albums": [ { ... } ],
  "pagination": { ... }
}
```

---

### `GET /api/albums/:id/songs` — Canciones de un álbum

**Descripción:** Retorna la lista de canciones que pertenecen a un álbum.

**Autenticación:** No requerida

**Parámetros de ruta:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `id` | int | ID del álbum |

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "songs": [
    {
      "id": 10,
      "title": "Te Mando Flores",
      "track_number": 1,
      "lyrics": "..."
    }
  ]
}
```

**Errores posibles:**
| Código | Descripción |
|--------|-------------|
| 404 | Álbum no encontrado |

---

### `GET /api/albums/:id/stats` — Estadísticas del álbum

**Descripción:** Retorna estadísticas del álbum (cantidad de canciones, anotaciones, vistas, etc.).

**Autenticación:** No requerida

**Parámetros de ruta:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `id` | int | ID del álbum |

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "stats": {
    "songs_count": 12,
    "annotations_count": 45,
    "total_views": 3200
  }
}
```

**Errores posibles:**
| Código | Descripción |
|--------|-------------|
| 404 | Álbum no encontrado |

---

### `POST /api/albums` — Crear álbum

**Descripción:** Crea un nuevo álbum. El usuario autenticado queda registrado como creador.

**Autenticación:** Requerida

**Body (JSON):**
| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `title` | string | Sí | Título del álbum (máx. 255 caracteres) |
| `artist_id` | int | Sí | ID del artista asociado |
| `release_year` | int | No | Año de lanzamiento |
| `description` | string | No | Descripción del álbum |
| `cover_image_url` | string | No | URL de la imagen de portada |

**Respuesta exitosa (201):**
```json
{
  "success": true,
  "message": "Álbum creado exitosamente",
  "album": { ... }
}
```

**Errores posibles:**
| Código | Descripción |
|--------|-------------|
| 400 | Título vacío o excede 255 caracteres |
| 400 | Artista no especificado |
| 404 | El artista indicado no existe |

---

### `PUT /api/albums/:id` — Actualizar álbum

**Descripción:** Actualiza los datos de un álbum. Solo el creador o un administrador pueden modificarlo.

**Autenticación:** Requerida (creador o admin)

**Parámetros de ruta:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `id` | int | ID del álbum |

**Body (JSON):**
| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `title` | string | No | Nuevo título del álbum |
| `release_year` | int | No | Año de lanzamiento |
| `description` | string | No | Descripción |
| `cover_image_url` | string | No | URL de la imagen de portada |

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Álbum actualizado exitosamente",
  "album": { ... }
}
```

**Errores posibles:**
| Código | Descripción |
|--------|-------------|
| 403 | Sin permisos para editar |
| 404 | Álbum no encontrado |

---

### `DELETE /api/albums/:id` — Eliminar álbum

**Descripción:** Elimina un álbum. Solo el creador o un administrador pueden eliminarlo.

**Autenticación:** Requerida (creador o admin)

**Parámetros de ruta:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `id` | int | ID del álbum |

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Álbum eliminado exitosamente"
}
```

**Errores posibles:**
| Código | Descripción |
|--------|-------------|
| 403 | Sin permisos para eliminar |
| 404 | Álbum no encontrado |

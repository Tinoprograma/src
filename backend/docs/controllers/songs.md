# SongsController

> Controlador para la gestión de canciones y sus letras. Incluye búsqueda de texto completo, canciones en tendencia, filtros por artista y álbum, y tracking de vistas.

## Información general

- **Archivo:** `src/controllers/songs.controller.js`
- **Prefijo de rutas:** `/api/songs`
- **Autenticación:** Opcional para lectura, requerida para escritura

---

## Endpoints

### `GET /api/songs` — Listar canciones

**Descripción:** Retorna una lista paginada de canciones con soporte para filtros y ordenamiento.

**Autenticación:** No requerida

**Parámetros de query:**
| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `page` | int | No | Número de página (default: 1) |
| `limit` | int | No | Canciones por página (default: 20) |
| `search` | string | No | Búsqueda por título |
| `artist_id` | int | No | Filtrar por artista |
| `album_id` | int | No | Filtrar por álbum |
| `is_single` | boolean | No | Filtrar singles (`true`) o canciones de álbum (`false`) |
| `sort` | string | No | Orden: `recent` (default) |

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "songs": [
    {
      "id": 1,
      "title": "La Camisa Negra",
      "artist_id": 1,
      "album_id": 2,
      "track_number": 3,
      "is_single": false,
      "release_year": 2005,
      "cover_image_url": "https://...",
      "views": 15000,
      "annotations_count": 8,
      "created_by": 4
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 500,
    "pages": 25
  }
}
```

---

### `GET /api/songs/:id` — Obtener canción por ID

**Descripción:** Retorna los detalles completos de una canción, incluyendo sus letras. **Incrementa automáticamente el contador de vistas** (`view_count`) en cada consulta.

**Autenticación:** No requerida

**Parámetros de ruta:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `id` | int | ID de la canción |

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "song": {
    "id": 1,
    "title": "La Camisa Negra",
    "lyrics": "Tengo la camisa negra...",
    "artist_id": 1,
    "album_id": 2,
    "track_number": 3,
    "is_single": false,
    "release_year": 2005,
    "views": 15001,
    "annotations_count": 8
  }
}
```

**Errores posibles:**
| Código | Descripción |
|--------|-------------|
| 404 | Canción no encontrada |

---

### `GET /api/songs/search/:query` — Buscar canciones

**Descripción:** Realiza una búsqueda de texto completo sobre títulos y letras de canciones.

**Autenticación:** No requerida

**Parámetros de ruta:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `query` | string | Término de búsqueda (mínimo 2 caracteres) |

**Parámetros de query:**
| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `page` | int | No | Número de página (default: 1) |
| `limit` | int | No | Resultados por página (default: 20) |

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "songs": [ { ... } ],
  "pagination": { ... }
}
```

**Errores posibles:**
| Código | Descripción |
|--------|-------------|
| 400 | Búsqueda con menos de 2 caracteres |

---

### `GET /api/songs/trending` — Canciones en tendencia

**Descripción:** Retorna las canciones más vistas, ordenadas por número de vistas descendente.

**Autenticación:** No requerida

**Parámetros de query:**
| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `limit` | int | No | Número de canciones a retornar (default: 10) |

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "songs": [
    {
      "id": 5,
      "title": "Es Por Ti",
      "views": 42000,
      "artist_id": 1
    }
  ]
}
```

---

### `GET /api/songs/artist/:artist_id` — Canciones de un artista

**Descripción:** Retorna la lista paginada de canciones de un artista específico.

**Autenticación:** No requerida

**Parámetros de ruta:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `artist_id` | int | ID del artista |

**Parámetros de query:**
| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `page` | int | No | Número de página (default: 1) |
| `limit` | int | No | Canciones por página (default: 20) |

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "songs": [ { ... } ],
  "pagination": { ... }
}
```

---

### `GET /api/songs/album/:album_id` — Canciones de un álbum

**Descripción:** Retorna todas las canciones que pertenecen a un álbum, generalmente ordenadas por número de track.

**Autenticación:** No requerida

**Parámetros de ruta:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `album_id` | int | ID del álbum |

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "songs": [
    { "id": 10, "title": "Track 1", "track_number": 1 },
    { "id": 11, "title": "Track 2", "track_number": 2 }
  ]
}
```

---

### `GET /api/songs/:id/stats` — Estadísticas de la canción

**Descripción:** Retorna estadísticas de la canción (vistas, cantidad de anotaciones, etc.).

**Autenticación:** No requerida

**Parámetros de ruta:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `id` | int | ID de la canción |

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "stats": {
    "views": 15000,
    "annotations_count": 8
  }
}
```

**Errores posibles:**
| Código | Descripción |
|--------|-------------|
| 404 | Canción no encontrada |

---

### `POST /api/songs` — Crear canción

**Descripción:** Crea una nueva canción con sus letras. Si no es un single, debe especificarse el álbum y el número de track.

**Autenticación:** Requerida

**Body (JSON):**
| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `title` | string | Sí | Título de la canción |
| `artist_id` | int | Sí | ID del artista |
| `lyrics` | string | Sí | Letra de la canción |
| `is_single` | boolean | No | `true` si es un single (default: `false`) |
| `album_id` | int | Condicional | Requerido si `is_single` es `false` |
| `track_number` | int | Condicional | Requerido si tiene álbum |
| `release_year` | int | No | Año de lanzamiento |
| `cover_image_url` | string | No | URL de la imagen de portada |

**Respuesta exitosa (201):**
```json
{
  "success": true,
  "message": "Canción creada exitosamente",
  "song": { ... }
}
```

**Errores posibles:**
| Código | Descripción |
|--------|-------------|
| 400 | Título vacío |
| 400 | Artista no especificado |
| 400 | Letras vacías |
| 400 | No es single pero no tiene álbum |
| 400 | Tiene álbum pero no tiene número de track |
| 404 | El artista no existe |
| 404 | El álbum no existe |

---

### `PUT /api/songs/:id` — Actualizar canción

**Descripción:** Actualiza los datos de una canción. Solo el creador o un administrador pueden editarla.

**Autenticación:** Requerida (creador o admin)

**Parámetros de ruta:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `id` | int | ID de la canción |

**Body (JSON):**
| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `title` | string | No | Nuevo título |
| `lyrics` | string | No | Nuevas letras |
| `album_id` | int | No | Nuevo álbum (o `null` para desvincularlo) |
| `track_number` | int | No | Número de track |
| `is_single` | boolean | No | Marcar como single |
| `release_year` | int | No | Año de lanzamiento |
| `cover_image_url` | string | No | URL de portada |

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Canción actualizada exitosamente",
  "song": { ... }
}
```

**Errores posibles:**
| Código | Descripción |
|--------|-------------|
| 403 | Sin permisos para editar |
| 404 | Canción no encontrada |

---

### `DELETE /api/songs/:id` — Eliminar canción

**Descripción:** Elimina una canción. Solo el creador o un administrador pueden eliminarla.

**Autenticación:** Requerida (creador o admin)

**Parámetros de ruta:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `id` | int | ID de la canción |

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Canción eliminada exitosamente"
}
```

**Errores posibles:**
| Código | Descripción |
|--------|-------------|
| 403 | Sin permisos para eliminar |
| 404 | Canción no encontrada |

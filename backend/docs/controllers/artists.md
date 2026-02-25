# ArtistsController

> Controlador para la gestión de perfiles de artistas. Soporta creación, edición, eliminación, descubrimiento de artistas similares y verificación oficial de perfiles.

## Información general

- **Archivo:** `src/controllers/artists.controller.js`
- **Prefijo de rutas:** `/api/artists`
- **Autenticación:** Opcional para lectura, requerida para escritura

---

## Endpoints

### `GET /api/artists` — Listar artistas

**Descripción:** Retorna una lista paginada de artistas con soporte para filtros.

**Autenticación:** No requerida

**Parámetros de query:**
| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `page` | int | No | Número de página (default: 1) |
| `limit` | int | No | Artistas por página (default: 100) |
| `search` | string | No | Búsqueda por nombre |
| `country_code` | string | No | Filtrar por código de país (ej. `MX`, `CO`) |
| `verified` | boolean | No | Filtrar por verificación (`true`/`false`) |

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "artists": [
    {
      "id": 1,
      "name": "Juanes",
      "slug": "juanes",
      "country_code": "CO",
      "bio": "...",
      "is_verified": true,
      "user_id": 3
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 100,
    "total": 250,
    "pages": 3
  }
}
```

---

### `GET /api/artists/:id` — Obtener artista por ID

**Descripción:** Retorna el perfil completo de un artista, incluyendo información adicional enriquecida.

**Autenticación:** No requerida

**Parámetros de ruta:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `id` | int | ID del artista |

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "artist": {
    "id": 1,
    "name": "Juanes",
    "slug": "juanes",
    "country_code": "CO",
    "bio": "...",
    "is_verified": true
  }
}
```

**Errores posibles:**
| Código | Descripción |
|--------|-------------|
| 404 | Artista no encontrado |

---

### `GET /api/artists/:id/stats` — Estadísticas del artista

**Descripción:** Retorna estadísticas del artista (número de canciones, álbumes, anotaciones, etc.).

**Autenticación:** No requerida

**Parámetros de ruta:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `id` | int | ID del artista |

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "stats": {
    "songs_count": 42,
    "albums_count": 6,
    "annotations_count": 180
  }
}
```

**Errores posibles:**
| Código | Descripción |
|--------|-------------|
| 404 | Artista no encontrado |

---

### `GET /api/artists/:id/songs` — Canciones del artista

**Descripción:** Retorna la lista paginada de canciones del artista.

**Autenticación:** No requerida

**Parámetros de ruta:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `id` | int | ID del artista |

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

**Errores posibles:**
| Código | Descripción |
|--------|-------------|
| 404 | Artista no encontrado (solo si la página 1 no tiene resultados) |

---

### `GET /api/artists/:id/albums` — Álbumes del artista

**Descripción:** Retorna todos los álbumes del artista.

**Autenticación:** No requerida

**Parámetros de ruta:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `id` | int | ID del artista |

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "albums": [ { ... } ]
}
```

**Errores posibles:**
| Código | Descripción |
|--------|-------------|
| 404 | Artista no encontrado |

---

### `POST /api/artists` — Crear artista

**Descripción:** Crea un nuevo perfil de artista. Se genera automáticamente un `slug` a partir del nombre. Se verifica que no exista un artista con el mismo nombre.

**Autenticación:** Requerida

**Body (JSON):**
| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `name` | string | Sí | Nombre del artista (máx. 255 caracteres) |
| `country_code` | string | No | Código de país (ej. `MX`, `CO`, `AR`) |
| `bio` | string | No | Biografía del artista |

**Respuesta exitosa (201):**
```json
{
  "success": true,
  "message": "Artista creado exitosamente",
  "artist": {
    "id": 10,
    "name": "Fonseca",
    "slug": "fonseca",
    "country_code": "CO",
    "bio": "...",
    "is_verified": false
  }
}
```

**Errores posibles:**
| Código | Descripción |
|--------|-------------|
| 400 | Nombre vacío o mayor a 255 caracteres |
| 401 | Usuario no autenticado |
| 409 | Ya existe un artista con ese nombre |

---

### `PUT /api/artists/:id` — Actualizar artista

**Descripción:** Actualiza los datos de un artista. Solo el creador o un administrador pueden editarlo. Si se cambia el nombre, se regenera el slug y se verifica que no haya duplicados.

**Autenticación:** Requerida (creador o admin)

**Parámetros de ruta:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `id` | int | ID del artista |

**Body (JSON):**
| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `name` | string | No | Nuevo nombre del artista |
| `country_code` | string | No | Código de país |
| `bio` | string | No | Biografía actualizada |

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Artista actualizado exitosamente",
  "artist": { ... }
}
```

**Errores posibles:**
| Código | Descripción |
|--------|-------------|
| 401 | Usuario no autenticado |
| 403 | Sin permisos para editar |
| 404 | Artista no encontrado |
| 409 | Ya existe un artista con ese nombre |

---

### `DELETE /api/artists/:id` — Eliminar artista

**Descripción:** Elimina un artista. Solo el creador o un administrador pueden eliminarlo. No se puede eliminar si tiene canciones asociadas.

**Autenticación:** Requerida (creador o admin)

**Parámetros de ruta:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `id` | int | ID del artista |

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Artista eliminado exitosamente"
}
```

**Errores posibles:**
| Código | Descripción |
|--------|-------------|
| 400 | El artista tiene canciones asociadas (incluye `songs_count`) |
| 401 | Usuario no autenticado |
| 403 | Sin permisos para eliminar |
| 404 | Artista no encontrado |

---

### `GET /api/artists/:id/similar` — Artistas similares

**Descripción:** Retorna una lista de hasta 5 artistas similares al indicado.

**Autenticación:** No requerida

**Parámetros de ruta:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `id` | int | ID del artista |

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "similar": [
    { "id": 3, "name": "Carlos Vives", "country_code": "CO" },
    { "id": 7, "name": "Silvestre Dangond", "country_code": "CO" }
  ]
}
```

**Errores posibles:**
| Código | Descripción |
|--------|-------------|
| 404 | Artista no encontrado |

---

### `PATCH /api/artists/:id/verify` — Verificar artista

**Descripción:** Cambia el estado de verificación oficial de un artista. Solo administradores pueden usar este endpoint.

**Autenticación:** Requerida (solo admin)

**Parámetros de ruta:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `id` | int | ID del artista |

**Body (JSON):**
| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `verified` | boolean | Sí | `true` para verificar, `false` para deverificar |

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Artista verificado",
  "artist": { ... }
}
```

**Errores posibles:**
| Código | Descripción |
|--------|-------------|
| 403 | Solo administradores pueden verificar artistas |
| 404 | Artista no encontrado |

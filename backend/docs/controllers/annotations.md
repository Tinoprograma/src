# AnnotationsController

> Controlador para la gestión de anotaciones musicales. Las anotaciones son explicaciones contextuales vinculadas a fragmentos de letras de canciones. Incluye sistema de votación y verificación por moderadores.

## Información general

- **Archivo:** `src/controllers/annotations.controller.js`
- **Prefijo de rutas:** `/api/annotations`
- **Autenticación:** Opcional para lectura, requerida para escritura

---

## Endpoints

### `GET /api/annotations/song/:song_id` — Anotaciones de una canción

**Descripción:** Retorna la lista paginada de anotaciones pertenecientes a una canción.

**Autenticación:** No requerida

**Parámetros de ruta:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `song_id` | int | ID de la canción |

**Parámetros de query:**
| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `page` | int | No | Número de página (default: 1) |
| `limit` | int | No | Anotaciones por página (default: 20) |
| `sort` | string | No | Orden: `votes` (default) |

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "annotations": [
    {
      "id": 1,
      "song_id": 5,
      "user_id": 2,
      "text_selection": "te mando flores",
      "start_char": 10,
      "end_char": 25,
      "explanation": "Esta frase hace referencia a...",
      "cultural_context": "En la cultura colombiana...",
      "is_verified": true,
      "votes_up": 12,
      "votes_down": 1
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 8,
    "pages": 1
  }
}
```

---

### `GET /api/annotations/:id` — Obtener anotación por ID

**Descripción:** Retorna el detalle completo de una anotación específica.

**Autenticación:** No requerida

**Parámetros de ruta:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `id` | int | ID de la anotación |

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "annotation": { ... }
}
```

**Errores posibles:**
| Código | Descripción |
|--------|-------------|
| 404 | Anotación no encontrada |

---

### `GET /api/annotations/user/:username` — Anotaciones de un usuario

**Descripción:** Retorna la lista paginada de anotaciones creadas por un usuario.

**Autenticación:** No requerida

**Parámetros de ruta:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `username` | string | Nombre de usuario |

**Parámetros de query:**
| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `page` | int | No | Número de página (default: 1) |
| `limit` | int | No | Anotaciones por página (default: 20) |

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "annotations": [ { ... } ],
  "pagination": { ... }
}
```

---

### `GET /api/annotations/verified` — Anotaciones verificadas

**Descripción:** Retorna la lista paginada de todas las anotaciones verificadas por moderadores.

**Autenticación:** No requerida

**Parámetros de query:**
| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `page` | int | No | Número de página (default: 1) |
| `limit` | int | No | Anotaciones por página (default: 20) |

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "annotations": [ { ... } ],
  "pagination": { ... }
}
```

---

### `GET /api/annotations/:id/stats` — Estadísticas de una anotación

**Descripción:** Retorna las estadísticas de votación y actividad de una anotación.

**Autenticación:** No requerida

**Parámetros de ruta:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `id` | int | ID de la anotación |

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "stats": {
    "votes_up": 12,
    "votes_down": 1,
    "is_verified": true
  }
}
```

**Errores posibles:**
| Código | Descripción |
|--------|-------------|
| 404 | Anotación no encontrada |

---

### `POST /api/annotations` — Crear anotación

**Descripción:** Crea una nueva anotación vinculada a un fragmento de la letra de una canción. Al crearse, incrementa el contador de anotaciones de la canción.

**Autenticación:** Requerida

**Body (JSON):**
| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `song_id` | int | Sí | ID de la canción anotada |
| `text_selection` | string | Sí | Fragmento de letra seleccionado (máx. 500 caracteres) |
| `start_char` | int | Sí | Posición de inicio del fragmento en la letra (≥ 0) |
| `end_char` | int | Sí | Posición de fin del fragmento en la letra (> 0 y > `start_char`) |
| `explanation` | string | Sí | Explicación de la anotación (mínimo 10 caracteres) |
| `cultural_context` | string | No | Contexto cultural adicional |

**Respuesta exitosa (201):**
```json
{
  "success": true,
  "message": "Anotación creada exitosamente",
  "annotation": { ... }
}
```

**Errores posibles:**
| Código | Descripción |
|--------|-------------|
| 400 | ID de canción faltante |
| 400 | Texto seleccionado faltante o mayor a 500 caracteres |
| 400 | Posiciones de caracteres inválidas |
| 400 | Explicación con menos de 10 caracteres |
| 404 | La canción no existe |

---

### `PUT /api/annotations/:id` — Actualizar anotación

**Descripción:** Actualiza la explicación y/o contexto cultural de una anotación. Solo el autor puede editarla.

**Autenticación:** Requerida (solo el autor)

**Parámetros de ruta:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `id` | int | ID de la anotación |

**Body (JSON):**
| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `explanation` | string | No | Nueva explicación |
| `cultural_context` | string | No | Nuevo contexto cultural |

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Anotación actualizada exitosamente",
  "annotation": { ... }
}
```

**Errores posibles:**
| Código | Descripción |
|--------|-------------|
| 403 | Sin permisos para editar |
| 404 | Anotación no encontrada |

---

### `DELETE /api/annotations/:id` — Eliminar anotación

**Descripción:** Elimina una anotación. Solo el autor puede eliminarla. Al eliminarse, decrementa el contador de anotaciones de la canción.

**Autenticación:** Requerida (solo el autor)

**Parámetros de ruta:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `id` | int | ID de la anotación |

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Anotación eliminada exitosamente"
}
```

**Errores posibles:**
| Código | Descripción |
|--------|-------------|
| 403 | Sin permisos para eliminar |
| 404 | Anotación no encontrada |

---

### `POST /api/annotations/:id/vote` — Votar una anotación

**Descripción:** Registra el voto de un usuario sobre la utilidad de una anotación (positivo o negativo).

**Autenticación:** Requerida

**Parámetros de ruta:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `id` | int | ID de la anotación |

**Body (JSON):**
| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `vote_type` | string | Sí | Tipo de voto: `"up"` o `"down"` |

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Voto registrado exitosamente",
  "annotation": { ... }
}
```

**Errores posibles:**
| Código | Descripción |
|--------|-------------|
| 400 | Tipo de voto inválido (debe ser `"up"` o `"down"`) |
| 400 | Voto inválido (ej. voto duplicado según lógica del repositorio) |
| 404 | Anotación no encontrada |

---

### `PATCH /api/annotations/:id/verify` — Verificar anotación

**Descripción:** Cambia el estado de verificación de una anotación. Solo admins o moderadores pueden verificar.

**Autenticación:** Requerida (admin/moderator)

**Parámetros de ruta:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `id` | int | ID de la anotación |

**Body (JSON):**
| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `verified` | boolean | Sí | `true` para verificar, `false` para deverificar |

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Anotación verificada",
  "annotation": { ... }
}
```

**Errores posibles:**
| Código | Descripción |
|--------|-------------|
| 404 | Anotación no encontrada |

---

### `POST /api/annotations/search/:query` — Buscar anotaciones

**Descripción:** Realiza una búsqueda de texto completo sobre las anotaciones existentes.

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
  "annotations": [ { ... } ],
  "pagination": { ... }
}
```

**Errores posibles:**
| Código | Descripción |
|--------|-------------|
| 400 | Búsqueda con menos de 2 caracteres |

# UsersController

> Controlador para la gestión de perfiles de usuario. Diferencia entre endpoints privados (perfil propio) y endpoints públicos (perfil por username). Incluye estadísticas y lista de anotaciones por usuario.

## Información general

- **Archivo:** `src/controllers/users.controller.js`
- **Prefijo de rutas:** `/api/users`
- **Autenticación:** Requerida para endpoints de perfil propio, no requerida para perfiles públicos

---

## Endpoints

### `GET /api/users/profile` — Obtener perfil propio

**Descripción:** Retorna el perfil completo del usuario autenticado, incluyendo información privada como el email.

**Autenticación:** Requerida

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "user": {
    "id": 10,
    "email": "usuario@ejemplo.com",
    "username": "miusuario",
    "display_name": "Mi Usuario",
    "country_code": "MX",
    "region": "CDMX",
    "role": "user",
    "created_at": "2024-01-10T08:00:00Z"
  }
}
```

**Errores posibles:**
| Código | Descripción |
|--------|-------------|
| 401 | Token inválido o expirado |
| 404 | Usuario no encontrado |

---

### `PUT /api/users/profile` — Actualizar perfil propio

**Descripción:** Permite al usuario autenticado actualizar su nombre visible, país y región.

**Autenticación:** Requerida

**Body (JSON):**
| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `display_name` | string | No | Nombre visible en la plataforma |
| `country_code` | string | No | Código de país (ej. `MX`, `CO`, `AR`) |
| `region` | string | No | Región o ciudad del usuario |

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Perfil actualizado exitosamente",
  "user": {
    "id": 10,
    "username": "miusuario",
    "display_name": "Nuevo Nombre",
    "country_code": "CO",
    "region": "Bogotá"
  }
}
```

**Errores posibles:**
| Código | Descripción |
|--------|-------------|
| 401 | Token inválido o expirado |
| 404 | Usuario no encontrado |

---

### `GET /api/users/:username` — Perfil público por username

**Descripción:** Retorna el perfil público de un usuario identificado por su username. No expone información privada como el email.

**Autenticación:** No requerida

**Parámetros de ruta:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `username` | string | Nombre de usuario |

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "user": {
    "id": 10,
    "username": "miusuario",
    "display_name": "Mi Usuario",
    "country_code": "MX",
    "created_at": "2024-01-10T08:00:00Z"
  }
}
```

**Errores posibles:**
| Código | Descripción |
|--------|-------------|
| 404 | Usuario no encontrado |

---

### `GET /api/users/:username/stats` — Estadísticas de usuario

**Descripción:** Retorna estadísticas de actividad del usuario (número de anotaciones, contribuciones, etc.).

**Autenticación:** No requerida

**Parámetros de ruta:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `username` | string | Nombre de usuario |

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "stats": {
    "annotations_count": 42,
    "verified_annotations": 15,
    "total_votes_received": 230
  }
}
```

**Errores posibles:**
| Código | Descripción |
|--------|-------------|
| 404 | Usuario no encontrado |

---

### `GET /api/users/:username/annotations` — Anotaciones del usuario

**Descripción:** Retorna la lista paginada de anotaciones creadas por el usuario.

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
  "annotations": [
    {
      "id": 5,
      "song_id": 10,
      "text_selection": "te mando flores",
      "explanation": "Esta frase hace referencia a...",
      "is_verified": true,
      "votes_up": 8
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 42,
    "pages": 3
  }
}
```

**Errores posibles:**
| Código | Descripción |
|--------|-------------|
| 404 | Usuario no encontrado |

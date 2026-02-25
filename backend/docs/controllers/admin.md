# AdminController

> Controlador para operaciones del panel de administración. Permite a los administradores gestionar usuarios, canciones, artistas, álbumes y anotaciones. Todos los cambios quedan registrados en el log de auditoría.

## Información general

- **Archivo:** `src/controllers/admin.controller.js`
- **Prefijo de rutas:** `/api/admin`
- **Autenticación:** Requerida (rol `admin` o `moderator`)
- **Auditoría:** Todas las operaciones generan un registro en `audit_logs`

---

## Endpoints

### `PATCH /api/admin/annotations/:annotationId` — Verificar anotación

**Descripción:** Cambia el estado de verificación de una anotación (verificada / no verificada).

**Autenticación:** Requerida (admin/moderator)

**Parámetros de ruta:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `annotationId` | int | ID de la anotación |

**Body (JSON):**
| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `verified` | boolean | Sí | `true` para verificar, `false` para deverificar |

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Anotación actualizada",
  "annotation": { ... }
}
```

**Errores posibles:**
| Código | Descripción |
|--------|-------------|
| 404 | Anotación no encontrada |

---

### `DELETE /api/admin/annotations/:annotationId` — Eliminar anotación

**Descripción:** Elimina una anotación de forma administrativa, registrando el motivo en el audit log. Decrementa el contador de anotaciones de la canción asociada.

**Autenticación:** Requerida (admin/moderator)

**Parámetros de ruta:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `annotationId` | int | ID de la anotación |

**Body (JSON):**
| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `reason` | string | No | Motivo de la eliminación (default: "Sin especificar") |

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Anotación eliminada"
}
```

**Errores posibles:**
| Código | Descripción |
|--------|-------------|
| 404 | Anotación no encontrada |

---

### `PUT /api/admin/songs/:songId` — Actualizar letras de canción

**Descripción:** Permite al administrador corregir las letras de una canción. El cambio queda registrado en auditoría con antes/después.

**Autenticación:** Requerida (admin)

**Parámetros de ruta:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `songId` | int | ID de la canción |

**Body (JSON):**
| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `lyrics` | string | Sí | Nuevas letras de la canción |
| `reason` | string | No | Motivo de la corrección (default: "Corrección") |

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Letras actualizadas",
  "song": { ... }
}
```

**Errores posibles:**
| Código | Descripción |
|--------|-------------|
| 404 | Canción no encontrada |

---

### `DELETE /api/admin/songs/:songId` — Eliminar canción

**Descripción:** Elimina una canción de forma administrativa.

**Autenticación:** Requerida (admin)

**Parámetros de ruta:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `songId` | int | ID de la canción |

**Body (JSON):**
| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `reason` | string | No | Motivo de la eliminación |

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Canción eliminada"
}
```

**Errores posibles:**
| Código | Descripción |
|--------|-------------|
| 404 | Canción no encontrada |

---

### `PUT /api/admin/artists/:artistId` — Actualizar artista

**Descripción:** Permite al administrador editar los datos de un artista.

**Autenticación:** Requerida (admin)

**Parámetros de ruta:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `artistId` | int | ID del artista |

**Body (JSON):**
| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `name` | string | No | Nombre del artista |
| `country_code` | string | No | Código de país (ej. `MX`, `CO`) |
| `bio` | string | No | Biografía del artista |
| `reason` | string | No | Motivo del cambio (default: "Corrección") |

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Artista actualizado",
  "artist": { ... }
}
```

**Errores posibles:**
| Código | Descripción |
|--------|-------------|
| 404 | Artista no encontrado |

---

### `DELETE /api/admin/artists/:artistId` — Eliminar artista

**Descripción:** Elimina un artista de forma administrativa.

**Autenticación:** Requerida (admin)

**Parámetros de ruta:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `artistId` | int | ID del artista |

**Body (JSON):**
| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `reason` | string | No | Motivo de la eliminación |

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Artista eliminado"
}
```

**Errores posibles:**
| Código | Descripción |
|--------|-------------|
| 404 | Artista no encontrado |

---

### `PUT /api/admin/albums/:albumId` — Actualizar álbum

**Descripción:** Permite al administrador editar los metadatos de un álbum.

**Autenticación:** Requerida (admin)

**Parámetros de ruta:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `albumId` | int | ID del álbum |

**Body (JSON):**
| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `title` | string | No | Título del álbum |
| `release_year` | int | No | Año de lanzamiento |
| `description` | string | No | Descripción del álbum |
| `reason` | string | No | Motivo del cambio (default: "Corrección") |

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Álbum actualizado",
  "album": { ... }
}
```

**Errores posibles:**
| Código | Descripción |
|--------|-------------|
| 404 | Álbum no encontrado |

---

### `DELETE /api/admin/albums/:albumId` — Eliminar álbum

**Descripción:** Elimina un álbum de forma administrativa.

**Autenticación:** Requerida (admin)

**Parámetros de ruta:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `albumId` | int | ID del álbum |

**Body (JSON):**
| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `reason` | string | No | Motivo de la eliminación |

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Álbum eliminado"
}
```

**Errores posibles:**
| Código | Descripción |
|--------|-------------|
| 404 | Álbum no encontrado |

---

### `GET /api/admin/audit-logs` — Obtener logs de auditoría

**Descripción:** Retorna el historial paginado de todas las acciones administrativas realizadas.

**Autenticación:** Requerida (admin)

**Parámetros de query:**
| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `page` | int | No | Número de página (default: 1) |
| `limit` | int | No | Registros por página (default: 50) |

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "logs": [
    {
      "id": 1,
      "admin_id": 2,
      "username": "admin_user",
      "action": "Artista actualizado",
      "entity_type": "artist",
      "entity_id": 5,
      "before": { "name": "Nombre anterior" },
      "after": { "name": "Nombre nuevo" },
      "comment": "Corrección ortográfica",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 120,
    "pages": 3
  }
}
```

---

### `GET /api/admin/users` — Listar todos los usuarios

**Descripción:** Retorna la lista paginada de todos los usuarios del sistema, con filtro opcional por rol.

**Autenticación:** Requerida (admin)

**Parámetros de query:**
| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `page` | int | No | Número de página (default: 1) |
| `limit` | int | No | Usuarios por página (default: 50) |
| `role` | string | No | Filtrar por rol: `admin`, `moderator`, `user` |

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "users": [ { ... } ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 200,
    "pages": 4
  }
}
```

---

### `PUT /api/admin/users/:userId` — Cambiar rol de usuario

**Descripción:** Modifica el rol de un usuario. El cambio queda registrado en auditoría.

**Autenticación:** Requerida (admin)

**Parámetros de ruta:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `userId` | int | ID del usuario |

**Body (JSON):**
| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `role` | string | Sí | Nuevo rol: `admin`, `moderator`, `user` |
| `reason` | string | No | Motivo del cambio |

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Rol actualizado",
  "user": { ... }
}
```

**Errores posibles:**
| Código | Descripción |
|--------|-------------|
| 404 | Usuario no encontrado |

---

### `DELETE /api/admin/users/:userId` — Eliminar usuario

**Descripción:** Elimina permanentemente una cuenta de usuario. No permite que un administrador se elimine a sí mismo.

**Autenticación:** Requerida (admin)

**Parámetros de ruta:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `userId` | int | ID del usuario a eliminar |

**Body (JSON):**
| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `reason` | string | No | Motivo de la eliminación |

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Usuario eliminado"
}
```

**Errores posibles:**
| Código | Descripción |
|--------|-------------|
| 400 | Intento de eliminarse a sí mismo |
| 404 | Usuario no encontrado |

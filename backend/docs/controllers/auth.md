# AuthController

> Controlador de autenticación y gestión de sesiones. Maneja el registro de usuarios, inicio de sesión, renovación de tokens JWT y cambio de contraseña.

## Información general

- **Archivo:** `src/controllers/auth.controller.js`
- **Prefijo de rutas:** `/api/auth`
- **Autenticación:** Varía por endpoint (ver cada uno)
- **Tecnología:** JWT con expiración de 24 horas, contraseñas hasheadas con bcryptjs (10 salt rounds)

---

## Endpoints

### `POST /api/auth/register` — Registrar usuario

**Descripción:** Crea una nueva cuenta de usuario. Verifica que el email y el username no estén ya registrados. Retorna el usuario creado y un token JWT listo para usar.

**Autenticación:** No requerida

**Body (JSON):**
| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `email` | string | Sí | Correo electrónico del usuario |
| `username` | string | Sí | Nombre de usuario (mínimo 3 caracteres) |
| `password` | string | Sí | Contraseña (mínimo 8 caracteres) |
| `display_name` | string | No | Nombre visible |
| `country_code` | string | No | Código de país (ej. `MX`, `CO`) |

**Respuesta exitosa (201):**
```json
{
  "success": true,
  "message": "Usuario registrado exitosamente",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 10,
    "email": "usuario@ejemplo.com",
    "username": "miusuario",
    "display_name": "Mi Usuario",
    "country_code": "MX",
    "role": "user"
  }
}
```

**Errores posibles:**
| Código | Descripción |
|--------|-------------|
| 400 | Email vacío |
| 400 | Username con menos de 3 caracteres |
| 400 | Contraseña con menos de 8 caracteres |
| 409 | El email ya está registrado |
| 409 | El username ya está registrado |

---

### `POST /api/auth/login` — Iniciar sesión

**Descripción:** Autentica al usuario con email y contraseña. Retorna un token JWT y los datos del usuario (sin contraseña).

**Autenticación:** No requerida

**Body (JSON):**
| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `email` | string | Sí | Correo electrónico |
| `password` | string | Sí | Contraseña |

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Login exitoso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 10,
    "email": "usuario@ejemplo.com",
    "username": "miusuario",
    "role": "user"
  }
}
```

**Errores posibles:**
| Código | Descripción |
|--------|-------------|
| 400 | Email o contraseña vacíos |
| 401 | Credenciales inválidas |

---

### `GET /api/auth/me` — Obtener usuario actual

**Descripción:** Retorna los datos del usuario autenticado según el token JWT del header.

**Autenticación:** Requerida

**Header:**
```
Authorization: Bearer <token>
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "user": {
    "id": 10,
    "email": "usuario@ejemplo.com",
    "username": "miusuario",
    "display_name": "Mi Usuario",
    "role": "user"
  }
}
```

**Errores posibles:**
| Código | Descripción |
|--------|-------------|
| 401 | Token inválido o expirado |
| 404 | Usuario no encontrado |

---

### `POST /api/auth/refresh` — Refrescar token

**Descripción:** Genera un nuevo token JWT con expiración de 24 horas para el usuario autenticado.

**Autenticación:** Requerida (token actual)

**Header:**
```
Authorization: Bearer <token>
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Token refrescado",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errores posibles:**
| Código | Descripción |
|--------|-------------|
| 401 | Token inválido o expirado |
| 404 | Usuario no encontrado |

---

### `POST /api/auth/logout` — Cerrar sesión

**Descripción:** Notifica el cierre de sesión al cliente. Como la autenticación es stateless (JWT), no invalida el token en el servidor. El cliente debe descartar el token localmente.

**Autenticación:** Requerida

**Header:**
```
Authorization: Bearer <token>
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Logout exitoso"
}
```

---

### `POST /api/auth/change-password` — Cambiar contraseña

**Descripción:** Permite al usuario autenticado cambiar su contraseña. Requiere verificar la contraseña actual y que la nueva sea diferente.

**Autenticación:** Requerida

**Body (JSON):**
| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `currentPassword` | string | Sí | Contraseña actual |
| `newPassword` | string | Sí | Nueva contraseña (mínimo 8 caracteres) |

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Contraseña cambiada exitosamente"
}
```

**Errores posibles:**
| Código | Descripción |
|--------|-------------|
| 400 | Contraseña actual no proporcionada |
| 400 | Nueva contraseña con menos de 8 caracteres |
| 400 | Nueva contraseña igual a la actual |
| 401 | Contraseña actual incorrecta |
| 404 | Usuario no encontrado |

---

### `POST /api/auth/verify-token` — Verificar token

**Descripción:** Valida si el token JWT actual es válido y retorna los datos del usuario asociado.

**Autenticación:** Requerida

**Header:**
```
Authorization: Bearer <token>
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Token válido",
  "user": {
    "id": 10,
    "username": "miusuario",
    "role": "user"
  }
}
```

**Errores posibles:**
| Código | Descripción |
|--------|-------------|
| 401 | Token inválido o expirado |
| 404 | Usuario no encontrado |

---

## Notas de seguridad

- Las contraseñas nunca se retornan en las respuestas de la API.
- El hash de contraseñas utiliza bcryptjs con 10 salt rounds.
- Los tokens JWT usan la variable de entorno `JWT_SECRET` (fallback: `'secret-key'`).
- La autenticación es **stateless**: el logout no invalida el token en el servidor.

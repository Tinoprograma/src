# TestController

> Controlador temporal con endpoints de health check y pruebas de conectividad. Usado para verificar el estado del servidor, la autenticación y la conexión a la base de datos durante el desarrollo.

## Información general

- **Archivo:** `src/controllers/test.controller.js`
- **Prefijo de rutas:** Sin prefijo `/api` (rutas raíz)
- **Autenticación:** Varía por endpoint
- **Uso:** Solo para desarrollo y monitoreo

---

## Endpoints

### `GET /health` — Health check del servidor

**Descripción:** Retorna el estado actual del servidor incluyendo uptime, uso de memoria y versión de la API.

**Autenticación:** No requerida

**Respuesta exitosa (200):**
```json
{
  "message": "Sabelo API funcionando",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600.5,
  "memory": {
    "rss": 52428800,
    "heapTotal": 20971520,
    "heapUsed": 15728640,
    "external": 1048576
  },
  "version": "1.0.0"
}
```

**Errores posibles:**
| Código | Descripción |
|--------|-------------|
| 500 | Error inesperado en el servidor |

---

### `GET /test/auth` — Prueba de autenticación

**Descripción:** Endpoint protegido para verificar que el middleware de autenticación funciona correctamente. Retorna los datos del usuario autenticado.

**Autenticación:** Requerida

**Header:**
```
Authorization: Bearer <token>
```

**Respuesta exitosa (200):**
```json
{
  "message": "Ruta protegida funcionando",
  "user": {
    "id": 10,
    "username": "miusuario",
    "role": "user"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

### `GET /test/mysql` — Prueba de conexión a base de datos

**Descripción:** Verifica la conectividad con la base de datos MySQL. Útil para diagnosticar problemas de conexión.

**Autenticación:** No requerida

**Respuesta exitosa (200):**
```json
{
  "message": "Conexión a base de datos exitosa",
  "database": "sabelo_db",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Errores posibles:**
| Código | Descripción |
|--------|-------------|
| 500 | Error de conexión a la base de datos (incluye mensaje de error) |

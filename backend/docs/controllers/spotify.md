# SpotifyController

> Controlador de integración con la API de Spotify. Permite buscar tracks y obtener metadata musical para enriquecer la información de canciones en la plataforma.

## Información general

- **Archivo:** `src/controllers/spotify.controller.js`
- **Prefijo de rutas:** `/api/spotify`
- **Autenticación:** Varía por endpoint
- **Dependencia:** `src/services/spotify.service.js`

---

## Endpoints

### `POST /api/spotify/search` — Buscar track en Spotify

**Descripción:** Busca un track en Spotify utilizando título y artista. Se pueden agregar álbum y año como filtros opcionales para refinar la búsqueda. Si no se encuentra el track, retorna `null` sin lanzar un error.

**Autenticación:** No requerida

**Body (JSON):**
| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `title` | string | Sí | Título de la canción |
| `artist` | string | Sí | Nombre del artista |
| `album` | string | No | Nombre del álbum (mejora la precisión) |
| `year` | int/string | No | Año de lanzamiento (mejora la precisión) |

**Respuesta exitosa — track encontrado (200):**
```json
{
  "success": true,
  "track": {
    "id": "spotify_track_id",
    "name": "La Camisa Negra",
    "artists": [{ "name": "Juanes" }],
    "album": {
      "name": "Mi Sangre",
      "release_date": "2004-01-01",
      "images": [{ "url": "https://..." }]
    },
    "duration_ms": 235000,
    "external_urls": {
      "spotify": "https://open.spotify.com/track/..."
    }
  }
}
```

**Respuesta exitosa — track no encontrado (200):**
```json
{
  "success": true,
  "track": null,
  "message": "No se encontró la canción en Spotify"
}
```

**Errores posibles:**
| Código | Descripción |
|--------|-------------|
| 400 | Título o artista no proporcionados |

---

### `GET /api/spotify/track/:trackId` — Obtener track por ID

**Descripción:** Retorna la información completa de un track de Spotify dado su ID.

**Autenticación:** No requerida

**Parámetros de ruta:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `trackId` | string | ID del track en Spotify |

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "track": {
    "id": "spotify_track_id",
    "name": "La Camisa Negra",
    "artists": [{ "name": "Juanes" }],
    "album": { ... },
    "duration_ms": 235000,
    "preview_url": "https://...",
    "external_urls": {
      "spotify": "https://open.spotify.com/track/..."
    }
  }
}
```

**Errores posibles:**
| Código | Descripción |
|--------|-------------|
| 404 | Track no encontrado en Spotify |

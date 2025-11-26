# 💬 Preguntas Potenciales para Presentación - Auditoría Backend

## 3 Preguntas Clave con Respuestas Detalladas

---

### 1️⃣ ¿Por qué eligieron implementar el patrón Repository en lugar de usar Sequelize directamente en los controladores?

**Respuesta:**

El patrón Repository implementado en este proyecto proporciona **abstracción de la capa de acceso a datos**, separando la lógica de negocio de los detalles de persistencia. Esta decisión arquitectónica ofrece varios beneficios:

**Ventajas técnicas:**
- **Testabilidad:** Los controladores pueden testearse con mocks de repositories sin necesidad de base de datos real
- **Separación de responsabilidades:** Los controladores se enfocan en HTTP (request/response) mientras repositories manejan queries
- **Portabilidad:** Si en el futuro se decide cambiar de Sequelize a TypeORM o Prisma, solo se modifican los repositories
- **Reutilización:** Queries complejas como `getSongsByArtist()` se centralizan y pueden reutilizarse en múltiples controladores
- **Lógica de dominio:** Métodos como `generateSlug()` o `incrementViews()` encapsulan lógica específica del dominio

**Ejemplo concreto del proyecto:**
```javascript
// Repository: song.repository.js
async getById(id) {
  return await Song.findByPk(id, {
    include: ['artist', 'album', 'annotations']
  });
}

// Controller: songs.controller.js
getById = asyncHandler(async (req, res) => {
  const song = await songRepository.getById(req.params.id);
  // Solo maneja lógica HTTP, no construcción de queries
});
```

**Alternativa descartada:** Usar Sequelize directamente en controladores crearía acoplamiento fuerte y haría testing más complejo. El patrón Repository es una **best practice** para aplicaciones con lógica de datos no trivial.

---

### 2️⃣ ¿Cómo maneja el backend la autenticación y autorización? ¿Qué vulnerabilidades identificaste?

**Respuesta:**

El sistema implementa un modelo de **autenticación JWT stateless** con autorización basada en roles:

**Flujo de autenticación:**
1. **Registro/Login:** Contraseña hasheada con bcryptjs (salt rounds 10) → almacena hash en DB
2. **Generación de token:** JWT firmado con `JWT_SECRET` que contiene `{ userId: user.id }`, expira en 24h
3. **Verificación:** Middleware `authenticateToken` extrae token del header `Authorization: Bearer <token>`, verifica firma, consulta usuario en DB y adjunta `req.user` con `{ id, email, username, role }`
4. **Autorización:** Controladores verifican ownership (solo el creador puede editar) o rol admin

**Fortalezas:**
- ✅ Stateless (no requiere almacenamiento de sesiones)
- ✅ Tokens con expiración configurada
- ✅ Middleware reutilizable (`authenticateToken`, `optionalAuth`)
- ✅ Logging de intentos de login fallidos
- ✅ Verificación de usuario en BD en cada request (detecta usuarios eliminados)

**Vulnerabilidades identificadas:**

🔴 **CRÍTICA - Secret hardcodeado:**
```javascript
// auth.middleware.js:21
const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret-key');
```
Si `JWT_SECRET` no está en `.env`, usa 'secret-key' predecible → tokens pueden falsificarse.

⚠️ **Media - Sin refresh tokens:**
Tokens de 24h son largos. Si un token es comprometido, el atacante tiene acceso por 24h completas. Mejor: access token corto (15min) + refresh token seguro.

⚠️ **Media - Sin rate limiting en login:**
Falta protección contra brute force en `/api/auth/login`. Debería implementarse rate limiting agresivo (ej: 5 intentos por 15 min).

⚠️ **Baja - Sin 2FA:**
Para aplicación con datos sensibles, debería ofrecerse autenticación de dos factores.

**Recomendación:** Antes de producción, validar `JWT_SECRET` obligatorio al inicio de la app, implementar refresh tokens y agregar rate limiting en endpoints de autenticación.

---

### 3️⃣ ¿Qué optimizaciones de performance implementaron o recomendarías para este backend?

**Respuesta:**

El backend demuestra varias **optimizaciones implementadas** y oportunidades claras de mejora:

**✅ Optimizaciones ya implementadas:**

1. **Índices de base de datos:**
   - Índices en columnas de búsqueda: `slug`, `country_code`, `verified`
   - Índices compuestos: `(song_id, start_char, end_char)` en annotations
   - Índices en FK: `artist_id`, `album_id`, `user_id`

2. **Campos desnormalizados:**
   - `view_count` y `annotation_count` en songs evitan COUNT queries costosos
   - Método `incrementViews()` actualiza contador eficientemente

3. **Paginación:**
   - Queries con `LIMIT` y `OFFSET` en todos los listados
   - Evita cargar datasets completos en memoria

4. **Compression middleware:**
   - Comprime responses HTTP con gzip/deflate
   - Reduce tamaño de payloads JSON

5. **Eager loading estratégico:**
   - Sequelize `include` para evitar N+1 queries
   - `subQuery: false` y `distinct: true` para queries optimizadas

**⚠️ Optimizaciones recomendadas:**

1. **Cache con Redis (PRIORIDAD ALTA):**
```javascript
// Cachear trending songs (cambia poco)
async getTrending(limit = 10) {
  const cacheKey = `trending:songs:${limit}`;
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const songs = await Song.findAll({ /* query */ });
  await redis.setex(cacheKey, 300, JSON.stringify(songs)); // 5 min TTL
  return songs;
}
```

2. **Elasticsearch para búsqueda full-text:**
   - Actualmente usa `LIKE %query%` en MySQL (lento para tablas grandes)
   - Elasticsearch ya está en docker-compose pero service no está integrado
   - Indexar `songs.title` y `songs.lyrics` permitiría búsquedas instant

3. **Lazy loading de lyrics:**
   - Campo `lyrics` puede ser muy largo (TEXT long)
   - Excluir de listados: `attributes: { exclude: ['lyrics'] }`
   - Solo cargar en `getById()`

4. **Database connection pooling:**
```javascript
// config/database.js - agregar pool
{
  pool: {
    max: 10,
    min: 2,
    acquire: 30000,
    idle: 10000
  }
}
```

5. **CDN para imágenes:**
   - `cover_image_url` y `image_url` apuntan a URLs
   - Servir vía CDN (Cloudflare, CloudFront) reduce latencia

6. **Response compression selectiva:**
   - No comprimir responses pequeñas (<1KB)
   - Configurar threshold en compression middleware

7. **Query optimization con EXPLAIN:**
   - Analizar queries lentas con `EXPLAIN`
   - Agregar índices basados en query patterns reales

**Métricas para monitorear:**
- Response time por endpoint (p50, p95, p99)
- Query execution time (Sequelize logging)
- Cache hit rate (Redis)
- Database connection pool usage

Con Redis cache + Elasticsearch, el backend podría manejar **10-100x más tráfico** con la misma infraestructura.

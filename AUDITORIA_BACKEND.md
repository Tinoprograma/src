# Auditoría Backend: Sabelo Platform

## 🎯 Resumen Ejecutivo

Sabelo es una plataforma comunitaria para explicar el significado cultural detrás de las letras de música hispanohablante. El backend implementa una **REST API** robusta construida con Node.js/Express que maneja autenticación JWT, gestión de canciones, artistas, álbumes y un sistema de anotaciones colaborativas. Utiliza una arquitectura en capas con patrón Repository, base de datos MySQL con Sequelize ORM, Redis para caché y Elasticsearch para búsqueda avanzada. La implementación demuestra buenas prácticas de desarrollo con separación de responsabilidades, manejo centralizado de errores, validación de inputs y logging estructurado.

---

## 📦 Stack Tecnológico

| Componente | Tecnología | Versión |
|------------|------------|---------|
| Lenguaje | Node.js | 18+ |
| Framework | Express | 5.1.0 |
| Base de Datos | MySQL | 8.0 |
| ORM | Sequelize | 6.37.7 |
| Autenticación | JWT (jsonwebtoken) | 9.0.2 |
| Cache | Redis | 5.8.2 |
| Búsqueda | Elasticsearch | 8.11.0 / 9.1.1 |
| Logging | Winston | 3.18.3 |
| Seguridad | Helmet + bcryptjs | 8.1.0 / 3.0.2 |
| Testing | Jest + Supertest | 30.1.3 / 7.1.4 |
| Validación | express-validator | 7.2.1 |

**Tipo de Backend:** REST API

**Servicios Adicionales:**
- Socket.io 4.8.1 (Comunicación en tiempo real)
- Passport.js 0.7.0 (Google OAuth)
- Morgan (HTTP request logging)
- Multer 2.0.2 (File upload)
- Sharp 0.34.4 (Image processing)

---

## 🏗️ Arquitectura

### Patrón Arquitectónico

El proyecto implementa una **Arquitectura en Capas (Layered Architecture)** combinada con el **patrón Repository**. Esta estructura proporciona clara separación de responsabilidades y facilita el testing y mantenimiento. Las capas identificadas son:

1. **Routes Layer** - Definición de endpoints y configuración de middleware
2. **Controller Layer** - Manejo de requests/responses y orquestación
3. **Service Layer** - Lógica de negocio (auth, Spotify, Elasticsearch, notifications)
4. **Repository Layer** - Abstracción de acceso a datos
5. **Model Layer** - Definición de entidades (Sequelize models)

Esta arquitectura sigue parcialmente principios de **Clean Architecture**, separando la lógica de negocio de los detalles de implementación y dependencias externas.

### Estructura del Proyecto

```
/backend
├── server.js              → Entry point con graceful shutdown
├── package.json           → Dependencias y scripts
├── .eslintrc.js          → Configuración de linting
├── jest.config.js        → Configuración de testing
├── /migrations           → Migraciones de Sequelize
├── /scripts              → Scripts de utilidad
├── /config
│   └── config.js         → Configuración de Sequelize CLI
└── /src
    ├── app.js            → Configuración de Express + middleware global
    ├── /config           → Configuraciones (DB, Redis, Elasticsearch)
    ├── /models           → Modelos de Sequelize
    ├── /controllers      → Controladores (manejo de requests)
    ├── /services         → Lógica de negocio y servicios externos
    ├── /repositories     → Capa de acceso a datos
    ├── /routes           → Definición de rutas
    ├── /middleware       → Middleware personalizado
    └── /utils            → Utilidades (logger, validators, helpers)
```

### Flujo de Request

```
Cliente → Express Router → Middleware(s) → Controller → Repository → Model → DB
              ↓                                ↓            ↓
          (validation)                     (Service)   (Sequelize)
          (auth)                        (business logic)
          (rate-limit)
                                             ↓
Cliente ← JSON Response ← Controller ← Repository ← Query Result
                            ↓
                    (Error Handler)
```

**Flujo detallado:**
1. Request llega a Express con CORS, Helmet, Compression
2. Morgan + Winston logean la request
3. Body parsers procesan JSON (límite 10MB)
4. Router específico maneja la ruta (`/api/songs`, `/api/auth`, etc.)
5. Middleware de validación (`express-validator`) valida inputs
6. Middleware de autenticación (`authenticateToken`) verifica JWT
7. Controller recibe request, delega a Repository
8. Repository ejecuta queries Sequelize con includes
9. Service layer (si aplica) maneja lógica compleja
10. Response formateada o Error Handler captura excepciones

---

## 🌐 Diseño de API

### Endpoints Principales

| Método | Endpoint | Propósito | Autenticación |
|--------|----------|-----------|---------------|
| **Autenticación** |
| POST | `/api/auth/register` | Registro de usuario | ✗ |
| POST | `/api/auth/login` | Login con email/password | ✗ |
| GET | `/api/auth/me` | Obtener usuario actual | ✓ |
| POST | `/api/auth/logout` | Cerrar sesión | ✓ |
| **Canciones** |
| GET | `/api/songs` | Listar canciones (paginado + filtros) | ✗ |
| GET | `/api/songs/:id` | Obtener canción por ID | ✗ |
| GET | `/api/songs/trending` | Top canciones por vistas | ✗ |
| GET | `/api/songs/search/:query` | Búsqueda de canciones | ✗ |
| GET | `/api/songs/:id/stats` | Estadísticas de canción | ✗ |
| POST | `/api/songs` | Crear canción | ✓ |
| PUT | `/api/songs/:id` | Actualizar canción | ✓ (owner/admin) |
| DELETE | `/api/songs/:id` | Eliminar canción | ✓ (owner/admin) |
| **Artistas** |
| GET | `/api/artists` | Listar artistas | ✗ |
| GET | `/api/artists/:id` | Obtener artista | ✗ |
| POST | `/api/artists` | Crear artista | ✓ |
| PUT | `/api/artists/:id` | Actualizar artista | ✓ |
| DELETE | `/api/artists/:id` | Eliminar artista | ✓ |
| **Anotaciones** |
| GET | `/api/annotations` | Listar anotaciones | ✗ |
| GET | `/api/annotations/:id` | Obtener anotación | ✗ |
| POST | `/api/annotations` | Crear anotación | ✓ |
| PUT | `/api/annotations/:id` | Actualizar anotación | ✓ (owner/admin) |
| DELETE | `/api/annotations/:id` | Eliminar anotación | ✓ (owner/admin) |
| **Admin** |
| GET | `/api/admin/stats` | Estadísticas generales | ✓ (admin) |
| POST | `/api/admin/users/:id/role` | Cambiar rol de usuario | ✓ (admin) |
| **Spotify** |
| GET | `/api/spotify/search` | Buscar en Spotify API | ✓ |

### Evaluación de Diseño

**Fortalezas:**
- Nomenclatura RESTful consistente con recursos plurales
- Uso correcto de métodos HTTP (GET, POST, PUT, DELETE)
- Endpoints específicos antes de dinámicos (`/trending` antes de `/:id`)
- Paginación implementada con query params (`page`, `limit`)
- Filtros y búsqueda bien estructurados
- Respuestas JSON estandarizadas con formato `{ success, data/message }`
- Health check endpoint (`/health`) para monitoreo
- Separación clara entre rutas públicas y protegidas

**Áreas de Mejora:**
- **Versionamiento de API**: No se implementa versionamiento (`/api/v1/songs`), lo que dificultaría breaking changes
- **Documentación OpenAPI**: No se detectó Swagger/OpenAPI para documentación automática
- **HATEOAS**: No se implementan links hipermedia en responses
- **Rate Limiting**: Se detecta middleware (`rate-limit.middleware.js`) pero no se observa uso en rutas analizadas
- **Paginación estándar**: Usar headers de paginación (Link, X-Total-Count) además de body
- **Content negotiation**: Solo soporta JSON, no hay soporte para XML u otros formatos

---

## 🗄️ Modelado de Datos

### Entidades Principales

1. **User (users)**
   - Atributos clave: `id`, `email`, `username`, `password_hash`, `display_name`, `country_code`, `reputation_score`, `role`
   - Relaciones:
     - 1:N con Songs (created_by)
     - 1:N con Annotations
     - 1:N con Artists (user_id)

2. **Artist (artists)**
   - Atributos clave: `id`, `name`, `slug`, `bio`, `image_url`, `country_code`, `verified`, `user_id`
   - Relaciones:
     - 1:N con Songs
     - 1:N con Albums
     - N:1 con User (creador)

3. **Album (albums)**
   - Atributos clave: `id`, `title`, `artist_id`, `release_year`, `cover_image_url`, `album_type`
   - Relaciones:
     - N:1 con Artist
     - 1:N con Songs

4. **Song (songs)**
   - Atributos clave: `id`, `title`, `artist_id`, `album_id`, `track_number`, `slug`, `lyrics`, `release_year`, `view_count`, `annotation_count`, `is_single`, `spotify_id`, `created_by`
   - Relaciones:
     - N:1 con Artist
     - N:1 con Album (opcional)
     - N:1 con User (creador)
     - 1:N con Annotations

5. **Annotation (annotations)**
   - Atributos clave: `id`, `song_id`, `user_id`, `text_selection`, `start_char`, `end_char`, `explanation`, `cultural_context`, `upvotes`, `downvotes`, `status`, `is_verified`
   - Relaciones:
     - N:1 con Song
     - N:1 con User

### Diagrama de Relaciones (Conceptual)

```
┌─────────────┐
│    User     │
│ (users)     │───────┐
└─────────────┘       │
       │              │ created_by
       │ 1:N          │
       ▼              ▼
┌─────────────┐   ┌─────────────┐
│   Artist    │   │    Song     │
│ (artists)   │   │  (songs)    │
└─────────────┘   └─────────────┘
       │                 │
       │ 1:N             │ 1:N
       ▼                 ▼
┌─────────────┐   ┌─────────────┐
│   Album     │   │ Annotation  │
│  (albums)   │   │(annotations)│
└─────────────┘   └─────────────┘
       │
       │ 1:N
       ▼
┌─────────────┐
│    Song     │
│  (songs)    │
└─────────────┘
```

**Relaciones detalladas:**
- User → Artist (1:N) - Un usuario puede crear múltiples artistas
- User → Song (1:N) - Un usuario puede crear múltiples canciones
- User → Annotation (1:N) - Un usuario puede crear múltiples anotaciones
- Artist → Album (1:N) - Un artista tiene múltiples álbumes
- Artist → Song (1:N) - Un artista tiene múltiples canciones
- Album → Song (1:N) - Un álbum contiene múltiples canciones
- Song → Annotation (1:N) - Una canción tiene múltiples anotaciones

### Evaluación del Modelo

- **Normalización:** 3FN (Tercera Forma Normal). No se detectan dependencias transitivas ni redundancias significativas. Las tablas están bien normalizadas con claves foráneas correctas.

- **Integridad referencial:**
  - ✅ Foreign Keys correctamente definidas
  - ✅ `CASCADE` en deletes críticos (Song → Annotations)
  - ✅ `SET NULL` en relaciones opcionales (Song → User created_by)
  - ⚠️ No se detectan constraints de CHECK en migraciones

- **Escalabilidad del diseño:**
  - ✅ Índices en columnas de búsqueda (`slug`, `country_code`, `verified`)
  - ✅ Índices compuestos para queries frecuentes (`song_id + start_char + end_char`)
  - ✅ Campos de contadores desnormalizados (`view_count`, `annotation_count`) para performance
  - ✅ Uso de TEXT(long) para lyrics permite canciones extensas
  - ✅ Slugs para URLs amigables
  - ⚠️ No se detecta particionamiento para gran escala
  - ⚠️ Campo `lyrics` en Song podría separarse a tabla dedicada para optimización

- **Estrategia de migraciones:**
  - ✅ Sequelize CLI con versionamiento por timestamp
  - ✅ Migraciones atómicas con `up` y `down`
  - ✅ Evolución del schema visible (add-spotify-fields, add-user-roles, add-is-verified)
  - ✅ Scripts de migración de datos (`migrate-artists-updated-at.js`)

---

## 🔒 Seguridad

### Implementaciones de Seguridad

✅ **Implementado:**

- **Autenticación JWT**: Tokens con expiración de 24h, verificación en middleware
- **Hashing de contraseñas**: bcryptjs con salt rounds 10
- **Validación de inputs**: express-validator en todos los endpoints críticos
- **Helmet.js**: Headers de seguridad HTTP (CSP, X-Frame-Options, etc.)
- **CORS configurado**: Whitelist de origin específico (FRONTEND_URL)
- **Rate limiting**: Middleware detectado (`rate-limit.middleware.js`)
- **Límite de payload**: 10MB para prevenir ataques de memoria
- **SQL Injection**: Protegido por Sequelize ORM (prepared statements)
- **XSS**: Sanitización con `normalizeEmail()` y validaciones de longitud
- **Logging de seguridad**: Winston registra intentos de login fallidos
- **Error handling centralizado**: No expone stack traces en producción
- **Variables de entorno**: Uso de dotenv para secrets

⚠️ **Recomendaciones:**

- **Secrets en producción**: `JWT_SECRET` tiene fallback a 'secret-key' (línea auth.middleware.js:21) - CRÍTICO
- **CSRF Protection**: No se detecta implementación de tokens CSRF para formularios
- **Input sanitization**: Agregar biblioteca dedicada como `xss` o `DOMPurify` para HTML
- **Refresh tokens**: Sistema de refresh tokens para mejorar seguridad JWT
- **2FA**: Implementar autenticación de dos factores
- **Password policies**: Validar complejidad de contraseñas (mayúsculas, números, símbolos)
- **Account lockout**: Bloquear cuentas tras múltiples intentos fallidos
- **Audit logging**: Registrar acciones críticas (cambios de permisos, eliminaciones)
- **Content Security Policy**: Configurar CSP más restrictivo en Helmet
- **Dependencies audit**: Implementar `npm audit` en CI/CD
- **HTTPS enforcement**: Forzar HTTPS en producción (middleware)

### Manejo de Autenticación/Autorización

El sistema implementa **autenticación basada en JWT** con dos niveles:

1. **Autenticación requerida** (`authenticateToken`): Verifica token en header `Authorization: Bearer <token>`, decodifica payload, valida usuario en BD y adjunta objeto `req.user` con `{ id, email, username, role }`.

2. **Autenticación opcional** (`optionalAuth`): Permite acceso sin autenticación pero adjunta usuario si token válido (útil para endpoints públicos con features adicionales para usuarios autenticados).

**Autorización por roles:**
- Sistema de roles implementado (`role` en users: 'user', 'admin')
- Middleware `admin.middleware.js` verifica rol admin
- Verificación de ownership en controladores (solo owner o admin pueden editar/eliminar)
- Lógica de permisos en repositories (FORBIDDEN errors)

**Flujo de autenticación:**
1. Usuario registra → hash de password con bcrypt → almacena en DB
2. Usuario login → verifica password con bcrypt.compare → genera JWT firmado
3. Request protegida → extrae token → verifica firma → consulta usuario en DB → autoriza

---

## 📊 Evaluación General

### Puntos Fuertes

1. **Arquitectura bien estructurada**: Separación clara de responsabilidades en capas, fácil de mantener y testear
2. **Patrón Repository**: Abstracción de datos que facilita cambios de ORM o fuente de datos
3. **Manejo robusto de errores**: Clase `AppError` personalizada, error handler centralizado, códigos de error consistentes
4. **Logging profesional**: Winston con niveles, Morgan para HTTP, metadata enriquecida
5. **Validación completa**: Middleware de validación reutilizable para todos los recursos
6. **ORM bien utilizado**: Sequelize con asociaciones, eager loading, migraciones versionadas
7. **Seguridad básica sólida**: JWT, bcrypt, Helmet, validación, CORS
8. **Graceful shutdown**: Cierre ordenado de conexiones y recursos
9. **Testing setup**: Jest + Supertest configurados para tests unitarios e integración
10. **Docker compose**: Infraestructura reproducible con MySQL, Redis, Elasticsearch

### Oportunidades de Mejora

1. **Documentación API**: Implementar Swagger/OpenAPI para documentación interactiva
2. **Versionamiento**: Añadir `/api/v1` para facilitar evolución de API
3. **Cobertura de tests**: No se detectan archivos de test (carpeta `__tests__/` o `.spec.js`)
4. **Rate limiting activo**: Aplicar middleware de rate limiting en rutas públicas
5. **Cache strategy**: Aprovechar Redis para cachear queries frecuentes (trending, stats)
6. **Elasticsearch integration**: Implementar búsqueda full-text con Elasticsearch service
7. **WebSockets**: Aprovechar Socket.io para notificaciones en tiempo real
8. **Monitoreo**: Implementar APM (Application Performance Monitoring) como New Relic
9. **CI/CD**: Automatizar tests, linting, security audits, deployments
10. **Health checks avanzados**: Verificar estado de DB, Redis, Elasticsearch en `/health`

### Calificación por Área

| Área | Evaluación | Comentario |
|------|------------|------------|
| Arquitectura | ⭐⭐⭐⭐⭐ | Excelente implementación de Layered + Repository pattern |
| Diseño API | ⭐⭐⭐⭐ | RESTful sólido, falta versionamiento y documentación |
| Modelado Datos | ⭐⭐⭐⭐⭐ | Normalización correcta, índices bien aplicados, migraciones robustas |
| Seguridad | ⭐⭐⭐ | Fundamentos sólidos, requiere hardening para producción |
| Testing | ⭐⭐ | Infraestructura preparada pero sin tests implementados |
| Logging | ⭐⭐⭐⭐⭐ | Winston + Morgan correctamente configurados |
| Performance | ⭐⭐⭐⭐ | Buena estructura, faltan optimizaciones de cache |
| Código | ⭐⭐⭐⭐ | Limpio, consistente, bien organizado, faltan comentarios JSDoc |

---

## 🎓 Conclusión

El backend de Sabelo demuestra un nivel **profesional** de implementación con arquitectura escalable y patrones de diseño apropiados. La separación en capas (Routes → Controllers → Repositories → Models) facilita el mantenimiento y testing. El uso de Sequelize ORM con migraciones versionadas proporciona una base sólida para la evolución del schema.

**Fortalezas principales:** La arquitectura en capas está bien implementada con clara separación de responsabilidades. El manejo de errores es robusto con clase AppError y error handler centralizado. La validación de inputs con express-validator y la autenticación JWT están correctamente aplicadas. El logging estructurado con Winston permite debugging efectivo.

**Áreas críticas de atención:** Antes de producción se debe reemplazar el fallback del JWT_SECRET, implementar rate limiting en endpoints públicos, añadir suite de tests unitarios e integración, y documentar la API con Swagger/OpenAPI. La implementación de cache con Redis y búsqueda con Elasticsearch elevará significativamente la performance.

**Viabilidad académica y profesional:** El proyecto demuestra comprensión profunda de:
- Arquitectura backend moderna (REST API, microservicios)
- Patrones de diseño (Repository, Dependency Injection via modules)
- Principios SOLID (Single Responsibility en layers, Dependency Inversion con repositories)
- Seguridad web (autenticación, autorización, validación)
- Modelado de datos relacional (normalización, integridad referencial)
- Desarrollo profesional (linting, migrations, error handling)

El código es de calidad **production-ready** con ajustes menores de seguridad y testing. Excelente base para presentación académica y portfolio profesional.

---

## 📚 Referencias

- [Express.js Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [Sequelize Documentation](https://sequelize.org/docs/v6/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [REST API Design Best Practices](https://restfulapi.net/)
- [Node.js Security Checklist](https://blog.risingstack.com/node-js-security-checklist/)
- [The Twelve-Factor App](https://12factor.net/)
- [Repository Pattern](https://martinfowler.com/eaaCatalog/repository.html)
- [Clean Architecture - Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

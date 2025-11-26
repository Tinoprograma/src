# 🎵 Sabelo - Plataforma de Anotaciones Musicales

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org)
[![MySQL](https://img.shields.io/badge/mysql-8.0-blue)](https://www.mysql.com/)
[![React](https://img.shields.io/badge/react-18.2-61dafb)](https://reactjs.org/)
[![Express](https://img.shields.io/badge/express-5.1-green)](https://expressjs.com/)

> Plataforma comunitaria para explicar el significado cultural detrás de las letras de música hispanohablante.

Sabelo es una aplicación web moderna que permite a los usuarios crear, compartir y votar anotaciones sobre letras de canciones, con especial enfoque en música latina y referencias culturales.

##  Configuración Local

## ✨ Características Principales

### 🎤 Para Usuarios
- **Anotaciones Colaborativas**: Explica y aprende el significado de letras de canciones
- **Sistema de Reputación**: Votos positivos/negativos y reputación de usuarios
- **Búsqueda Avanzada**: Encuentra canciones, artistas y álbumes fácilmente
- **Autenticación Segura**: Registro/login con JWT y bcrypt
- **Perfil de Usuario**: Gestiona tus anotaciones y reputación

### 🎨 Para Desarrolladores
- **API REST Completa**: Endpoints bien documentados y RESTful
- **Arquitectura Escalable**: Patrón Repository + Service Layer
- **TypeScript Ready**: Estructura preparada para migración
- **Testing Configurado**: Jest setup para TDD
- **Docker Support**: Docker Compose para desarrollo local

### 🔐 Seguridad
- Autenticación JWT con tokens de 24h
- Hashing de contraseñas con bcrypt (10 rounds)
- Validación de inputs con express-validator
- Headers de seguridad con Helmet
- Rate limiting para prevenir abuse
- CORS configurado

---

## 🏗️ Stack Tecnológico

### Backend
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **Node.js** | 18+ | Runtime de JavaScript |
| **Express** | 5.1.0 | Framework web |
| **MySQL** | 8.0 | Base de datos relacional |
| **Sequelize** | 6.37.7 | ORM para MySQL |
| **Redis** | 7.x | Cache y sesiones |
| **Elasticsearch** | 8.11.0 | Búsqueda full-text |
| **JWT** | 9.0.2 | Autenticación |
| **bcrypt** | 3.0.2 | Hash de contraseñas |
| **Winston** | 3.18.3 | Logging |
| **Jest** | 30.1.3 | Testing framework |

### Frontend
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **React** | 18.2.0 | UI Library |
| **Vite** | Latest | Build tool y dev server |
| **React Router** | 6.x | Navegación |
| **Tailwind CSS** | 4.x | Styling |
| **Tanstack Query** | 5.x | Data fetching y cache |
| **Axios** | 1.x | HTTP client |
| **React Hook Form** | 7.x | Manejo de formularios |
| **Framer Motion** | 10.x | Animaciones |
| **Lucide React** | Latest | Íconos |

### DevOps & Tools
- **Docker Compose**: Orquestación de servicios
- **ESLint**: Linting de código
- **Prettier**: Formateo de código
- **Nodemon**: Hot reload en desarrollo
- **Sequelize CLI**: Migraciones de BD

---

## 🏛️ Arquitectura

### Backend - Layered Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT                              │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP Request
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    MIDDLEWARE LAYER                         │
│  • CORS, Helmet, Compression                                │
│  • Body Parser, Morgan                                      │
│  • Authentication (JWT)                                     │
│  • Validation (express-validator)                           │
│  • Rate Limiting                                            │
└──────────────────────────┬──────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                     ROUTES LAYER                            │
│  /api/auth  /api/songs  /api/artists  /api/albums          │
│  /api/annotations  /api/users  /api/admin                  │
└──────────────────────────┬──────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   CONTROLLER LAYER                          │
│  • Maneja HTTP requests/responses                           │
│  • Valida inputs                                            │
│  • Delega a Services/Repositories                           │
└──────────────────────────┬──────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    SERVICE LAYER                            │
│  • Lógica de negocio                                        │
│  • AuthService, SpotifyService                              │
│  • ElasticsearchService (WIP)                               │
└──────────────────────────┬──────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                  REPOSITORY LAYER                           │
│  • Acceso a datos                                           │
│  • UserRepository, SongRepository, etc.                     │
│  • Queries Sequelize                                        │
└──────────────────────────┬──────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                     MODEL LAYER                             │
│  User, Artist, Album, Song, Annotation                      │
│  (Sequelize Models)                                         │
└──────────────────────────┬──────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                       DATABASE                              │
│              MySQL + Redis + Elasticsearch                  │
└─────────────────────────────────────────────────────────────┘
```

### Frontend - Component Architecture

```
src/
├── pages/                 # Páginas principales
│   ├── HomePage.jsx
│   ├── SongDetailPage.jsx
│   ├── LoginPage.jsx
│   └── AdminDashboard.jsx
├── components/            # Componentes reutilizables
│   ├── auth/
│   ├── songs/
│   ├── annotations/
│   ├── layout/
│   └── ui/
├── services/              # API calls
│   ├── songService.js
│   ├── authService.js
│   └── annotationService.js
├── utils/                 # Utilidades
│   ├── api.js
│   └── constants.js
└── App.jsx               # Root component
```

---

## 🚀 Instalación y Configuración

### Prerrequisitos

Asegúrate de tener instalado:
- **Node.js** >= 18.0.0
- **MySQL** >= 8.0
- **Docker & Docker Compose** (opcional pero recomendado)
- **Git**

### Opción 1: Con Docker (Recomendado)

```bash
# 1. Clonar el repositorio
git clone https://github.com/tu-usuario/sabelo.git
cd sabelo

# 2. Crear archivo .env para backend
cd backend
cp .env.example .env
# Editar .env con tus configuraciones

# 3. Crear archivo .env para frontend
cd ../frontend
cp .env.example .env
# Editar .env con tus configuraciones

# 4. Iniciar servicios con Docker
cd ..
docker-compose up -d

# 5. Instalar dependencias
cd backend && npm install
cd ../frontend && npm install

# 6. Ejecutar migraciones
cd backend
npm run migrate

# 7. (Opcional) Sembrar datos de prueba
npm run seed

# 8. Iniciar aplicación
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev
```

### Opción 2: Instalación Manual

```bash
# 1. Clonar repositorio
git clone https://github.com/tu-usuario/sabelo.git
cd sabelo

# 2. Instalar MySQL 8.0
# Seguir instrucciones oficiales: https://dev.mysql.com/doc/

# 3. Crear base de datos
mysql -u root -p
CREATE DATABASE sabelo_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'sabelo_user'@'localhost' IDENTIFIED BY 'tu_password';
GRANT ALL PRIVILEGES ON sabelo_db.* TO 'sabelo_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;

# 4. Instalar Redis (opcional)
# https://redis.io/docs/getting-started/installation/

# 5. Configurar Backend
cd backend
npm install
cp .env.example .env
# Editar .env con credenciales de BD

# 6. Ejecutar migraciones
npm run migrate

# 7. Configurar Frontend
cd ../frontend
npm install
cp .env.example .env
# Editar .env con URL del backend

# 8. Iniciar servicios
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend && npm run dev
```

---

## ⚙️ Variables de Entorno

### Backend (.env)

```bash
# Server
NODE_ENV=development
PORT=5000

# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=sabelo_db
DB_USERNAME=sabelo_user
DB_PASSWORD=tu_password_seguro

# JWT
JWT_SECRET=tu_secret_jwt_muy_seguro_y_largo
JWT_EXPIRES_IN=24h

# Redis (opcional)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Elasticsearch (opcional)
ELASTICSEARCH_NODE=http://localhost:9200

# Spotify API (para integración)
SPOTIFY_CLIENT_ID=tu_client_id
SPOTIFY_CLIENT_SECRET=tu_client_secret

# Frontend URL (para CORS)
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env)

```bash
# API Backend
VITE_API_URL=http://localhost:5000/api

# App Config
VITE_APP_NAME=Sabelo
VITE_APP_VERSION=1.0.0
```

---

## 📂 Estructura del Proyecto

```
sabelo/
├── backend/                      # Backend API
│   ├── src/
│   │   ├── config/              # Configuraciones (DB, Redis, Elasticsearch)
│   │   ├── controllers/         # Controladores HTTP
│   │   ├── middleware/          # Middleware personalizado
│   │   ├── models/              # Modelos Sequelize (refactorizado)
│   │   │   ├── index.js        # Orchestrator
│   │   │   ├── user.model.js
│   │   │   ├── artist.model.js
│   │   │   ├── album.model.js
│   │   │   ├── song.model.js
│   │   │   ├── annotation.model.js
│   │   │   └── README.md       # Docs de modelos
│   │   ├── repositories/        # Capa de acceso a datos
│   │   ├── routes/              # Definición de rutas
│   │   ├── services/            # Lógica de negocio
│   │   │   ├── auth.service.js
│   │   │   ├── spotify.service.js
│   │   │   ├── elasticsearch.service.js (WIP)
│   │   │   └── notification.service.js (WIP)
│   │   └── utils/               # Utilidades
│   │       ├── logger.js
│   │       └── helpers.js
│   ├── migrations/              # Migraciones de Sequelize
│   ├── scripts/                 # Scripts de utilidad
│   ├── .eslintrc.js            # Configuración ESLint
│   ├── .prettierrc             # Configuración Prettier
│   ├── jest.config.js          # Configuración Jest
│   ├── package.json
│   └── server.js               # Entry point
│
├── frontend/                    # Frontend React
│   ├── src/
│   │   ├── components/         # Componentes React
│   │   ├── pages/              # Páginas principales
│   │   ├── services/           # API services
│   │   ├── utils/              # Utilidades
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/                 # Assets estáticos
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── docs/                        # Documentación del proyecto
│   ├── AUDITORIA_BACKEND.md            # Auditoría técnica
│   ├── REFACTORIZACION_MODELS.md       # Docs de refactorización
│   ├── ANALISIS_ARCHIVOS_VACIOS.md     # Análisis de limpieza
│   └── ...
│
├── docker-compose.yml           # Orquestación Docker
├── .gitignore
├── package.json                 # Scripts globales
└── README.md                    # Este archivo
```

---

## 🔌 API Endpoints

### Autenticación

```http
POST   /api/auth/register          # Registro de usuario
POST   /api/auth/login             # Login
GET    /api/auth/me                # Usuario actual (requiere auth)
POST   /api/auth/logout            # Logout
```

### Canciones

```http
GET    /api/songs                  # Listar canciones (con paginación)
GET    /api/songs/:id              # Obtener canción por ID
GET    /api/songs/trending         # Top canciones
GET    /api/songs/search/:query    # Buscar canciones
GET    /api/songs/:id/stats        # Estadísticas de canción
POST   /api/songs                  # Crear canción (requiere auth)
PUT    /api/songs/:id              # Actualizar canción (requiere auth)
DELETE /api/songs/:id              # Eliminar canción (requiere auth)
```

### Artistas

```http
GET    /api/artists                # Listar artistas
GET    /api/artists/:id            # Obtener artista
POST   /api/artists                # Crear artista (requiere auth)
PUT    /api/artists/:id            # Actualizar artista (requiere auth)
DELETE /api/artists/:id            # Eliminar artista (requiere auth)
```

### Álbumes

```http
GET    /api/albums                 # Listar álbumes
GET    /api/albums/:id             # Obtener álbum
POST   /api/albums                 # Crear álbum (requiere auth)
PUT    /api/albums/:id             # Actualizar álbum (requiere auth)
DELETE /api/albums/:id             # Eliminar álbum (requiere auth)
```

### Anotaciones

```http
GET    /api/annotations            # Listar anotaciones
GET    /api/annotations/:id        # Obtener anotación
POST   /api/annotations            # Crear anotación (requiere auth)
PUT    /api/annotations/:id        # Actualizar anotación (requiere auth)
DELETE /api/annotations/:id        # Eliminar anotación (requiere auth)
POST   /api/annotations/:id/vote   # Votar anotación (requiere auth)
```

### Usuarios

```http
GET    /api/users/:id              # Obtener perfil de usuario
PUT    /api/users/:id              # Actualizar perfil (requiere auth)
GET    /api/users/:id/annotations  # Anotaciones del usuario
GET    /api/users/:id/stats        # Estadísticas del usuario
```

### Admin

```http
GET    /api/admin/stats            # Estadísticas generales (admin only)
POST   /api/admin/users/:id/role   # Cambiar rol de usuario (admin only)
DELETE /api/admin/annotations/:id  # Eliminar anotación (admin only)
```

**Formato de Response:**

```json
{
  "success": true,
  "message": "Operación exitosa",
  "data": { /* ... */ },
  "pagination": { /* solo en listados */ }
}
```

---

## 🧪 Testing

### Backend

```bash
cd backend

# Ejecutar todos los tests
npm test

# Ejecutar tests en watch mode
npm run test:watch

# Generar reporte de coverage
npm test -- --coverage
```

### Frontend

```bash
cd frontend

# Tests (cuando se implementen)
npm test
```

---

## 💻 Comandos Disponibles

### Backend

```bash
npm start              # Iniciar servidor en producción
npm run dev            # Iniciar con nodemon (hot reload)
npm test               # Ejecutar tests
npm run lint           # Linter ESLint
npm run format         # Formatear código con Prettier
npm run migrate        # Ejecutar migraciones
npm run seed           # Sembrar datos de prueba
```

### Frontend

```bash
npm run dev            # Iniciar dev server (Vite)
npm run build          # Build para producción
npm run preview        # Preview del build
npm run lint           # Linter ESLint
npm run format         # Formatear código con Prettier
```

### Docker

```bash
docker-compose up -d              # Iniciar todos los servicios
docker-compose down               # Detener servicios
docker-compose logs -f backend    # Ver logs del backend
docker-compose restart            # Reiniciar servicios
docker-compose ps                 # Ver estado de servicios
```

---

## 🗃️ Base de Datos

### Diagrama de Relaciones

```
┌──────────┐         ┌──────────┐         ┌──────────┐
│   User   │────┐    │  Artist  │         │  Album   │
│          │    │    │          │────┐    │          │
│ • id     │    │    │ • id     │    │    │ • id     │
│ • email  │    │    │ • name   │    │    │ • title  │
│ • role   │    │    │ • slug   │    │    │ • year   │
└──────────┘    │    └──────────┘    │    └──────────┘
      │         │           │         │          │
      │ creates │           │ has     │          │ contains
      │         │           │         │          │
      ▼         │           ▼         │          ▼
┌──────────┐   │    ┌──────────────────────────────┐
│Annotation│   └───▶│            Song              │
│          │        │                              │
│ • id     │        │ • id                         │
│ • text   │        │ • title                      │
│ • upvotes│        │ • lyrics                     │
└──────────┘        │ • artist_id (FK)             │
      │             │ • album_id (FK)              │
      │ belongs to  │ • created_by (FK)            │
      └────────────▶│ • view_count                 │
                    │ • annotation_count           │
                    └──────────────────────────────┘
```

### Migraciones

Las migraciones están versionadas por timestamp y se ejecutan en orden:

```bash
# Ver estado de migraciones
npx sequelize-cli db:migrate:status

# Ejecutar migraciones pendientes
npm run migrate

# Revertir última migración
npx sequelize-cli db:migrate:undo

# Crear nueva migración
npx sequelize-cli migration:generate --name nombre-de-migracion
```

---

## 🔧 Desarrollo

### Convenciones de Código

- **Estilo**: Single quotes, semicolons, 2 espacios
- **Nombres**: camelCase para variables, PascalCase para clases
- **Commits**: Conventional Commits (feat:, fix:, docs:, refactor:)
- **Branches**: feature/, bugfix/, hotfix/, refactor/

### Flujo de Trabajo Git

```bash
# 1. Crear rama para feature
git checkout -b feature/nombre-feature

# 2. Hacer cambios y commits
git add .
git commit -m "feat: descripción del cambio"

# 3. Push a remote
git push origin feature/nombre-feature

# 4. Crear Pull Request en GitHub
```

### Pre-commit Hooks (Recomendado)

```bash
# Instalar husky
npm install --save-dev husky

# Configurar pre-commit
npx husky install
npx husky add .husky/pre-commit "npm run lint && npm test"
```

---

## 📚 Documentación Adicional

### Documentos Disponibles

- **[backend/src/models/README.md](./backend/src/models/README.md)** - Documentación de modelos

---

## 🚧 Roadmap

### ✅ Completado

- [x] Sistema de autenticación JWT
- [x] CRUD de canciones, artistas, álbumes
- [x] Sistema de anotaciones
- [x] Sistema de votación (upvotes/downvotes)
- [x] Búsqueda básica de canciones
- [x] Integración con Spotify API
- [x] Refactorización de modelos
- [x] Service layer implementado
- [x] Helpers utilities

### 🚀 En Progreso

- [ ] Implementar Elasticsearch para búsqueda full-text
- [ ] Sistema de notificaciones en tiempo real (Socket.io)
- [ ] Tests unitarios y de integración
- [ ] Documentación OpenAPI/Swagger


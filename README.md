# Sabelo 

Plataforma comunitaria para explicar el significado cultural detrás de las letras de música hispanohablante.

## 🏗️ Arquitectura

- **Frontend**: Next.js + React + Tailwind CSS
- **Backend**: Node.js + Express + MySQL
- **Cache**: Redis
- **Búsqueda**: Elasticsearch

## 🚀 Configuración Local

### Prerequisitos
- Node.js 18+
- MySQL 8.0+
- Redis
- Elasticsearch 8.x

### Instalación
1. Clonar repositorio
2. Configurar backend: `cd backend && npm install`
3. Configurar frontend: `cd frontend && npm install`
4. Configurar variables de entorno
5. Ejecutar migraciones: `npm run migrate`
6. Iniciar servicios: `npm run dev`

## 📁 Estructura del Proyecto
sabelo-platform/
├── backend/          # API REST con Node.js/Express
├── frontend/         # Aplicación React con Next.js
├── docs/            # Documentación
└── docker-compose.yml

## 🤝 Contribución

Ver [CONTRIBUTING.md](./CONTRIBUTING.md) para guías de contribución.

## 📄 Licencia

MIT License
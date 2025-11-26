# Models Directory - Arquitectura Refactorizada

## 📁 Estructura

```
/models
├── index.js              → Orchestrator (carga y exporta todos los modelos)
├── user.model.js         → Modelo de usuarios
├── artist.model.js       → Modelo de artistas
├── album.model.js        → Modelo de álbumes
├── song.model.js         → Modelo de canciones
├── annotation.model.js   → Modelo de anotaciones
└── README.md            → Esta documentación
```

## 🎯 Filosofía de Diseño

### Antes de la Refactorización

- ❌ Un solo archivo `index.js` con 673 líneas
- ❌ Todas las definiciones mezcladas
- ❌ Difícil de mantener y navegar
- ❌ Difícil de testear modelos individualmente

### Después de la Refactorización

- ✅ Cada modelo en su propio archivo
- ✅ Separación clara de responsabilidades
- ✅ Fácil de mantener y escalar
- ✅ Mejor organización del código
- ✅ Compatibilidad 100% con código existente

## 📝 Estructura de un Modelo

Cada archivo de modelo sigue este patrón:

```javascript
/**
 * [NOMBRE] MODEL
 * [Descripción del modelo]
 */

module.exports = (sequelize, DataTypes) => {
  // 1. Definir el modelo con sequelize.define()
  const ModelName = sequelize.define('ModelName', {
    // Schema definition
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    // ... otros campos
  }, {
    tableName: 'table_name',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      // Índices para performance
    ]
  });

  /**
   * 2. Definir asociaciones
   * Este método será llamado por el orchestrator
   */
  ModelName.associate = (models) => {
    // Definir relaciones con otros modelos
    ModelName.belongsTo(models.OtherModel, { /* ... */ });
    ModelName.hasMany(models.AnotherModel, { /* ... */ });
  };

  // 3. Retornar el modelo
  return ModelName;
};
```

## 🔄 Cómo Funciona el Orchestrator (index.js)

El archivo `index.js` sigue este flujo:

```javascript
// 1. Importar definiciones
const userModel = require('./user.model');
const artistModel = require('./artist.model');
// ...

// 2. Inicializar todos los modelos
const models = {
  User: userModel(sequelize, DataTypes),
  Artist: artistModel(sequelize, DataTypes),
  // ...
};

// 3. Ejecutar asociaciones
Object.keys(models).forEach((modelName) => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

// 4. Exportar
module.exports = {
  User: models.User,
  Artist: models.Artist,
  // ...
};
```

## 💡 Uso en el Código

La API de uso es **idéntica** a la versión anterior:

```javascript
// Importar modelos (igual que antes)
const { User, Artist, Song, Album, Annotation } = require('../models');

// Usar en repositories
class UserRepository {
  async getById(id) {
    return await User.findByPk(id);
  }
}

// Usar en controllers
const song = await Song.findOne({
  include: [
    { association: 'artist' },
    { association: 'album' }
  ]
});
```

**✅ No se requiere cambiar ningún código existente**

## 📚 Modelos Disponibles

### 1. User (user.model.js)

**Propósito:** Usuarios del sistema

**Campos principales:**
- `email`, `username`, `password_hash`
- `display_name`, `country_code`
- `reputation_score`, `role`

**Asociaciones:**
- `hasMany`: Artist, Song (createdSongs), Album (createdAlbums), Annotation

---

### 2. Artist (artist.model.js)

**Propósito:** Artistas musicales

**Campos principales:**
- `name`, `slug`, `bio`
- `image_url`, `country_code`
- `verified`, `user_id`

**Asociaciones:**
- `belongsTo`: User (creator)
- `hasMany`: Song, Album

---

### 3. Album (album.model.js)

**Propósito:** Álbumes de música

**Campos principales:**
- `title`, `slug`, `release_year`
- `cover_image_url`, `total_tracks`
- `artist_id`, `created_by`
- `spotify_album_id`, `spotify_uri`

**Asociaciones:**
- `belongsTo`: Artist, User (creator)
- `hasMany`: Song

---

### 4. Song (song.model.js)

**Propósito:** Canciones individuales

**Campos principales:**
- `title`, `slug`, `lyrics`
- `artist_id`, `album_id`, `track_number`
- `is_single`, `release_year`
- `view_count`, `annotation_count`
- `spotify_track_id`, `spotify_preview_url`

**Asociaciones:**
- `belongsTo`: Artist, Album, User (creator)
- `hasMany`: Annotation

---

### 5. Annotation (annotation.model.js)

**Propósito:** Anotaciones de canciones

**Campos principales:**
- `song_id`, `user_id`
- `text_selection`, `start_char`, `end_char`
- `explanation`, `cultural_context`
- `upvotes`, `downvotes`
- `is_verified`, `status`

**Asociaciones:**
- `belongsTo`: Song, User

---

## 🔧 Agregar un Nuevo Modelo

Para agregar un nuevo modelo al sistema:

### 1. Crear archivo del modelo

```bash
touch src/models/new-model.model.js
```

### 2. Definir el modelo

```javascript
// src/models/new-model.model.js
module.exports = (sequelize, DataTypes) => {
  const NewModel = sequelize.define('NewModel', {
    // Schema...
  }, {
    tableName: 'new_models',
    timestamps: true
  });

  NewModel.associate = (models) => {
    // Asociaciones...
  };

  return NewModel;
};
```

### 3. Registrar en index.js

```javascript
// src/models/index.js

// 1. Importar
const newModelDef = require('./new-model.model');

// 2. Inicializar
const models = {
  // ... otros modelos
  NewModel: newModelDef(sequelize, DataTypes)
};

// 3. Exportar
module.exports = {
  // ... otros modelos
  NewModel: models.NewModel
};
```

### 4. Crear migración

```bash
npx sequelize-cli migration:generate --name create-new-models-table
```

## ✅ Beneficios de Esta Estructura

### Para Desarrollo

- **Separación de responsabilidades**: Cada modelo es independiente
- **Fácil navegación**: Encontrar código es más rápido
- **Testing aislado**: Testear un modelo sin cargar todos
- **Menor merge conflicts**: Menos desarrolladores editando el mismo archivo

### Para Mantenimiento

- **Código más limpio**: Archivos pequeños y enfocados
- **Escalabilidad**: Agregar modelos no afecta a otros
- **Refactoring seguro**: Cambios aislados por modelo
- **Documentación clara**: Cada modelo auto-documentado

### Para Performance

- **Tree-shaking potencial**: Solo importar modelos necesarios (futuro)
- **Compilación más rápida**: Archivos más pequeños
- **Cache de módulos**: Node.js cachea mejor archivos pequeños

## 🧪 Testing

Para testear un modelo individual:

```javascript
// __tests__/models/user.model.test.js
const { Sequelize, DataTypes } = require('sequelize');
const userModel = require('../../src/models/user.model');

describe('User Model', () => {
  let sequelize;
  let User;

  beforeAll(() => {
    sequelize = new Sequelize('sqlite::memory:');
    User = userModel(sequelize, DataTypes);
  });

  it('should create a user', async () => {
    await sequelize.sync({ force: true });
    const user = await User.create({
      email: 'test@example.com',
      username: 'testuser',
      password_hash: 'hash'
    });
    expect(user.email).toBe('test@example.com');
  });
});
```

## 📖 Referencias

- [Sequelize Models Documentation](https://sequelize.org/docs/v6/core-concepts/model-basics/)
- [Sequelize Associations](https://sequelize.org/docs/v6/core-concepts/assocs/)
- [Repository Pattern](https://martinfowler.com/eaaCatalog/repository.html)

---

## 🤝 Contribución

Al modificar modelos:

1. ✅ Mantener la estructura del archivo
2. ✅ Documentar cambios en campos
3. ✅ Actualizar asociaciones si es necesario
4. ✅ Crear migración correspondiente
5. ✅ Actualizar tests si existen

---

**Última actualización:** 2025-11-26
**Autor:** Refactorización de arquitectura de modelos

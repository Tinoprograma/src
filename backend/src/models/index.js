const User = require('../User');
const Song = require('../Song');
const Annotation = require('../Annotation');

// Definir relaciones (comentadas por ahora)
// User.hasMany(Song, { foreignKey: 'created_by' });
// Song.belongsTo(User, { foreignKey: 'created_by' });

module.exports = {
  User,
  Song,
  Annotation
};
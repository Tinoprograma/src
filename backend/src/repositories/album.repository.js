const { Album, Artist, Song } = require('../models');

class AlbumRepository {
  // Obtener todos con paginación
  async getAll(filters = {}, pagination = {}) {
    const { artist_id } = filters;
    const { page = 1, limit = 20 } = pagination;
    const offset = (page - 1) * limit;

    return await Album.findAndCountAll({
      where: artist_id ? { artist_id } : {},
      include: [
        { association: 'artist', attributes: ['id', 'name', 'slug'] },
        { association: 'songs', attributes: ['id'], through: { attributes: [] } }
      ],
      limit: parseInt(limit),
      offset,
      order: [['release_year', 'DESC'], ['created_at', 'DESC']]
    });
  }

  // Obtener por ID con relaciones
  async getById(id) {
    return await Album.findByPk(id, {
      include: [
        { association: 'artist', attributes: ['id', 'name', 'slug'] },
        {
          association: 'songs',
          attributes: ['id', 'title', 'track_number', 'annotation_count'],
          order: [['track_number', 'ASC']]
        }
      ]
    });
  }

  // Crear album
  async create(data) {
    return await Album.create(data);
  }

  // Actualizar album
  async update(id, data) {
    const album = await Album.findByPk(id);
    if (!album) return null;
    return await album.update(data);
  }

  // Eliminar album
  async delete(id) {
    const album = await Album.findByPk(id);
    if (!album) return null;
    await album.destroy();
    return album;
  }

  // Obtener canciones del album
  async getSongs(id) {
    const album = await Album.findByPk(id, {
      include: [
        {
          association: 'songs',
          attributes: ['id', 'title', 'track_number', 'artist_id', 'annotation_count'],
          order: [['track_number', 'ASC']]
        }
      ]
    });
    return album?.songs || [];
  }

  // Obtener albums por artista
  async getByArtist(artistId) {
    return await Album.findAll({
      where: { artist_id: artistId },
      include: [{ association: 'artist', attributes: ['name'] }],
      order: [['release_year', 'DESC']]
    });
  }
}

module.exports = new AlbumRepository();
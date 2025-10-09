'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('albums', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      artist_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'artists',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      slug: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      release_year: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      cover_image_url: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      total_tracks: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        comment: 'Total de canciones en el álbum'
      },
      spotify_album_id: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: 'ID del álbum en Spotify'
      },
      spotify_uri: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      spotify_external_url: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Descripción del álbum'
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    // Agregar índices
    await queryInterface.addIndex('albums', ['artist_id'], {
      name: 'idx_albums_artist_id'
    });

    await queryInterface.addIndex('albums', ['slug'], {
      name: 'idx_albums_slug'
    });

    console.log('✅ Tabla albums creada exitosamente');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('albums');
    console.log('✅ Tabla albums eliminada');
  }
};
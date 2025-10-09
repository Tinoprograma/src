'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Agregar campo album_id a songs
    await queryInterface.addColumn('songs', 'album_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      after: 'artist_id',
      references: {
        model: 'albums',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      comment: 'ID del álbum al que pertenece (null si es single)'
    });

    // Agregar campo track_number para el orden en el álbum
    await queryInterface.addColumn('songs', 'track_number', {
      type: Sequelize.INTEGER,
      allowNull: true,
      after: 'album_id',
      comment: 'Número de track en el álbum'
    });

    // Agregar campo is_single
    await queryInterface.addColumn('songs', 'is_single', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      after: 'track_number',
      comment: 'True si es un single (no pertenece a álbum)'
    });

    // Agregar índice para album_id
    await queryInterface.addIndex('songs', ['album_id'], {
      name: 'idx_songs_album_id'
    });

    console.log('✅ Campos de álbum agregados a la tabla songs');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('songs', 'idx_songs_album_id');
    await queryInterface.removeColumn('songs', 'album_id');
    await queryInterface.removeColumn('songs', 'track_number');
    await queryInterface.removeColumn('songs', 'is_single');
    console.log('✅ Campos de álbum removidos de la tabla songs');
  }
};
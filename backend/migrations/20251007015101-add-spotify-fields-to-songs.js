'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Agregar campos de Spotify a la tabla songs
    await queryInterface.addColumn('songs', 'spotify_track_id', {
      type: Sequelize.STRING(100),
      allowNull: true,
      after: 'created_by',
      comment: 'ID del track en Spotify'
    });

    await queryInterface.addColumn('songs', 'spotify_uri', {
      type: Sequelize.STRING(255),
      allowNull: true,
      after: 'spotify_track_id',
      comment: 'URI de Spotify (spotify:track:xxxx)'
    });

    await queryInterface.addColumn('songs', 'spotify_preview_url', {
      type: Sequelize.STRING(500),
      allowNull: true,
      after: 'spotify_uri',
      comment: 'URL de vista previa de 30 segundos'
    });

    await queryInterface.addColumn('songs', 'spotify_external_url', {
      type: Sequelize.STRING(500),
      allowNull: true,
      after: 'spotify_preview_url',
      comment: 'URL pública de Spotify'
    });

    console.log('  Campos de Spotify agregados a la tabla songs');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('songs', 'spotify_track_id');
    await queryInterface.removeColumn('songs', 'spotify_uri');
    await queryInterface.removeColumn('songs', 'spotify_preview_url');
    await queryInterface.removeColumn('songs', 'spotify_external_url');

    console.log('  Campos de Spotify removidos de la tabla songs');
  }
};
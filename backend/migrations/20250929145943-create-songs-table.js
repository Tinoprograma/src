'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('songs', {
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
        onDelete: 'CASCADE'
      },
      slug: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      lyrics: {
        type: Sequelize.TEXT('long'),
        allowNull: false
      },
      album: {
        type: Sequelize.STRING(255)
      },
      release_year: {
        type: Sequelize.INTEGER
      },
      cover_image_url: {
        type: Sequelize.STRING(500)
      },
      view_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      annotation_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      created_by: {
        type: Sequelize.INTEGER,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'SET NULL'
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

    await queryInterface.addIndex('songs', ['artist_id']);
    await queryInterface.addIndex('songs', ['view_count']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('songs');
  }
};
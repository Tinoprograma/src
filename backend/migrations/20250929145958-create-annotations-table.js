'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('annotations', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      song_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'songs',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      text_selection: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      start_char: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      end_char: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      explanation: {
        type: Sequelize.TEXT('long'),
        allowNull: false
      },
      cultural_context: {
        type: Sequelize.TEXT
      },
      upvotes: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      downvotes: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      status: {
        type: Sequelize.ENUM('active', 'hidden', 'deleted'),
        defaultValue: 'active'
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

    await queryInterface.addIndex('annotations', ['song_id', 'start_char', 'end_char']);
    await queryInterface.addIndex('annotations', ['user_id']);
    await queryInterface.addIndex('annotations', ['upvotes']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('annotations');
  }
};
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('artists', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      slug: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true
      },
      bio: {
        type: Sequelize.TEXT
      },
      image_url: {
        type: Sequelize.STRING(500)
      },
      country_code: {
        type: Sequelize.STRING(3)
      },
      verified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    await queryInterface.addIndex('artists', ['country_code']);
    await queryInterface.addIndex('artists', ['verified']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('artists');
  }
};
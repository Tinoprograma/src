'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Agregar campo user_id a artists (puede ser null para artistas importados)
    await queryInterface.addColumn('artists', 'user_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      after: 'bio',
      comment: 'Usuario que creó el artista'
    });

    console.log('  Campo user_id agregado a la tabla artists');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('artists', 'user_id');
    console.log('  Campo user_id removido de la tabla artists');
  }
};
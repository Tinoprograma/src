'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('annotations', 'is_verified', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false,
      after: 'downvotes' // Coloca la columna después de downvotes
    });
    
    console.log(' Campo is_verified agregado a la tabla annotations');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('annotations', 'is_verified');
    console.log(' Campo is_verified removido de la tabla annotations');
  }
};
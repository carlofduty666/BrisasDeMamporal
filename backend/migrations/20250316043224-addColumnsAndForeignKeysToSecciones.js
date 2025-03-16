'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.addColumn('Secciones', 'capacidad', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 30
    });
    await queryInterface.addColumn('Secciones', 'activo', {
      type: Sequelize.BOOLEAN,
      defaultValue: true
    });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn('Secciones', 'capacidad');
    await queryInterface.removeColumn('Secciones', 'activo');
  }
};

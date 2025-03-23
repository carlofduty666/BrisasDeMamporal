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
    await queryInterface.addColumn('Personas', 'profesion', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('Personas', 'genero', {
      type: Sequelize.ENUM('M', 'F'),
      allowNull: true
    });
    await queryInterface.addColumn('Personas', 'observaciones', {
      type: Sequelize.TEXT,
      allowNull: true
    });
    await queryInterface.addColumn('Personas', 'direccion', {
      type: Sequelize.TEXT,
      allowNull: true
    });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn('Personas', 'profesion');
    await queryInterface.removeColumn('Personas', 'genero');
    await queryInterface.removeColumn('Personas', 'observaciones');
    await queryInterface.removeColumn('Personas', 'direccion');
  }
};

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
    await queryInterface.addColumn('BonificacionNomina', 'personaID', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Personas',
        key: 'id'
      }
    });
    await queryInterface.addColumn('BonificacionNomina', 'tipo', {
      type: Sequelize.ENUM('cestaticket', 'responsabilidad', 'puntualidad', 'finDeAño', 'vacacional', 'otro'),
      allowNull: false,
      defaultValue: 'otro'
    });
    await queryInterface.addColumn('BonificacionNomina', 'descripcion', {
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
    await queryInterface.removeColumn('BonificacionNomina', 'personaID');
    await queryInterface.removeColumn('BonificacionNomina', 'tipo');
    await queryInterface.removeColumn('BonificacionNomina', 'descripcion');
  }
};

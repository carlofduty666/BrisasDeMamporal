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
    await queryInterface.addColumn('PagoEstudiantes', 'metodoPagoID', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'MetodoPagos',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });
    await queryInterface.addColumn('PagoEstudiantes', 'arancelID', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'Arancels',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });

  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn('PagoEstudiantes', 'metodoPagoID');
    await queryInterface.removeColumn('PagoEstudiantes', 'arancelID');
    
  }
};

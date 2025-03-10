'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Nominas', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      periodoPago: { // Ej., "Quincena 1 Enero 2024"
        type: Sequelize.STRING,
        allowNull: false
      },
      fechaPago: {
        type: Sequelize.DATE,
        allowNull: false
      },
      descripcion: { // Agregado: para detalles adicionales de la nómina
        type: Sequelize.STRING,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Nominas');
  }
};
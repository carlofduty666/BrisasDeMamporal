'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ConfiguracionNomina', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      diasQuincena: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 15
      },
      fechaPrimerPago: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 15
      },
      fechaSegundoPago: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 30
      },
      porcentajeSeguroSocial: {
        type: Sequelize.DECIMAL,
        allowNull: false,
        defaultValue: 0.00
      },
      porcentajeImpuestoSobreRenta: {
        type: Sequelize.DECIMAL,
        allowNull: false,
        defaultValue: 0.00
      },
      activo: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
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
    await queryInterface.dropTable('ConfiguracionNomina');
  }
};
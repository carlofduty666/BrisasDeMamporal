'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ConfiguracionPagos', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,

      },
      porcentajeMora: {
        type: Sequelize.DECIMAL(5,2),
        allowNull: false,
        defaultValue: 0
      },
      diasGracia: {
        type: Sequelize.INTEGER
      },
      descuentoProntoPago: {
        type: Sequelize.DECIMAL(5,2),
        allowNull: false,
        defaultValue: 0.00
      },
      fechaCorte: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 5
      },
      recordatoriosPago: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      stripePublicKey: {
        type: Sequelize.STRING,
        allowNull: true
      },
      stripeSecretKey: {
        type: Sequelize.STRING,
        allowNull: true
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
    await queryInterface.dropTable('ConfiguracionPagos');
  }
};
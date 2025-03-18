'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Liquidaciones', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      personaID: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Personas',
          key: 'id'
        }
      },
      fechaInicio: {
        type: Sequelize.DATE,
        allowNull: false

      },
      fechaFin: {
        type: Sequelize.DATE,
        allowNull: false
      },
      motivo: {
        type: Sequelize.ENUM('renuncia', 'despido', 'terminacionContrato', 'otro'),
        allowNull: false,
        defaultValue: 'otro'
      },
      annosServicio: {
        type: Sequelize.DECIMAL,
        allowNull: false
      },
      sueldoPromedio: {
        type: Sequelize.DECIMAL,
        allowNull: false,
        defaultValue: 0
      },
      prestacionesSociales: {
        type: Sequelize.DECIMAL,
        allowNull: false,
        defaultValue: 0
      },
      bonoFinDeAnno: {
        type: Sequelize.DECIMAL,
        allowNull: false,
        defaultValue: 0
      },
      bonoVacacional: {
        type: Sequelize.DECIMAL,
        allowNull: false,
        defaultValue: 0
      },
      vacacionesPendientes: {
        type: Sequelize.DECIMAL,
        allowNull: false,
        defaultValue: 0
      },
      diasVacacionesPendientes: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      otrosBeneficios: {
        type: Sequelize.DECIMAL
      },
      totalLiquidacion: {
        type: Sequelize.DECIMAL,
        allowNull: false,
        defaultValue: 0
      },
      observaciones: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      estado: {
        type: Sequelize.ENUM('pendiente', 'pagado', 'anulado'),
        allowNull: false,
        defaultValue: 'pendiente'
      },
      fechaPago: {
        type: Sequelize.DATE,
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
    await queryInterface.dropTable('Liquidaciones');
  }
};
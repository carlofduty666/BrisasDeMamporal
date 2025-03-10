'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('PagoEmpleados', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      nominaID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Nominas',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      personaID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Personas',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      montoBruto: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      montoNeto: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      totalDeducciones: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      totalAsignaciones: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
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
    await queryInterface.dropTable('PagoEmpleados');
  }
};
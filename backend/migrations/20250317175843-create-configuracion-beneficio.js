'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ConfiguracionBeneficios', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      nombre: {
        type: Sequelize.STRING,
      },
      tipo: {
        type: Sequelize.ENUM('cestaticket', 'responsabilidad', 'puntualidad', 'finDeAño', 'vacacional', 'prestaciones', 'otro'),
        defaultValue: 'otro'
      },
      valorBase: {
        type: Sequelize.DECIMAL
      },
      porcentajeSueldo: {
        type: Sequelize.DECIMAL,
        defaultValue: 0
      },
      aplicaA: {
        type: Sequelize.ENUM('todos', 'profesor', 'administrativo', 'obrero'),
        defaultValue: 'todos'
      },
      formula: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Fórmula para cálculos complejos'
      },
      activo: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      descripcion: {
        type: Sequelize.TEXT,
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
    await queryInterface.dropTable('ConfiguracionBeneficios');
  }
};
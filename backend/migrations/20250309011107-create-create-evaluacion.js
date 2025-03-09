'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Evaluaciones', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      nombreEvaluacion: {
        type: Sequelize.STRING,
        allowNull: false
      },
      tipoEvaluacion: {
        type: Sequelize.STRING,
        allowNull: false
      },
      porcentaje: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      lapso: {
        type: Sequelize.ENUM('1', '2', '3'),
        allowNull: false
      },
      materiaID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Materias',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
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
    await queryInterface.dropTable('Evaluaciones');
  }
};
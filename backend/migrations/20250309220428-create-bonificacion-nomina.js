'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('BonificacionNomina', {
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
          model: 'Nomina',
          key: 'id'
        }
      },
      nombre: {
        type: Sequelize.STRING,
        allowNull: false
      },
      monto: {
        type: Sequelize.DECIMAL(10,2),
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
    await queryInterface.dropTable('BonificacionNomina');
  }
};
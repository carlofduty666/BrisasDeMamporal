'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Cupos', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      gradoID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Grados',
          key: 'id'
        }
      },
      seccionID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Secciones',
          key: 'id'
        }
      },
      annoEscolarID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'AnnoEscolar',
          key: 'id'
        }
      },
      capacidad: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 30
      },
      ocupados: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      disponibles: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 30
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
    await queryInterface.dropTable('Cupos');
  }
};
'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('NotasLapsos', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      estudianteID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Personas',
          key: 'id'
        }
      },
      materiaID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Materias',
          key: 'id'
        }
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
      lapso: {
        type: Sequelize.ENUM('1', '2', '3'),
        allowNull: false
      },
      notaFinal: {
        type: Sequelize.FLOAT,
        allowNull: false,
        validate: {
          min: 0,
          max: 20
        }
      },
      observaciones: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      fechaRegistro: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
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
    await queryInterface.dropTable('NotasLapsos');
  }
};
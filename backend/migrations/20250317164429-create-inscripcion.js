'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Inscripciones', {
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
      representanteID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Personas',
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
      fechaInscripcion: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      estado: {
        type: Sequelize.ENUM('pendiente', 'inscrito', 'retirado', 'graduado'),
        allowNull: false,
        defaultValue: 'pendiente'
      },
      documentosCompletos: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      pagoInscripcionCompletado: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      observaciones: {
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
    await queryInterface.dropTable('Inscripciones');
  }
};
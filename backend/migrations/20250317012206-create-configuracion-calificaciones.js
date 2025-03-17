'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ConfiguracionCalificaciones', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
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
        allowNull: true, // Puede ser null para configuración global
        references: {
          model: 'Grados',
          key: 'id'
        }
      },
      ponderacionLapso1: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 33.33,
        validate: {
          min: 0,
          max: 100
        }
      },
      ponderacionLapso2: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 33.33,
        validate: {
          min: 0,
          max: 100
        }
      },
      ponderacionLapso3: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 33.34,
        validate: {
          min: 0,
          max: 100
        }
      },
      notaMinima: {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 10.0,
        validate: {
          min: 0,
          max: 20
        }
      },
      redondearNotas: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      decimalesRedondeo: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
        validate: {
          min: 0,
          max: 2
        }
      },
      aprobarPorLapsos: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      minimoLapsosAprobados: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 2,
        validate: {
          min: 1,
          max: 3
        }
      },
      permitirRecuperacion: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      notaMaximaRecuperacion: {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 10.0,
        validate: {
          min: 0,
          max: 20
        }
      },
      descripcion: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      fechaCreacion: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
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
    await queryInterface.dropTable('ConfiguracionCalificaciones');
  }
};
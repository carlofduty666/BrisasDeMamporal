'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ArchivosEvaluaciones', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      evaluacionID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Evaluaciones',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      archivoURL: {
        type: Sequelize.STRING,
        allowNull: false
      },
      nombreArchivo: {
        type: Sequelize.STRING,
        allowNull: false
      },
      tipoArchivo: {
        type: Sequelize.STRING,
        allowNull: false
      },
      tamanoArchivo: {
        type: Sequelize.INTEGER,
        allowNull: false
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
    await queryInterface.dropTable('ArchivosEvaluaciones');
  }
};
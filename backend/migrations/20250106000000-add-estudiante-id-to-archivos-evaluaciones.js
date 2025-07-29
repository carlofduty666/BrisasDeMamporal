'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('ArchivosEvaluaciones', 'estudianteID', {
      type: Sequelize.INTEGER,
      allowNull: true, // Puede ser null para archivos del profesor
      references: {
        model: 'Personas',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('ArchivosEvaluaciones', 'estudianteID');
  }
};
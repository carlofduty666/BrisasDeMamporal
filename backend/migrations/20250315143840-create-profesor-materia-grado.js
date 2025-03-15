'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Profesor_Materia_Grados', {
profesorID: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'Personas',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
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
    gradoID: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'Grados',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    annoEscolarID: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'AnnoEscolar',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Profesor_Materia_Grados');
  }
};
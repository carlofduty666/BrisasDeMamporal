'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     */
    await queryInterface.changeColumn('Profesor_Materia_Grados', 'gradoID', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Grados',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     */
    await queryInterface.changeColumn('Profesor_Materia_Grados', 'gradoID', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'Grados',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });
  }
};
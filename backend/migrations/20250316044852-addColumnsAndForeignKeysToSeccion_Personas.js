'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.addColumn('Seccion_Personas', 'rol', {
      type: Sequelize.ENUM('estudiante', 'profesor'),
      allowNull: false,
      defaultValue: 'estudiante'
    })
    await queryInterface.addColumn('Seccion_Personas', 'materiaID', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Materias',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    })
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn('Seccion_Personas', 'rol');
    await queryInterface.removeColumn('Seccion_Personas', 'materiaID')

  }
};

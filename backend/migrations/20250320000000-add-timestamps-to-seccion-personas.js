'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Seccion_Personas', 'createdAt', {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.fn('NOW')
    });

    await queryInterface.addColumn('Seccion_Personas', 'updatedAt', {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.fn('NOW')
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Seccion_Personas', 'createdAt');
    await queryInterface.removeColumn('Seccion_Personas', 'updatedAt');
  }
};
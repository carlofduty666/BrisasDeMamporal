'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Solo cambiar nullabilidad; no tocar FKs para evitar errno 150
    await queryInterface.changeColumn('PagoEstudiantes', 'metodoPagoID', {
      type: Sequelize.INTEGER,
      allowNull: true
    });

    await queryInterface.changeColumn('PagoEstudiantes', 'arancelID', {
      type: Sequelize.INTEGER,
      allowNull: true
    });
  },

  async down(queryInterface, Sequelize) {
    // Revertir nullabilidad si se deshace
    await queryInterface.changeColumn('PagoEstudiantes', 'metodoPagoID', {
      type: Sequelize.INTEGER,
      allowNull: false
    });

    await queryInterface.changeColumn('PagoEstudiantes', 'arancelID', {
      type: Sequelize.INTEGER,
      allowNull: false
    });
  }
};
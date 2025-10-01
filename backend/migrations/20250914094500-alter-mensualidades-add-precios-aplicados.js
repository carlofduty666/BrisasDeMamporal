'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Mensualidades', 'precioAplicadoUSD', { type: Sequelize.DECIMAL(10,2), allowNull: true });
    await queryInterface.addColumn('Mensualidades', 'precioAplicadoVES', { type: Sequelize.DECIMAL(14,2), allowNull: true });
    await queryInterface.addColumn('Mensualidades', 'tasaAplicadaMes', { type: Sequelize.DECIMAL(12,6), allowNull: true });
    await queryInterface.addColumn('Mensualidades', 'porcentajeMoraAplicado', { type: Sequelize.DECIMAL(5,2), allowNull: true });
    await queryInterface.addColumn('Mensualidades', 'fechaCorteAplicada', { type: Sequelize.INTEGER, allowNull: true });
    await queryInterface.addColumn('Mensualidades', 'configCongelada', { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false });
    await queryInterface.addColumn('Mensualidades', 'moraAplicadaVES', { type: Sequelize.DECIMAL(14,2), allowNull: true });
    await queryInterface.addColumn('Mensualidades', 'moraAplicadaUSD', { type: Sequelize.DECIMAL(10,2), allowNull: true });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Mensualidades', 'moraAplicadaUSD');
    await queryInterface.removeColumn('Mensualidades', 'moraAplicadaVES');
    await queryInterface.removeColumn('Mensualidades', 'configCongelada');
    await queryInterface.removeColumn('Mensualidades', 'fechaCorteAplicada');
    await queryInterface.removeColumn('Mensualidades', 'porcentajeMoraAplicado');
    await queryInterface.removeColumn('Mensualidades', 'tasaAplicadaMes');
    await queryInterface.removeColumn('Mensualidades', 'precioAplicadoVES');
    await queryInterface.removeColumn('Mensualidades', 'precioAplicadoUSD');
  }
};
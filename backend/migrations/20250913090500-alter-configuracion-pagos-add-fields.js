'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('ConfiguracionPagos', 'precioMensualidad', { type: Sequelize.DECIMAL(10,2), allowNull: false, defaultValue: 0 });
    await queryInterface.addColumn('ConfiguracionPagos', 'politicaPrecio', { type: Sequelize.STRING, allowNull: false, defaultValue: 'retroactivo' });
    await queryInterface.addColumn('ConfiguracionPagos', 'topeMoraPorcentaje', { type: Sequelize.DECIMAL(5,2), allowNull: false, defaultValue: 20.00 });
    await queryInterface.addColumn('ConfiguracionPagos', 'vigenciaDesde', { type: Sequelize.DATEONLY, allowNull: true });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('ConfiguracionPagos', 'precioMensualidad');
    await queryInterface.removeColumn('ConfiguracionPagos', 'politicaPrecio');
    await queryInterface.removeColumn('ConfiguracionPagos', 'topeMoraPorcentaje');
    await queryInterface.removeColumn('ConfiguracionPagos', 'vigenciaDesde');
  }
};
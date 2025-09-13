"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Agregar columnas USD/VES si no existen
    await queryInterface.addColumn("ConfiguracionPagos", "precioMensualidadUSD", { type: Sequelize.DECIMAL(10,2), allowNull: false, defaultValue: 0 });
    await queryInterface.addColumn("ConfiguracionPagos", "precioMensualidadVES", { type: Sequelize.DECIMAL(14,2), allowNull: false, defaultValue: 0 });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("ConfiguracionPagos", "precioMensualidadUSD");
    await queryInterface.removeColumn("ConfiguracionPagos", "precioMensualidadVES");
  }
};
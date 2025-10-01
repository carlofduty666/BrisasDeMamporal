"use strict";

/**
 * Migration: Remove legacy topeMoraPorcentaje from ConfiguracionPagos
 * Keeps schema aligned with current model (which does not use this column).
 */

module.exports = {
  async up(queryInterface, Sequelize) {
    // Check column existence before removing to avoid failing in environments where it was already dropped
    const table = await queryInterface.describeTable("ConfiguracionPagos");
    if (table && Object.prototype.hasOwnProperty.call(table, "topeMoraPorcentaje")) {
      await queryInterface.removeColumn("ConfiguracionPagos", "topeMoraPorcentaje");
    }
  },

  async down(queryInterface, Sequelize) {
    // Recreate the column with a reasonable definition if rollback is needed
    const table = await queryInterface.describeTable("ConfiguracionPagos");
    if (!table || !Object.prototype.hasOwnProperty.call(table, "topeMoraPorcentaje")) {
      await queryInterface.addColumn("ConfiguracionPagos", "topeMoraPorcentaje", {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
        defaultValue: null,
        comment: "Porcentaje máximo de mora (obsoleto)"
      });
    }
  }
};
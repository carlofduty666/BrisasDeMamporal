"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Agregar columnas startMonth y endMonth al año escolar
    await queryInterface.addColumn("AnnoEscolar", "startMonth", {
      type: Sequelize.TINYINT,
      allowNull: true,
      defaultValue: 9, // Septiembre por defecto
      comment: "Mes de inicio del ciclo escolar (1-12). Por defecto: Septiembre (9)."
    });

    await queryInterface.addColumn("AnnoEscolar", "endMonth", {
      type: Sequelize.TINYINT,
      allowNull: true,
      defaultValue: 7, // Julio por defecto
      comment: "Mes de fin del ciclo escolar (1-12). Por defecto: Julio (7)."
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("AnnoEscolar", "endMonth");
    await queryInterface.removeColumn("AnnoEscolar", "startMonth");
  }
};
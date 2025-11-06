'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Usuarios', 'estado', {
      type: Sequelize.ENUM('activo', 'suspendido', 'desactivado', 'inactivo'),
      defaultValue: 'activo',
      allowNull: false,
      comment: 'Estado del usuario: activo, suspendido, desactivado, inactivo'
    });

    // Actualizar todos los usuarios existentes a "activo"
    await queryInterface.sequelize.query(
      "UPDATE `Usuarios` SET `estado` = 'activo' WHERE `estado` IS NULL"
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Usuarios', 'estado');
  }
};
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
    await queryInterface.changeColumn('Inscripciones', 'estado', {
      type: Sequelize.ENUM('pendiente', 'inscrito', 'retirado', 'graduado','aprobado', 'rechazado'),
      allowNull: false,
      defaultValue: 'pendiente'
    });
    await queryInterface.addColumn('Inscripciones', 'pagado', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.changeColumn('Inscripciones', 'estado', {
      type: Sequelize.ENUM('pendiente', 'inscrito', 'retirado', 'graduado'),
      allowNull: false,
      defaultValue: 'pendiente'
    });
    await queryInterface.removeColumn('Inscripciones', 'pagado');
  }
};

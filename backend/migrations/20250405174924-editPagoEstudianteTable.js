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
    await queryInterface.removeColumn('PagoEstudiantes', 'stripeSessionID');
    await queryInterface.removeColumn('PagoEstudiantes', 'stripePaymentID');
    await queryInterface.removeColumn('PagoEstudiantes', 'fechaVencimiento');
    // Modificar la columna de estado
    await queryInterface.changeColumn('PagoEstudiantes', 'estado', {
      type: Sequelize.ENUM('pendiente', 'pagado', 'anulado'),
      defaultValue: 'pendiente'
    });
    await queryInterface.addColumn('PagoEstudiantes', 'urlComprobante', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('PagoEstudiantes', 'nombreArchivo', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('PagoEstudiantes', 'tipoArchivo', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('PagoEstudiantes', 'tamanoArchivo', {
      type: Sequelize.INTEGER,
      allowNull: true
    });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.addColumn('PagoEstudiantes', 'stripeSessionID', {
      type: Sequelize.STRING,
      allowNull: true
    });
    
    await queryInterface.addColumn('PagoEstudiantes', 'stripePaymentID', {
      type: Sequelize.STRING,
      allowNull: true
    });
    
    await queryInterface.addColumn('PagoEstudiantes', 'fechaVencimiento', {
      type: Sequelize.DATE,
      allowNull: true
    });
    
    await queryInterface.changeColumn('PagoEstudiantes', 'estado', {
      type: Sequelize.ENUM('pendiente', 'pagado', 'vencido', 'anulado'),
      defaultValue: 'pendiente'
    });
    
    await queryInterface.removeColumn('PagoEstudiantes', 'urlComprobante');
    await queryInterface.removeColumn('PagoEstudiantes', 'nombreArchivo');
    await queryInterface.removeColumn('PagoEstudiantes', 'tipoArchivo');
    await queryInterface.removeColumn('PagoEstudiantes', 'tamanoArchivo');
  }
};

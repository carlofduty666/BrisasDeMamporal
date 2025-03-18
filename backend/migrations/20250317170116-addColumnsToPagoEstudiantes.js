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
    await queryInterface.addColumn('PagoEstudiantes', 'montoMora', {
      type: Sequelize.DECIMAL,
      allowNull: true,
      defaultValue: 0
    });

    await queryInterface.addColumn('PagoEstudiantes', 'descuento', {
      type: Sequelize.DECIMAL,
      allowNull: true,
      defaultValue: 0
    });

    await queryInterface.addColumn('PagoEstudiantes', 'montoTotal', {
      type: Sequelize.DECIMAL,
      allowNull: true
    });

    await queryInterface.addColumn('PagoEstudiantes', 'mesPago', {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.addColumn('PagoEstudiantes', 'fechaVencimiento', {
      type: Sequelize.DATE,
      allowNull: true
    });

    await queryInterface.addColumn('PagoEstudiantes', 'estado', {
      type: Sequelize.ENUM('pendiente', 'pagado', 'vencido', 'anulado'),
      defaultValue: 'pendiente',
      allowNull: false
    });

    await queryInterface.addColumn('PagoEstudiantes', 'comprobante', {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.addColumn('PagoEstudiantes', 'stripeSessionID', {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.addColumn('PagoEstudiantes', 'inscripcionID', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Inscripciones',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    await queryInterface.addColumn('PagoEstudiantes', 'annoEscolarID', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'AnnoEscolar',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    await queryInterface.addColumn('PagoEstudiantes', 'observaciones', {
      type: Sequelize.TEXT,
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
    await queryInterface.removeColumn('PagoEstudiantes', 'montoMora');
    await queryInterface.removeColumn('PagoEstudiantes', 'descuento');
    await queryInterface.removeColumn('PagoEstudiantes', 'montoTotal');
    await queryInterface.removeColumn('PagoEstudiantes', 'mesPago');
    await queryInterface.removeColumn('PagoEstudiantes', 'fechaVencimiento');
    await queryInterface.removeColumn('PagoEstudiantes', 'estado');
    await queryInterface.removeColumn('PagoEstudiantes', 'comprobante');
    await queryInterface.removeColumn('PagoEstudiantes', 'stripeSessionID');
    await queryInterface.removeColumn('PagoEstudiantes', 'inscripcionID');
    await queryInterface.removeColumn('PagoEstudiantes', 'annoEscolarID');
    await queryInterface.removeColumn('PagoEstudiantes', 'observaciones');
  }
};

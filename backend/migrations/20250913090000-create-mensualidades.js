'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Mensualidades', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      estudianteID: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'Personas', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      representanteID: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'Personas', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      inscripcionID: { type: Sequelize.INTEGER, allowNull: true, references: { model: 'Inscripciones', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' },
      annoEscolarID: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'AnnoEscolar', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      arancelID: { type: Sequelize.INTEGER, allowNull: true, references: { model: 'Aranceles', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' },
      mes: { type: Sequelize.INTEGER, allowNull: false },
      anio: { type: Sequelize.INTEGER, allowNull: true },
      montoBase: { type: Sequelize.DECIMAL(10,2), allowNull: false, defaultValue: 0 },
      moraAcumulada: { type: Sequelize.DECIMAL(10,2), allowNull: false, defaultValue: 0 },
      estado: { type: Sequelize.ENUM('pendiente','reportado','pagado','anulado'), allowNull: false, defaultValue: 'pendiente' },
      pagoID: { type: Sequelize.INTEGER, allowNull: true, references: { model: 'PagoEstudiantes', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' },
      fechaVencimiento: { type: Sequelize.DATE, allowNull: true },
      observacionAdmin: { type: Sequelize.TEXT, allowNull: true },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE }
    });
    await queryInterface.addConstraint('Mensualidades', {
      fields: ['estudianteID','annoEscolarID','mes'],
      type: 'unique',
      name: 'unique_mensualidad_por_mes_estudiante_anno'
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Mensualidades');
  }
};
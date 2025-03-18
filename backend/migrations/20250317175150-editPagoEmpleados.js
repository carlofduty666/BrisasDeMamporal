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
    await queryInterface.addColumn('PagoEmpleados', 'sueldoBase', {
      type: Sequelize.DECIMAL,
      allowNull: false,
      defaultValue: 0
    })
    await queryInterface.addColumn('PagoEmpleados', 'cestaticket', {
      type: Sequelize.DECIMAL,
      allowNull: false,
      defaultValue: 0
    })
    await queryInterface.addColumn('PagoEmpleados', 'bonoResponsabilidad', {
      type: Sequelize.DECIMAL,
      allowNull: false,
      defaultValue: 0
    })
    await queryInterface.addColumn('PagoEmpleados', 'bonoPuntualidad', {
      type: Sequelize.DECIMAL,
      allowNull: false,
      defaultValue: 0
    })
    await queryInterface.addColumn('PagoEmpleados', 'bonoFinDeAnno', {
      type: Sequelize.DECIMAL,
      allowNull: false,
      defaultValue: 0
    })
    await queryInterface.addColumn('PagoEmpleados', 'bonoVacacional', {
      type: Sequelize.DECIMAL,
      allowNull: false,
      defaultValue: 0
    })
    await queryInterface.addColumn('PagoEmpleados', 'prestacionesSociales', {
      type: Sequelize.DECIMAL,
      allowNull: false,
      defaultValue: 0
    })
    await queryInterface.addColumn('PagoEmpleados', 'vacaciones', {
      type: Sequelize.DECIMAL,
      allowNull: false,
      defaultValue: 0
    })
    await queryInterface.addColumn('PagoEmpleados', 'diasVacaciones', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    })
    await queryInterface.addColumn('PagoEmpleados', 'observaciones', {
      type: Sequelize.TEXT,
      allowNull: true
    })
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn('PagoEmpleados', 'sueldoBase')
    await queryInterface.removeColumn('PagoEmpleados', 'cestaticket')
    await queryInterface.removeColumn('PagoEmpleados', 'bonoResponsabilidad')
    await queryInterface.removeColumn('PagoEmpleados', 'bonoPuntualidad')
    await queryInterface.removeColumn('PagoEmpleados', 'bonoFinDeAnno')
    await queryInterface.removeColumn('PagoEmpleados', 'bonoVacacional')
    await queryInterface.removeColumn('PagoEmpleados', 'prestacionesSociales')
    await queryInterface.removeColumn('PagoEmpleados', 'vacaciones')
    await queryInterface.removeColumn('PagoEmpleados', 'diasVacaciones')
    await queryInterface.removeColumn('PagoEmpleados', 'observaciones')
    
  }
};

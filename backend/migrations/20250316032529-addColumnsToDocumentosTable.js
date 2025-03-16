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
    await queryInterface.addColumn('Documentos', 'nombre_archivo', {
      type: Sequelize.STRING,
      allowNull: false
    });
    await queryInterface.addColumn('Documentos', 'tamano', {
      type: Sequelize.INTEGER,
      allowNull: false
    });
    await queryInterface.addColumn('Documentos', 'tipo_archivo', {
      type: Sequelize.STRING,
      allowNull: false
    });
    await queryInterface.addColumn('Documentos', 'descripcion', {
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
    await queryInterface.removeColumn('Documentos', 'nombre_archivo');
    await queryInterface.removeColumn('Documentos', 'tamano');
    await queryInterface.removeColumn('Documentos', 'tipo_archivo');
    await queryInterface.removeColumn('Documentos', 'descripcion');
    
  }
};

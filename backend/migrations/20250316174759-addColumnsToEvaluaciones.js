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
    // await queryInterface.addColumn('Evaluaciones', 'gradoID', {
    //   type: Sequelize.INTEGER,
    //   allowNull: false,
    //   references: {
    //     model: 'Grados',
    //     key: 'id'
    //   }
    // })
    // await queryInterface.addColumn('Evaluaciones', 'seccionID', {
    //   type: Sequelize.INTEGER,
    //   allowNull: false,
    //   references: {
    //     model: 'Secciones',
    //     key: 'id'
    //   }
    // })
    // await queryInterface.addColumn('Evaluaciones', 'profesorID', {
    //   type: Sequelize.INTEGER,
    //   allowNull: false,
    //   references: {
    //     model: 'Personas',
    //     key: 'id'
    //   }
    // })
    // await queryInterface.addColumn('Evaluaciones', 'annoEscolarID', {
    //   type: Sequelize.INTEGER,
    //   allowNull: false,
    //   references: {
    //     model: 'AnnoEscolar',
    //     key: 'id'
    //   }
    // })
    // await queryInterface.addColumn('Evaluaciones', 'descripcion', {
    //   type: Sequelize.TEXT,
    //   allowNull: true
    // })
    // await queryInterface.addColumn('Evaluaciones', 'fechaEvaluacion', {
    //   type: Sequelize.DATE,
    //   allowNull: true
    // })
    // await queryInterface.addColumn('Evaluaciones', 'requiereEntrega', {
    //   type: Sequelize.BOOLEAN,
    //   allowNull: false,
    //   defaultValue: false
    // });
    // await queryInterface.addColumn('Evaluaciones', 'fechaLimiteEntrega', {
    //   type: Sequelize.DATE,
    //   allowNull: true
    // });
    // await queryInterface.addColumn('Evaluaciones', 'archivoURL', {
    //   type: Sequelize.STRING,
    //   allowNull: true
    // })
    // await queryInterface.addColumn('Evaluaciones', 'nombreArchivo', {
    //   type: Sequelize.STRING,
    //   allowNull: true
    // })
    // await queryInterface.addColumn('Evaluaciones', 'tipoArchivo', {
    //   type: Sequelize.STRING,
    //   allowNull: true
    // });
    // await queryInterface.addColumn('Evaluaciones', 'tipoArchivo', {
    //   type: Sequelize.STRING,
    //   allowNull: true
    // });
    // await queryInterface.addColumn('Evaluaciones', 'tamanoArchivo', {
    //   type: Sequelize.INTEGER,
    //   allowNull: true
    // })
      
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    // await queryInterface.removeColumn('Evaluaciones', 'gradoID')
    // await queryInterface.removeColumn('Evaluaciones', 'seccionID')
    // await queryInterface.removeColumn('Evaluaciones', 'profesorID')
    // await queryInterface.removeColumn('Evaluaciones', 'annoEscolarID')
    // await queryInterface.removeColumn('Evaluaciones', 'descripcion')
    // await queryInterface.removeColumn('Evaluaciones', 'fechaEvaluacion')
    // await queryInterface.removeColumn('Evaluaciones', 'requiereEntrega')
    // await queryInterface.removeColumn('Evaluaciones', 'fechaLimiteEntrega')
    // await queryInterface.removeColumn('Evaluaciones', 'archivoURL')
    // await queryInterface.removeColumn('Evaluaciones', 'nombreArchivo')
    // await queryInterface.removeColumn('Evaluaciones', 'tipoArchivo')
    // await queryInterface.removeColumn('Evaluaciones', 'tamanoArchivo')
  }
};

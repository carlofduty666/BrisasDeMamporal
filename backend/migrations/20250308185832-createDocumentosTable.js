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
    await queryInterface.createTable('Documentos', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      tipoDocumento: {
        type: Sequelize.ENUM(
          'cedula',
          'partidaNacimiento',
          'boletin',
          'notasCertificadas',
          'fotoCarnet',
          'fotoCarta',
          'boletaRetiroPlantel',
          'constanciaTrabajo',
          'solvenciaPago',
          'foniatrico',
          'psicomental',
          'certificadoSalud',
          'curriculumVitae',
          'constanciaEstudio6toSemestre',
          'titulo'
        ),
        allowNull: false
      },
      urlDocumento: {
        type: Sequelize.STRING,
        allowNull: false
      },
      personaID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Personas',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
    await queryInterface.addIndex('Documentos', ['personaID', 'tipoDocumento'], {
      unique: true,
      name: 'unique_persona_documentos'
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Documentos');
    await queryInterface.removeIndex('Documentos', 'unique_persona_documentos')
  }
};

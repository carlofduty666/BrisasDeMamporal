'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Documentos extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Documentos.belongsTo(models.Personas, { // Nombre del modelo al que se relaciona
        foreignKey: 'personaID', // Nombre de la clave foránea en la tabla Documentos
        as: 'persona' // Nombre de la relación en la tabla Persona
      })

    }
  }
  Documentos.init({
    tipoDocumento: DataTypes.ENUM(
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
    urlDocumento: DataTypes.STRING,
    personaID: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Personas',
        key: 'id'
      }
    },
    nombre_archivo: {
      type: DataTypes.STRING,
      allowNull: false
    },
    tamano: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    tipo_archivo: {
      type: DataTypes.STRING, // Para almacenar el MIME type (ej: application/pdf)
      allowNull: false
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Documentos',
  });
  return Documentos;
};
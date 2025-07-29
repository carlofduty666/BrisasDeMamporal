'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ArchivosEvaluaciones extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      ArchivosEvaluaciones.belongsTo(models.Evaluaciones, {
        foreignKey: 'evaluacionID',
        as: 'Evaluacion'
      });
      ArchivosEvaluaciones.belongsTo(models.Personas, {
        foreignKey: 'estudianteID',
        as: 'Estudiante'
      });
    }
  }
  ArchivosEvaluaciones.init({
    evaluacionID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Evaluaciones',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    estudianteID: {
      type: DataTypes.INTEGER,
      allowNull: true, // Puede ser null para archivos del profesor
      references: {
        model: 'Personas',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    archivoURL: {
      type: DataTypes.STRING,
      allowNull: false
    },
    nombreArchivo: {
      type: DataTypes.STRING,
      allowNull: false
    },
    tipoArchivo: {
      type: DataTypes.STRING,
      allowNull: false
    },
    tamanoArchivo: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'ArchivosEvaluaciones',
  });
  return ArchivosEvaluaciones;
};
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Grado_Personas extends Model {
    static associate(models) {
      Grado_Personas.belongsTo(models.AnnoEscolar, {
        foreignKey: 'annoEscolarID',
        as: 'annoEscolar'
      });
      Grado_Personas.belongsTo(models.Grados, {
        foreignKey: 'gradoID',
        as: 'grado'
      });
      Grado_Personas.belongsTo(models.Personas, {
        foreignKey: 'personaID',
        as: 'persona'
      });
    }
  }
  
  // este modelo es solo para añadir estudiantes a grados, el modelo para añadir profesores a grados es Profesor_Materia_Grados
  Grado_Personas.init({
    gradoID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'Grados',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    personaID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'Personas',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE' 
    },
    annoEscolarID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'AnnoEscolar',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    tipo: {
      type: DataTypes.ENUM('estudiante'),
      allowNull: false,
      defaultValue: 'estudiante'
    }
  }, {
    sequelize,
    modelName: 'Grado_Personas',
    timestamps: false
  });

  return Grado_Personas;
};

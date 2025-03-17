'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Calificaciones extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Calificaciones.belongsTo(models.Evaluaciones, {
        foreignKey: 'evaluacionID',
        as: 'Evaluaciones'
      })
      Calificaciones.belongsTo(models.Personas, {
        foreignKey: 'personaID',
        as: 'Personas'
      })
      Calificaciones.belongsTo(models.AnnoEscolar, {
        foreignKey: 'annoEscolarID',
        as: 'AnnoEscolar'
      });
    }
  }
  Calificaciones.init({
    calificacion: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        min: 0,
        max: 20 // Asumiendo escala de 0-20
      }
    },
    evaluacionID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Evaluaciones',
        key: 'id'
      }
    },
    personaID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Personas',
        key: 'id'
      }
    },
    annoEscolarID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'AnnoEscolar',
        key: 'id'
      }
    },
    observaciones: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    fechaRegistro: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'Calificaciones',
  });
  return Calificaciones;
};
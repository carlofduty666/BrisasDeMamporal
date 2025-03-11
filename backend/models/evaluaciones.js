'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Evaluaciones extends Model {
    static associate(models) {
      Evaluaciones.belongsTo(models.Materias, {
        foreignKey: 'materiaID',
        as: 'Materias'
      });
      // Corregimos el nombre del modelo a 'Evaluaciones'
      Evaluaciones.hasMany(models.Calificaciones, {
        foreignKey: 'evaluacionID',
        as: 'Calificaciones'
      });
    }
  }
  
  Evaluaciones.init({
    nombreEvaluacion: DataTypes.STRING,
    tipoEvaluacion: DataTypes.STRING,
    porcentaje: DataTypes.FLOAT,
    lapso: DataTypes.ENUM('1', '2', '3'),
    materiaID: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Evaluaciones',
  });
  
  return Evaluaciones;
};


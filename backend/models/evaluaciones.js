'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Evaluaciones extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Evaluaciones.belongsTo(models.Materias, {
        foreignKey: 'materiaID',
        as: 'Materia'
      })
      Evaluaciones.hasMany(models.Calificacion, {
        foreignKey: 'evaluacionID',
        as: 'Calificaciones'
      })
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
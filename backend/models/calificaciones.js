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
        as: 'Evaluacion'
      })
      Calificaciones.belongsTo(models.Persona, {
        foreignKey: 'personaID',
        as: 'Persona'
      })
    }
  }
  Calificaciones.init({
    calificacion: DataTypes.FLOAT,
    evaluacionID: DataTypes.INTEGER,
    personaID: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Calificaciones',
  });
  return Calificaciones;
};
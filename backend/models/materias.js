'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Materias extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Materias.belongsTo(models.Grado, {
        foreignKey: 'gradoID',
        as: 'Grado'
      })
      Materias.hasMany(models.Evaluacion, {
        foreignKey: 'materiaID',
        as: 'Evaluaciones'
      })
    }
  }
  Materias.init({
    asignatura: DataTypes.STRING,
    gradoID: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Materias',
  });
  return Materias;
};
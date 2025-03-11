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
      Materias.belongsTo(models.Grados, {
        foreignKey: 'gradoID',
        as: 'Grados'
      });
      Materias.hasMany(models.Evaluaciones, {  // Cambiamos 'Evaluacion' por 'Evaluaciones'
        foreignKey: 'materiaID',
        as: 'Evaluaciones'
      });
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
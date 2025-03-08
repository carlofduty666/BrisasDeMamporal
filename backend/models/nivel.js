'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Nivel extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Nivel.hasMany(models.Grado, {
        foreignKey: 'nivelID',
        as: 'grados'
      })
    }
  }
  Nivel.init({
    nombre_nivel: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Nivel',
  });
  return Nivel;
};
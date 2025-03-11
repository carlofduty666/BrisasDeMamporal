'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Niveles extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Niveles.hasMany(models.Grados, {
        foreignKey: 'nivelID',
        as: 'grados'
      })
    }
  }
  Niveles.init({
    nombre_nivel: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Niveles',
  });
  return Niveles;
};
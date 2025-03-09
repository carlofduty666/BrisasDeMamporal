'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class MetodoPago extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      MetodoPago.hasMany(models.PagoEstudiante, {
        foreignKey: 'MetodoPagoID',
        as: 'pagos'
      })
    }
  }
  MetodoPago.init({
    nombre: DataTypes.STRING,
    activo: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'MetodoPago',
  });
  return MetodoPago;
};
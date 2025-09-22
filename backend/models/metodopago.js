'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class MetodoPagos extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // Nota: en PagoEstudiantes la columna es 'metodoPagoID' (camelCase, m minúscula)
      MetodoPagos.hasMany(models.PagoEstudiantes, {
        foreignKey: 'metodoPagoID',
        as: 'pagos'
      })
    }
  }
  MetodoPagos.init({
    nombre: DataTypes.STRING,
    activo: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'MetodoPagos',
  });
  return MetodoPagos;
};
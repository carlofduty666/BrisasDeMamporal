'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Arancel extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Arancel.hasMany(models.PagoEstudiante, {
        foreignKey: 'arancelID',
        as: 'pagos'
      })
    }
  }
  Arancel.init({
    nombre: DataTypes.STRING,
    monto: DataTypes.DECIMAL,
    descripcion: DataTypes.STRING,
    activo: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Arancel',
  });
  return Arancel;
};
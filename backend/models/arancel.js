'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Aranceles extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Aranceles.hasMany(models.PagoEstudiantes, {
        foreignKey: 'arancelID',
        as: 'pagos'
      })
    }
  }
  Aranceles.init({
    nombre: DataTypes.STRING,
    monto: DataTypes.DECIMAL,
    descripcion: DataTypes.STRING,
    activo: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Aranceles',
  });
  return Aranceles;
};
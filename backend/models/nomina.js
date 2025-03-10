'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Nomina extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Nomina.hasMany(models.PagoEmpleado, {
        foreignKey: 'nominaID',
        as: 'pagos'
      });
      Nomina.hasMany(models.DeduccionNomina, {
        foreignKey: 'nominaID',
        as: 'deducciones'
      });
      Nomina.hasMany(models.BonificacionNomina, {
        foreignKey: 'nominaID',
        as: 'bonificaciones'
      });
    }

  }
  Nomina.init({
    periodoPago: DataTypes.STRING,
    fechaPago: DataTypes.DATE,
    descripcion: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Nomina',
  });
  return Nomina;
};
'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PagoEmpleados extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      PagoEmpleados.belongsTo(models.Nomina, {
        foreignKey: 'nominaID',
        as: 'nomina'
      });
      PagoEmpleados.belongsTo(models.Personas, {
        foreignKey: 'personaID',
        as: 'personas'
      });
    }
  }
  PagoEmpleados.init({
    nominaID: DataTypes.INTEGER,
    personaID: DataTypes.INTEGER,
    montoBruto: DataTypes.DECIMAL,
    montoNeto: DataTypes.DECIMAL,
    totalDeducciones: DataTypes.DECIMAL,
    totalAsignaciones: DataTypes.DECIMAL
  }, {
    sequelize,
    modelName: 'PagoEmpleados',
  });
  return PagoEmpleados;
};
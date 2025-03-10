'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PagoEmpleado extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      PagoEmpleado.belongsTo(models.Nomina, {
        foreignKey: 'nominaID',
        as: 'nomina'
      });
      PagoEmpleado.belongsTo(models.Persona, {
        foreignKey: 'personaID',
        as: 'persona'
      });
    }
  }
  PagoEmpleado.init({
    nominaID: DataTypes.INTEGER,
    personaID: DataTypes.INTEGER,
    montoBruto: DataTypes.DECIMAL,
    montoNeto: DataTypes.DECIMAL,
    totalDeducciones: DataTypes.DECIMAL,
    totalAsignaciones: DataTypes.DECIMAL
  }, {
    sequelize,
    modelName: 'PagoEmpleado',
  });
  return PagoEmpleado;
};
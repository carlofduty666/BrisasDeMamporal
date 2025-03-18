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
      // Podríamos agregar relaciones para bonificaciones y deducciones específicas
      PagoEmpleados.hasMany(models.BonificacionNomina, {
        foreignKey: 'personaID',
        sourceKey: 'personaID',
        as: 'bonificaciones'
      });
      PagoEmpleados.hasMany(models.DeduccionNomina, {
        foreignKey: 'personaID',
        sourceKey: 'personaID',
        as: 'deducciones'
      });
    }
  }
  PagoEmpleados.init({
    nominaID: DataTypes.INTEGER,
    personaID: DataTypes.INTEGER,
    sueldoBase: DataTypes.DECIMAL,
    cestaticket: DataTypes.DECIMAL,
    bonoResponsabilidad: DataTypes.DECIMAL,
    bonoPuntualidad: DataTypes.DECIMAL,
    bonoFinDeAño: DataTypes.DECIMAL,
    bonoVacacional: DataTypes.DECIMAL,
    prestacionesSociales: DataTypes.DECIMAL,
    vacaciones: DataTypes.DECIMAL,
    diasVacaciones: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    montoBruto: DataTypes.DECIMAL,
    montoNeto: DataTypes.DECIMAL,
    totalDeducciones: DataTypes.DECIMAL,
    totalAsignaciones: DataTypes.DECIMAL,
    observaciones: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'PagoEmpleados',
  });
  return PagoEmpleados;
};
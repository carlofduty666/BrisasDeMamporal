'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Liquidaciones extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Liquidaciones.belongsTo(models.Personas, {
        foreignKey: 'personaID',
        as: 'persona'
      });
    }
  }
  Liquidaciones.init({
    personaID: DataTypes.INTEGER,
    fechaInicio: DataTypes.DATE,
    fechaFin: DataTypes.DATE,
    motivo: {
      type: DataTypes.ENUM('renuncia', 'despido', 'terminacionContrato', 'otro'),
      defaultValue: 'otro'
    },
    añosServicio: DataTypes.DECIMAL,
    sueldoPromedio: DataTypes.DECIMAL,
    prestacionesSociales: DataTypes.DECIMAL,
    bonoFinDeAño: DataTypes.DECIMAL,
    bonoVacacional: DataTypes.DECIMAL,
    vacacionesPendientes: DataTypes.DECIMAL,
    diasVacacionesPendientes: DataTypes.INTEGER,
    otrosBeneficios: DataTypes.DECIMAL,
    totalLiquidacion: DataTypes.DECIMAL,
    observaciones: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    estado: {
      type: DataTypes.ENUM('pendiente', 'pagado', 'anulado'),
      defaultValue: 'pendiente'
    },
    fechaPago: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Liquidaciones',
  });
  return Liquidaciones;
};
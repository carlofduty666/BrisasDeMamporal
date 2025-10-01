'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ConfiguracionPagos extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  ConfiguracionPagos.init({
    // Compatibilidad: precioMensualidad (obsoleto). Mantener mientras migramos
    precioMensualidad: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: false,
      defaultValue: 0
    },
    // Nuevos campos independientes
    precioMensualidadUSD: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: false,
      defaultValue: 0
    },
    precioMensualidadVES: {
      type: DataTypes.DECIMAL(14,2),
      allowNull: false,
      defaultValue: 0
    },
    politicaPrecio: { // 'retroactivo' | 'congelado'
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'retroactivo'
    },
    porcentajeMora: { // porcentaje fijo en % (no diario)
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 5.00
    },
    diasGracia: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    descuentoProntoPago: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    fechaCorte: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 5
    },
    recordatoriosPago: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    vigenciaDesde: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    // Texto libre para instrucciones de pago (cuentas bancarias, pago móvil, horarios, etc.)
    instruccionesPago: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    stripePublicKey: {
      type: DataTypes.STRING,
      allowNull: true
    },
    stripeSecretKey: {
      type: DataTypes.STRING,
      allowNull: true
    },
    activo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  }, {
    sequelize,
    modelName: 'ConfiguracionPagos',
    tableName: 'ConfiguracionPagos',
  });
  return ConfiguracionPagos;
};
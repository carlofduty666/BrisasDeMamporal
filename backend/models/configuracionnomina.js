'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ConfiguracionNomina extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  ConfiguracionNomina.init({
    diasQuincena: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 15
    },
    fechaPrimerPago: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 15
    },
    fechaSegundoPago: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 30
    },
    porcentajeSeguroSocial: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    porcentajeImpuestoSobreRenta: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    activo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  }, {
    sequelize,
    modelName: 'ConfiguracionNomina',
  });
  return ConfiguracionNomina;
};
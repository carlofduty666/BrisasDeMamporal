'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ConfiguracionBeneficios extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  ConfiguracionBeneficios.init({
    nombre: DataTypes.STRING,
    tipo: {
      type: DataTypes.ENUM('cestaticket', 'responsabilidad', 'puntualidad', 'finDeAño', 'vacacional', 'prestaciones', 'otro'),
      defaultValue: 'otro'
    },
    valorBase: DataTypes.DECIMAL,
    porcentajeSueldo: {
      type: DataTypes.DECIMAL,
      defaultValue: 0
    },
    aplicaA: {
      type: DataTypes.ENUM('todos', 'profesor', 'administrativo', 'obrero'),
      defaultValue: 'todos'
    },
    formula: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Fórmula para cálculos complejos'
    },
    activo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'ConfiguracionBeneficios',
  });
  return ConfiguracionBeneficios;
};
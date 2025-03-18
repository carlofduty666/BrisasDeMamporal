'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class BonificacionNomina extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      BonificacionNomina.belongsTo(models.Nomina, {
        foreignKey: 'nominaID',
        as: 'nomina'
      });
      BonificacionNomina.belongsTo(models.Personas, {
        foreignKey: 'personaID',
        as: 'persona',
        allowNull: true
      });
    }
  }
  BonificacionNomina.init({
    nominaID: DataTypes.INTEGER,
    personaID: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    nombre: DataTypes.STRING,
    tipo: {
      type: DataTypes.ENUM('cestaticket', 'responsabilidad', 'puntualidad', 'finDeAño', 'vacacional', 'otro'),
      defaultValue: 'otro'
    },
    monto: DataTypes.DECIMAL,
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'BonificacionNomina',
    tableName: 'BonificacionNomina'
  });
  return BonificacionNomina;
};
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
    }
  }
  BonificacionNomina.init({
    nominaID: DataTypes.INTEGER,
    nombre: DataTypes.STRING,
    monto: DataTypes.DECIMAL
  }, {
    sequelize,
    modelName: 'BonificacionNomina',
    tableName: 'BonificacionNomina'
  });
  return BonificacionNomina;
};
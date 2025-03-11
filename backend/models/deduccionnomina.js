'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class DeduccionNomina extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      DeduccionNomina.belongsTo(models.Nomina, {
        foreignKey: 'nominaID',
        as: 'nomina'
      });
    }
  }
  DeduccionNomina.init({
    nominaID: DataTypes.INTEGER,
    nombre: DataTypes.STRING,
    monto: DataTypes.DECIMAL
  }, {
    sequelize,
    modelName: 'DeduccionNomina',
    tableName: 'DeduccionNomina',
    freezeTableName: true
  });
  return DeduccionNomina;
};
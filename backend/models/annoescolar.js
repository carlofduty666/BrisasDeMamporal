'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class AnnoEscolar extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  AnnoEscolar.init({
    periodo: DataTypes.STRING,
    activo: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'AnnoEscolar',
    tableName: 'AnnoEscolar', // Asegúrate de que el nombre de la tabla sea correcto
    freezeTableName: true
  });
  return AnnoEscolar;
};
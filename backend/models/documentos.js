'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Documentos extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Documentos.belongsTo(models.Persona, { // Nombre del modelo al que se relaciona
        foreignKey: 'personaID', // Nombre de la clave foránea en la tabla Documentos
        as: 'persona' // Nombre de la relación en la tabla Persona
      })

    }
  }
  Documentos.init({
    tipoDocumento: DataTypes.ENUM,
    urlDocumento: DataTypes.STRING,
    personaID: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Persona',
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'Documentos',
  });
  return Documentos;
};
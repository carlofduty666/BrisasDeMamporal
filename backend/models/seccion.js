'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Secciones extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Secciones.belongsTo(models.Grados, {
        foreignKey: 'gradoID',
        as: 'Grados'
      })
      Secciones.belongsToMany(models.Personas, {
        through: 'Seccion_Personas', // es necesario crear esta tabla intermedia para la relación muchos a muchos
        foreignKey: 'seccionID', // 
        as: 'personas', // nombre de la relación en la tabla Persona
      })
    }
  }
  Secciones.init({
    nombre_seccion: DataTypes.STRING,
    gradoID: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Secciones',
  });
  return Secciones;
};
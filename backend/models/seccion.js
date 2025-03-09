'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Seccion extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Seccion.belongsTo(models.Grado, {
        foreignKey: 'gradoID',
        as: 'Grado'
      })
      Seccion.belongsToMany(models.Persona, {
        through: 'SeccionPersona', // es necesario crear esta tabla intermedia para la relación muchos a muchos
        foreignKey: 'seccionID', // 
        as: 'personas', // nombre de la relación en la tabla Persona
      })
    }
  }
  Seccion.init({
    nombre_seccion: DataTypes.STRING,
    gradoID: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Seccion',
  });
  return Seccion;
};
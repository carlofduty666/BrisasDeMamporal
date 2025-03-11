'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Grados extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Grados.belongsTo(models.Niveles, {
        foreignKey: 'nivelID',
        as: 'Niveles'
      });
      Grados.hasMany(models.Secciones, {
        foreignKey: 'gradoID',
        as: 'Secciones'
      });
      Grados.hasMany(models.Materias, {
        foreignKey: 'gradoID',
        as: 'Materias'
      })
      Grados.belongsToMany(models.Personas, {
        through: 'Grado_Personas', // es necesario crear esta tabla intermedia para la relación muchos a muchos
        foreignKey: 'gradoID',
        as: 'personas', // nombre de la relación en la tabla Persona
      })
    }
  }
  Grados.init({
    nombre_grado: DataTypes.STRING,
    nivelID: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Grados',
  });
  return Grados;
};
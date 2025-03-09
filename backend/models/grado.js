'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Grado extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Grado.belongsTo(models.Nivel, {
        foreignKey: 'nivelID',
        as: 'Nivel'
      });
      Grado.hasMany(models.Seccion, {
        foreignKey: 'gradoID',
        as: 'Secciones'
      });
      Grado.hasMany(models.Materia, {
        foreignKey: 'gradoID',
        as: 'Materias'
      })
      Grado.belongsToMany(models.Persona, {
        through: 'Grado_Persona', // es necesario crear esta tabla intermedia para la relación muchos a muchos
        foreignKey: 'gradoID',
        as: 'personas', // nombre de la relación en la tabla Persona
      })
    }
  }
  Grado.init({
    nombre_grado: DataTypes.STRING,
    nivelID: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Grado',
  });
  return Grado;
};
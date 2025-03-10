'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Persona extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Persona.hasMany(models.Documentos, {
        foreignKey: 'personaID',
        as: 'documentos'
      });
      Persona.belongsToMany(models.Seccion, {
        through: 'SeccionPersona',
        foreignKey: 'personaID',
        as: 'secciones',
      });
      Persona.belongsToMany(models.Grado, {
        through: 'GradoPersona',
        foreignKey: 'personaID',
        as: 'grados',
      });
      Persona.hasMany(models.Pago, {
        foreignKey: 'personaID',
        as: 'pagos'
      });
      Persona.hasMany(models.PagoEstudiante, {
        foreignKey: 'estudianteID',
        as: 'pagosEstudiante'
      })
      Persona.hasMany(models.PagoEstudiante, { 
        foreignKey: 'representanteID', 
        as: 'pagosRealizados'
      });
      Persona.hasMany(models.GradoPersona, {
        foreignKey: 'personaID',
        as: 'gradoPersona'
      });
    }
  }
  Persona.init({
    nombre: DataTypes.STRING,
    apellido: DataTypes.STRING,
    cedula: DataTypes.STRING,
    fechaNacimiento: DataTypes.DATE,
    telefono: DataTypes.STRING,
    email: DataTypes.STRING,
    tipo: DataTypes.ENUM,
    username: DataTypes.STRING,
    password: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Persona',
  });
  return Persona;
};
'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Roles extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Roles.belongsToMany(models.Personas, {
        through: 'Persona_Roles',
        foreignKey: 'rolID',
        otherKey: 'personaID',
        as: 'personas'
      });
    }
  }
  Roles.init({
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    descripcion: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Roles'
  });
  return Roles;
};
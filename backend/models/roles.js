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
      // define association here
      Roles.belongsToMany(models.Personas, {
        through: 'Persona_Roles',
        foreignKey: 'rolID',
        otherKey: 'personaID',
        as: 'personas'
      });

      // Many-to-Many con Permisos
      Roles.belongsToMany(models.Permiso, {
        through: 'Rol_Permisos',
        foreignKey: 'rolID',
        otherKey: 'permisoID',
        as: 'permisos'
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
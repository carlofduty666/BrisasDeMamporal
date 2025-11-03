'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Rol_Permiso extends Model {
    static associate(models) {
      // Relación directa a Permiso
      Rol_Permiso.belongsTo(models.Permiso, {
        foreignKey: 'permisoID',
        as: 'permiso'
      });

      // Relación directa a Roles
      Rol_Permiso.belongsTo(models.Roles, {
        foreignKey: 'rolID',
        as: 'rol'
      });
    }
  }

  Rol_Permiso.init({
    rolID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Roles',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    permisoID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Permisos',
        key: 'id'
      },
      onDelete: 'CASCADE'
    }
  }, {
    sequelize,
    modelName: 'Rol_Permiso',
    tableName: 'Rol_Permisos',
    timestamps: false,
    id: false,
    primaryKey: ['rolID', 'permisoID']
  });

  return Rol_Permiso;
};
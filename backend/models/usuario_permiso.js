'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Usuario_Permiso extends Model {
    static associate(models) {
      // Relación directa a Permiso
      Usuario_Permiso.belongsTo(models.Permiso, {
        foreignKey: 'permisoID',
        as: 'permiso'
      });

      // Relación directa a Usuarios
      Usuario_Permiso.belongsTo(models.Usuarios, {
        foreignKey: 'usuarioID',
        as: 'usuario'
      });
    }
  }

  Usuario_Permiso.init({
    usuarioID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: false,
      references: {
        model: 'Usuarios',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    permisoID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: false,
      references: {
        model: 'Permisos',
        key: 'id'
      },
      onDelete: 'CASCADE'
    }
  }, {
    sequelize,
    modelName: 'Usuario_Permiso',
    tableName: 'Usuario_Permisos',
    timestamps: false,
    id: false,
    primaryKey: ['usuarioID', 'permisoID']
  });

  return Usuario_Permiso;
};
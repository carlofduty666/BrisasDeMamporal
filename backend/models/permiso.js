'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Permiso extends Model {
    static associate(models) {
      // Many-to-Many con Usuarios a través de Usuario_Permisos
      Permiso.belongsToMany(models.Usuarios, {
        through: 'Usuario_Permisos',
        foreignKey: 'permisoID',
        otherKey: 'usuarioID',
        as: 'usuarios'
      });
    }
  }

  Permiso.init({
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    descripcion: DataTypes.TEXT,
    categoria: {
      type: DataTypes.ENUM(
        'academico',
        'estudiantes',
        'representantes',
        'profesores',
        'empleados',
        'pagos',
        'nomina',
        'reportes',
        'configuracion',
        'usuarios'
      ),
      allowNull: false
    },
    ruta: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Ruta asociada del permiso'
    }
  }, {
    sequelize,
    modelName: 'Permiso'
  });

  return Permiso;
};
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class NotificacionesUsuarios extends Model {
    static associate(models) {
      NotificacionesUsuarios.belongsTo(models.Notificaciones, {
        foreignKey: 'notificacionID',
        as: 'notificacion'
      });
      
      NotificacionesUsuarios.belongsTo(models.Personas, {
        foreignKey: 'personaID',
        as: 'persona'
      });
    }
  }

  NotificacionesUsuarios.init({
    notificacionID: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    personaID: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    leida: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    fechaLectura: {
      type: DataTypes.DATE,
      allowNull: true
    },
    emailEnviado: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    emailFechaEnvio: {
      type: DataTypes.DATE,
      allowNull: true
    },
    emailError: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'NotificacionesUsuarios',
    tableName: 'NotificacionesUsuarios',
  });

  return NotificacionesUsuarios;
};

'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Notificaciones extends Model {
    static associate(models) {
      Notificaciones.belongsTo(models.Usuarios, { 
        foreignKey: 'creadoPor', 
        as: 'creador' 
      });
      
      Notificaciones.hasMany(models.NotificacionesUsuarios, {
        foreignKey: 'notificacionID',
        as: 'notificacionesUsuarios'
      });
    }
  }

  Notificaciones.init({
    tipo: {
      type: DataTypes.ENUM(
        'grado_publicado',
        'alerta_riesgo',
        'inasistencia',
        'cambio_horario',
        'factura_generada',
        'pago_recibido',
        'pago_vencido',
        'recordatorio_pago',
        'calculo_mora',
        'cambio_seccion',
        'actualizacion_politica',
        'mantenimiento_sistema',
        'advertencia_conducta',
        'suspension',
        'reconocimiento',
        'evento_calendario',
        'reunion_convocada',
        'actividad_escolar',
        'comunicado_general',
        'emergencia',
        'otro'
      ),
      allowNull: false
    },
    titulo: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    mensaje: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    canal: {
      type: DataTypes.ENUM('email', 'in_app', 'ambos'),
      allowNull: false,
      defaultValue: 'ambos'
    },
    estado: {
      type: DataTypes.ENUM('pendiente', 'enviando', 'enviado', 'fallido'),
      allowNull: false,
      defaultValue: 'pendiente'
    },
    destinatariosTipo: {
      type: DataTypes.ENUM('todos', 'estudiantes', 'representantes', 'profesores', 'empleados', 'administradores', 'personalizado'),
      allowNull: false
    },
    destinatariosIDs: {
      type: DataTypes.JSON,
      allowNull: true
    },
    filtros: {
      type: DataTypes.JSON,
      allowNull: true
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true
    },
    colorTema: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    icono: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    creadoPor: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    fechaEnvio: {
      type: DataTypes.DATE,
      allowNull: true
    },
    totalDestinatarios: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    exitosos: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    fallidos: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    errores: {
      type: DataTypes.JSON,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Notificaciones',
    tableName: 'Notificaciones',
  });

  return Notificaciones;
};

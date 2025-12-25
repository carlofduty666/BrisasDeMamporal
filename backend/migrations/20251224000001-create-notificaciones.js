'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Notificaciones', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      tipo: {
        type: Sequelize.ENUM(
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
        type: Sequelize.STRING(255),
        allowNull: false
      },
      mensaje: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      canal: {
        type: Sequelize.ENUM('email', 'in_app', 'ambos'),
        allowNull: false,
        defaultValue: 'ambos'
      },
      estado: {
        type: Sequelize.ENUM('pendiente', 'enviando', 'enviado', 'fallido'),
        allowNull: false,
        defaultValue: 'pendiente'
      },
      destinatariosTipo: {
        type: Sequelize.ENUM('todos', 'estudiantes', 'representantes', 'profesores', 'empleados', 'administradores', 'personalizado'),
        allowNull: false
      },
      destinatariosIDs: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Array de IDs de personas cuando destinatariosTipo es personalizado'
      },
      filtros: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Filtros aplicados para seleccionar destinatarios (ej: pagos_vencidos, grado_especifico, etc)'
      },
      metadata: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Datos adicionales específicos del tipo de notificación'
      },
      colorTema: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: 'Color del tema para la notificación (ej: blue, red, green)'
      },
      icono: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: 'Nombre del icono a usar (react-icons)'
      },
      creadoPor: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Usuarios',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      fechaEnvio: {
        type: Sequelize.DATE,
        allowNull: true
      },
      totalDestinatarios: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      exitosos: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      fallidos: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      errores: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Array de errores si hubo fallas en el envío'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Notificaciones');
  }
};

'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('NotificacionesUsuarios', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      notificacionID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Notificaciones',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      personaID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Personas',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      leida: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      fechaLectura: {
        type: Sequelize.DATE,
        allowNull: true
      },
      emailEnviado: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      emailFechaEnvio: {
        type: Sequelize.DATE,
        allowNull: true
      },
      emailError: {
        type: Sequelize.TEXT,
        allowNull: true
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
    await queryInterface.dropTable('NotificacionesUsuarios');
  }
};

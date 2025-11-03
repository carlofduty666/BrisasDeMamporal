'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Usuario_Permisos', {
      usuarioID: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        references: {
          model: 'Usuarios',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      permisoID: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        references: {
          model: 'Permisos',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Usuario_Permisos');
  }
};
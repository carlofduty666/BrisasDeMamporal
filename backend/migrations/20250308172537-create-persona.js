'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.dropTable('Users');
    await queryInterface.createTable('Personas', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      nombre: {
        type: Sequelize.STRING,
        allowNull: false
      },
      apellido: {
        type: Sequelize.STRING,
        allowNull: false
      },
      cedula: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false
      },
      fechaNacimiento: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      telefono: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: true
      },
      tipo: {
        type: Sequelize.ENUM('estudiante', 'representante', 'profesor', 'administrativo', 'obrero', 'adminWeb'),
        allowNull: false
      },
      username: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: true,
        validate: {
          len: [4, 20]
        }
      },
      password: {
        type: Sequelize.STRING,
        allowNull: true,
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
    await queryInterface.dropTable('Personas');
  }
};
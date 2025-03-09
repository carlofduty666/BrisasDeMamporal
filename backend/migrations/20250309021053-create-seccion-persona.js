'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Seccion_Personas', {
      seccionID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true
      },
      personaID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true
      }
      // annoEscolarID: {
      //   type: Sequelize.INTEGER,
      //   allowNull: false,
      //   references: {
      //     model: 'AnnoEscolar',
      //     key: 'id'
      //   },
      //   onUpdate: 'CASCADE',
      //   onDelete: 'CASCADE'
      // }
      
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Seccion_Personas');
  }
};
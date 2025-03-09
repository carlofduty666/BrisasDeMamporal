'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Grado_Persona', {
      gradoID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
          model: 'Grados',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      personaID: {
        type: Sequelize.INTEGER,
          allowNull: false,
          primaryKey: true,
          references: {
            model: 'Personas',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
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
    await queryInterface.dropTable('Grado_Persona');
  }
};
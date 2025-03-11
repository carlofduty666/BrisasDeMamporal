'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.addConstraint('Seccion_Personas', {
      fields: ['personaID'],
      type: 'foreign key',
      name: 'seccion_persona_persona_id_fk',
      references: {
        table: 'Personas',
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });
    queryInterface.addConstraint('Seccion_Personas', {
      fields: ['seccionID'],
      type: 'foreign key',
      name: 'seccion_persona_seccion_id_fk',
      references: {
        table: 'Secciones',
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeConstraint('Seccion_Personas', 'seccion_persona_persona_id_fk');
  }

};

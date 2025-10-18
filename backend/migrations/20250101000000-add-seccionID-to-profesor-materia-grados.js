'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(async (transaction) => {
      // Agregar columna seccionID
      await queryInterface.addColumn(
        'Profesor_Materia_Grados',
        'seccionID',
        {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'Secciones',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        { transaction }
      );

      console.log('Columna seccionID agregada a Profesor_Materia_Grados');
    });
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn('Profesor_Materia_Grados', 'seccionID', { transaction });
    });
  }
};
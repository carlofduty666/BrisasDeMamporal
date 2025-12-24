'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // Eliminar tabla Rol_Permisos
      await queryInterface.dropTable('Rol_Permisos', { transaction });
      console.log('✅ Tabla Rol_Permisos eliminada');

      // Eliminar tabla Persona_Roles
      await queryInterface.dropTable('Persona_Roles', { transaction });
      console.log('✅ Tabla Persona_Roles eliminada');

      await transaction.commit();
      console.log('✅ Migration completada: tablas innecesarias eliminadas');
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Error en migration:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // Recrear tabla Rol_Permisos
      await queryInterface.createTable('Rol_Permisos', {
        rolID: {
          type: Sequelize.INTEGER,
          allowNull: false,
          primaryKey: true,
          references: {
            model: 'Roles',
            key: 'id'
          },
          onDelete: 'CASCADE'
        },
        permisoID: {
          type: Sequelize.INTEGER,
          allowNull: false,
          primaryKey: true,
          references: {
            model: 'Permisos',
            key: 'id'
          },
          onDelete: 'CASCADE'
        }
      }, { transaction });

      // Recrear tabla Persona_Roles
      await queryInterface.createTable('Persona_Roles', {
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
        },
        rolID: {
          type: Sequelize.INTEGER,
          allowNull: false,
          primaryKey: true,
          references: {
            model: 'Roles',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        }
      }, { transaction });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};

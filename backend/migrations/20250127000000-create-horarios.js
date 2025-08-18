'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('horarios', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      grado_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'grados',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      seccion_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'secciones',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      materia_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'materias',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      profesor_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'personas',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      dia_semana: {
        type: Sequelize.ENUM('lunes', 'martes', 'miércoles', 'jueves', 'viernes'),
        allowNull: false
      },
      hora_inicio: {
        type: Sequelize.TIME,
        allowNull: false
      },
      hora_fin: {
        type: Sequelize.TIME,
        allowNull: false
      },
      aula: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      anno_escolar_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'anno_escolar',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      activo: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    // Índices para optimizar consultas
    await queryInterface.addIndex('horarios', ['grado_id', 'seccion_id']);
    await queryInterface.addIndex('horarios', ['profesor_id', 'dia_semana', 'hora_inicio']);
    await queryInterface.addIndex('horarios', ['anno_escolar_id']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('horarios');
  }
};
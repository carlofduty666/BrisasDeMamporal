'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Actualizar valores existentes para que coincidan con el ENUM (opcional pero recomendado)
    await queryInterface.sequelize.query(`
      UPDATE Evaluaciones 
      SET tipoEvaluacion = CASE
        WHEN LOWER(tipoEvaluacion) LIKE '%examen%' THEN 'examen'
        WHEN LOWER(tipoEvaluacion) LIKE '%quiz%' THEN 'quiz'
        WHEN LOWER(tipoEvaluacion) LIKE '%tarea%' THEN 'tarea'
        WHEN LOWER(tipoEvaluacion) LIKE '%proyecto%' THEN 'proyecto'
        WHEN LOWER(tipoEvaluacion) LIKE '%participacion%' THEN 'participacion'
        ELSE 'examen'
      END
    `);

    // Cambiar tipo de la columna a ENUM
    await queryInterface.changeColumn('Evaluaciones', 'tipoEvaluacion', {
      type: Sequelize.ENUM('examen', 'quiz', 'tarea', 'proyecto', 'participacion'),
      allowNull: false
    });
  },

  async down(queryInterface, Sequelize) {
    // Revertir cambio: volver a STRING
    await queryInterface.changeColumn('Evaluaciones', 'tipoEvaluacion', {
      type: Sequelize.STRING,
      allowNull: false
    });

    // Opción: eliminar el tipo ENUM que se creó en MySQL (si es necesario)
    // Esto puede requerir un query raw según el dialecto
  }
};

const { Sequelize } = require('sequelize');
const config = require('./config/dbconfig.js').production;

// Crear una conexión a la base de datos
const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    dialect: config.dialect,
    logging: false
  }
);

// Lista de migraciones que necesitan ser marcadas como ejecutadas
const migrations = [
  '20250308185832-createDocumentosTable.js',
  '20250308195853-create-nivel.js',
  '20250308201707-create-grado.js',
  '20250308210621-create-seccion.js',
  '20250308211701-create-materias.js',
  '20250308213258-addNivelIDtoGrados.js',
  '20250309005422-addGradoIDtoSeccion.js',
  '20250309010442-changeNullOnAsignaturasToFalse.js',
  '20250309011107-create-create-evaluacion.js',
  '20250309013909-create-calificaciones.js',
  '20250309014441-create-grado-persona.js',
  '20250309021053-create-seccion-persona.js',
  '20250309143351-create-anno-escolar.js',
  '20250309143958-addAnnoEscolarIDtoGrado_Persona.js',
  '20250309144027-addAnnoEscolarIDtoSeccion_Persona.js',
  '20250309165847-create-pago-estudiante.js',
  '20250309170206-create-metodo-pago.js',
  '20250309170335-create-arancel.js',
  '20250309194634-addForeignKeyToSeccionPersonaToPersonaID.js',
  '20250309201311-addKeysforPagoEstudiante.js',
  '20250309213725-create-nomina.js',
  '20250309214342-create-pago-empleado.js',
  '20250309215211-create-deduccion-nomina.js',
  '20250309220428-create-bonificacion-nomina.js',
  '20250311050226-changeNivelesTypeToENUM.js',
  '20250314152600-create-grado-materia.js',
  '20250315143840-create-profesor-materia-grado.js',
  '20250315151433-addTipoToGradoPersona.js',
  '20250315174826-deletingGradoIdFromMaterias.js',
  '20250316012210-create-rol.js',
  '20250316013741-create-persona-roles.js',
  '20250316032529-addColumnsToDocumentosTable.js',
  '20250316043224-addColumnsAndForeignKeysToSecciones.js',
  '20250316044852-addColumnsAndForeignKeysToSeccion_Personas.js',
  '20250316174759-addColumnsToEvaluaciones.js',
  '20250316181448-addColumnsToCalificaciones.js',
  '20250316184212-addColumnsToEvaluacionesAgain.js',
  '20250316204858-create-notas-finales.js',
  '20250316211535-create-notas-definitivas.js',
  '20250317012206-create-configuracion-calificaciones.js',
  '20250317013639-create-archivos-evaluacion.js',
  '20250317163109-create-configuracion-pagos.js',
  '20250317163707-create-configuracion-nomina.js',
  '20250317164429-create-inscripcion.js',
  '20250317170116-addColumnsToPagoEstudiantes.js',
  '20250317174437-editBonificacionNomina.js',
  '20250317175150-editPagoEmpleados.js',
  '20250317175843-create-configuracion-beneficio.js',
  '20250317181402-create-liquidacion.js',
  '20250320002654-create-usuarios.js',
  '20250321142059-create-inscripciones.js',
  '20250321144728-addColumnAndEditInscripcionTable.js',
  '20250321145946-create-cupos.js',
  '20250322171529-addColumnsToPersona.js',
  '20250402144612-addTamanoArchivoToEvaluacionesTable.js',
  '20250405174924-editPagoEstudianteTable.js'
];

async function updateSequelizeMeta() {
  try {
    await sequelize.authenticate();
    console.log('Conexión establecida correctamente.');

    // Insertar cada migración en la tabla SequelizeMeta
    for (const migration of migrations) {
      try {
        await sequelize.query(`INSERT INTO SequelizeMeta (name) VALUES ('${migration}')`);
        console.log(`Migración ${migration} marcada como ejecutada.`);
      } catch (error) {
        console.error(`Error al insertar migración ${migration}:`, error.message);
      }
    }

    console.log('Proceso completado.');
  } catch (error) {
    console.error('Error al conectar con la base de datos:', error);
  } finally {
    await sequelize.close();
  }
}

updateSequelizeMeta();

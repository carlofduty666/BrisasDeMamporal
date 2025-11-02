/**
 * Script para eliminar secciones y cupos duplicados
 * 
 * Identifica secciones duplicadas (mismo nombre en mismo grado)
 * y mantiene solo la más reciente
 */

const db = require('./models');
const Secciones = db.Secciones;
const Cupo = db.Cupos;
const Grados = db.Grados;
const Seccion_Personas = db.Seccion_Personas;

async function limpiarDuplicados() {
  try {
    console.log('🔍 Analizando secciones duplicadas...\n');

    // Obtener todas las secciones
    const secciones = await Secciones.findAll({
      include: [{ model: Grados, as: 'Grados' }],
      order: [['gradoID', 'ASC'], ['nombre_seccion', 'ASC'], ['createdAt', 'DESC']]
    });

    // Agrupar por gradoID + nombre_seccion
    const duplicados = {};
    secciones.forEach(s => {
      const clave = `${s.gradoID}_${s.nombre_seccion}`;
      if (!duplicados[clave]) duplicados[clave] = [];
      duplicados[clave].push(s);
    });

    // Encontrar grupos con más de 1 sección
    const gruposDuplicados = Object.entries(duplicados).filter(([_, grupo]) => grupo.length > 1);

    if (gruposDuplicados.length === 0) {
      console.log('✅ No hay secciones duplicadas\n');
      process.exit(0);
    }

    console.log(`⚠️  Encontrados ${gruposDuplicados.length} grupo(s) de secciones duplicadas:\n`);

    let seccionesAEliminar = [];

    for (const [clave, grupo] of gruposDuplicados) {
      const [gradoID, nombreSeccion] = clave.split('_');
      console.log(`   Grado ${gradoID} - Sección ${nombreSeccion}:`);
      
      // Mantener la más reciente (primera en la lista porque ordenamos DESC por createdAt)
      const mantener = grupo[0];
      const eliminar = grupo.slice(1);

      console.log(`      ✅ Mantener: ID ${mantener.id} (creada: ${mantener.createdAt})`);
      eliminar.forEach(s => {
        console.log(`      ❌ Eliminar: ID ${s.id} (creada: ${s.createdAt})`);
        seccionesAEliminar.push(s.id);
      });
    }

    if (seccionesAEliminar.length === 0) {
      console.log('\n✅ No hay secciones para eliminar\n');
      process.exit(0);
    }

    console.log(`\n⚙️  Eliminando ${seccionesAEliminar.length} secciones duplicadas...\n`);

    // Eliminar cupos asociados a las secciones duplicadas
    const cuposEliminados = await Cupo.destroy({
      where: { seccionID: seccionesAEliminar }
    });
    console.log(`   🗑️  ${cuposEliminados} cupos eliminados`);

    // Eliminar estudiantes asociados a las secciones duplicadas
    const estudiantesEliminados = await Seccion_Personas.destroy({
      where: { seccionID: seccionesAEliminar }
    });
    console.log(`   🗑️  ${estudiantesEliminados} asociaciones estudiante-sección eliminadas`);

    // Eliminar las secciones
    const seccionesEliminadas = await Secciones.destroy({
      where: { id: seccionesAEliminar }
    });
    console.log(`   🗑️  ${seccionesEliminadas} secciones eliminadas`);

    console.log('\n✅ LIMPIEZA DE DUPLICADOS COMPLETADA\n');

    // Mostrar estado final
    console.log('📊 Estado final de secciones:\n');
    const seccionesFinales = await Secciones.findAll({
      include: [{ model: Grados, as: 'Grados', attributes: ['nombre_grado'] }],
      order: [['gradoID', 'ASC'], ['nombre_seccion', 'ASC']]
    });

    const seccionesPorGrado = {};
    seccionesFinales.forEach(s => {
      const nombreGrado = s.Grados?.nombre_grado || 'sin grado';
      if (!seccionesPorGrado[nombreGrado]) {
        seccionesPorGrado[nombreGrado] = [];
      }
      seccionesPorGrado[nombreGrado].push(s.nombre_seccion);
    });

    Object.entries(seccionesPorGrado).forEach(([grado, secciones]) => {
      console.log(`   ${grado}: ${secciones.join(', ')}`);
    });

    console.log('\n');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

limpiarDuplicados();
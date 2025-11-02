/**
 * Script para eliminar cupos duplicados (múltiples cupos para la misma sección)
 * Mantiene el cupo más reciente (última actualización)
 */

const db = require('./models');
const Cupo = db.Cupos;

async function limpiarDuplicadosCupos() {
  try {
    console.log('🔍 Buscando cupos duplicados...\n');

    // Obtener todos los cupos
    const cupos = await Cupo.findAll({
      order: [['gradoID', 'ASC'], ['seccionID', 'ASC'], ['updatedAt', 'DESC']]
    });

    // Agrupar por (gradoID + seccionID + annoEscolarID)
    const grupos = {};
    cupos.forEach(cupo => {
      const clave = `${cupo.gradoID}_${cupo.seccionID}_${cupo.annoEscolarID}`;
      if (!grupos[clave]) grupos[clave] = [];
      grupos[clave].push(cupo);
    });

    // Encontrar grupos con más de 1 cupo
    const duplicados = Object.entries(grupos).filter(([_, grupo]) => grupo.length > 1);

    if (duplicados.length === 0) {
      console.log('✅ No hay cupos duplicados\n');
      process.exit(0);
    }

    console.log(`⚠️  Encontrados ${duplicados.length} grupo(s) de cupos duplicados:\n`);

    let cuposAEliminar = [];

    for (const [clave, grupo] of duplicados) {
      const [gradoID, seccionID, annoEscolarID] = clave.split('_');
      console.log(`   Grado ${gradoID} - Sección ${seccionID}:`);
      
      // Mantener el primero (más reciente por updatedAt)
      const mantener = grupo[0];
      const eliminar = grupo.slice(1);

      console.log(`      ✅ Mantener: Cupo ID ${mantener.id} (actualizado: ${mantener.updatedAt})`);
      eliminar.forEach(c => {
        console.log(`      ❌ Eliminar: Cupo ID ${c.id} (actualizado: ${c.updatedAt})`);
        cuposAEliminar.push(c.id);
      });
    }

    console.log(`\n⚙️  Eliminando ${cuposAEliminar.length} cupos duplicados...\n`);

    // Eliminar cupos duplicados
    const cuposEliminados = await Cupo.destroy({
      where: { id: cuposAEliminar }
    });

    console.log(`🗑️  ${cuposEliminados} cupos eliminados\n`);

    // Verificación final
    console.log('📊 VERIFICACIÓN FINAL:\n');
    const cuposFinales = await Cupo.findAll({
      order: [['gradoID', 'ASC'], ['seccionID', 'ASC']]
    });

    const gruposFinales = {};
    cuposFinales.forEach(c => {
      const clave = `${c.gradoID}_${c.seccionID}`;
      if (!gruposFinales[clave]) gruposFinales[clave] = 0;
      gruposFinales[clave]++;
    });

    Object.entries(gruposFinales).forEach(([clave, cantidad]) => {
      const [gradoID, seccionID] = clave.split('_');
      console.log(`   Grado ${gradoID}, Sección ${seccionID}: ${cantidad} cupo(s)`);
      if (cantidad > 1) {
        console.log(`   ⚠️  AÚN HAY DUPLICADO`);
      }
    });

    console.log('\n✅ ✅ ✅ LIMPIEZA COMPLETADA ✅ ✅ ✅\n');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

limpiarDuplicadosCupos();
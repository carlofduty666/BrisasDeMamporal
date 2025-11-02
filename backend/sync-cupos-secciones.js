/**
 * Script para sincronizar Cupos con Secciones
 * 
 * Esto garantiza que:
 * 1. No hay cupos sin secciones (cupos huérfanos)
 * 2. Todas las secciones tienen cupos correspondientes
 * 3. Los datos en cupos coinciden con los de secciones
 */

const db = require('./models');
const Cupo = db.Cupos;
const Secciones = db.Secciones;
const Grados = db.Grados;
const AnnoEscolar = db.AnnoEscolar;

async function sincronizarCupos() {
  try {
    console.log('🔄 Iniciando sincronización de Cupos y Secciones...\n');

    // 1. OBTENER TODAS LAS SECCIONES Y CUPOS
    const secciones = await Secciones.findAll({
      attributes: ['id', 'nombre_seccion', 'gradoID', 'capacidad'],
      include: [{ model: Grados, as: 'Grados', attributes: ['id', 'nombre_grado'] }]
    });

    const cupos = await Cupo.findAll({
      attributes: ['id', 'gradoID', 'seccionID', 'annoEscolarID', 'capacidad'],
      include: [
        { model: AnnoEscolar, as: 'annoEscolar', attributes: ['id', 'periodo'] }
      ]
    });

    const annoActivo = await AnnoEscolar.findOne({ where: { activo: true } });
    if (!annoActivo) {
      console.error('❌ No hay un año académico activo');
      process.exit(1);
    }

    console.log(`📚 Secciones encontradas: ${secciones.length}`);
    console.log(`📋 Cupos encontrados: ${cupos.length}`);
    console.log(`📅 Año académico activo: ${annoActivo.periodo}\n`);

    // 2. IDENTIFICAR CUPOS HUÉRFANOS (sin secciones)
    const seccionesIds = new Set(secciones.map(s => s.id));
    const cuposHuerfanos = cupos.filter(c => !seccionesIds.has(c.seccionID));

    if (cuposHuerfanos.length > 0) {
      console.log(`\n🗑️  Cupos huérfanos encontrados: ${cuposHuerfanos.length}`);
      cuposHuerfanos.forEach(c => {
        console.log(`   ❌ Cupo ID ${c.id}: seccionID ${c.seccionID} NO EXISTE`);
      });

      // Eliminar cupos huérfanos
      const cuposHuerfanosIds = cuposHuerfanos.map(c => c.id);
      await Cupo.destroy({
        where: { id: cuposHuerfanosIds }
      });
      console.log(`   ✅ ${cuposHuerfanos.length} cupos huérfanos eliminados\n`);
    } else {
      console.log(`\n✅ No hay cupos huérfanos\n`);
    }

    // 3. CREAR CUPOS FALTANTES
    const cuposMap = new Map();
    cupos.forEach(c => {
      if (seccionesIds.has(c.seccionID)) {
        const clave = `${c.gradoID}_${c.seccionID}_${c.annoEscolarID}`;
        cuposMap.set(clave, c);
      }
    });

    let cuposCreados = 0;
    for (const seccion of secciones) {
      const clave = `${seccion.gradoID}_${seccion.id}_${annoActivo.id}`;
      
      if (!cuposMap.has(clave)) {
        console.log(`   ⚙️  Creando cupo para ${seccion.Grados.nombre_grado} - Sección ${seccion.nombre_seccion}`);
        await Cupo.create({
          gradoID: seccion.gradoID,
          seccionID: seccion.id,
          annoEscolarID: annoActivo.id,
          capacidad: seccion.capacidad,
          ocupados: 0
        });
        cuposCreados++;
      }
    }

    if (cuposCreados > 0) {
      console.log(`\n✅ ${cuposCreados} cupos nuevos creados\n`);
    } else {
      console.log(`\n✅ Todos los cupos existentes están correctamente vinculados\n`);
    }

    // 4. VERIFICAR SINCRONIZACIÓN FINAL
    console.log('\n📊 Verificación final:');
    const cuposFinales = await Cupo.findAll({
      where: { annoEscolarID: annoActivo.id },
      attributes: ['id', 'gradoID', 'seccionID', 'capacidad'],
      include: [
        { model: Secciones, as: 'Secciones', attributes: ['nombre_seccion'] },
        { model: Grados, as: 'grado', attributes: ['nombre_grado'] }
      ],
      order: [
        [{ model: Grados, as: 'grado' }, 'nombre_grado', 'ASC'],
        [{ model: Secciones, as: 'Secciones' }, 'nombre_seccion', 'ASC']
      ]
    });

    // Agrupar por grado
    const cuposPorGrado = {};
    cuposFinales.forEach(c => {
      const nombreGrado = c.grado.nombre_grado;
      if (!cuposPorGrado[nombreGrado]) {
        cuposPorGrado[nombreGrado] = [];
      }
      cuposPorGrado[nombreGrado].push(c.Secciones.nombre_seccion);
    });

    Object.entries(cuposPorGrado).forEach(([grado, secciones]) => {
      console.log(`   ${grado}: ${secciones.join(', ')}`);
    });

    console.log('\n\n✅ ✅ ✅ SINCRONIZACIÓN COMPLETADA ✅ ✅ ✅\n');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error durante la sincronización:', error);
    process.exit(1);
  }
}

// Ejecutar
sincronizarCupos();
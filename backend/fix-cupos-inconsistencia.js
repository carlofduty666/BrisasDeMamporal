/**
 * Script para sincronizar datos inconsistentes entre Cupos y Secciones
 * 
 * Si un cupo apunta a una sección, debe tener el mismo gradoID que la sección
 */

const db = require('./models');
const Cupo = db.Cupos;
const Secciones = db.Secciones;
const Grados = db.Grados;

async function sincronizarCupos() {
  try {
    console.log('🔧 SINCRONIZANDO CUPOS CON SECCIONES\n');

    // Obtener todos los cupos
    const cupos = await Cupo.findAll({
      include: [
        { 
          model: Secciones, 
          as: 'Secciones',
          attributes: ['id', 'nombre_seccion', 'gradoID', 'capacidad']
        },
        {
          model: Grados,
          as: 'grado',
          attributes: ['id', 'nombre_grado']
        }
      ]
    });

    console.log(`Total de cupos a revisar: ${cupos.length}\n`);

    let cuposActualizados = 0;
    let cuposEliminados = 0;
    const actualizaciones = [];
    const eliminaciones = [];

    for (const cupo of cupos) {
      if (!cupo.Secciones) {
        // Cupo huérfano - sin sección asociada
        console.log(`⚠️  Cupo ID ${cupo.id}: SECCIÓN NO EXISTE (seccionID=${cupo.seccionID})`);
        eliminaciones.push(cupo.id);
        continue;
      }

      const seccion = cupo.Secciones;
      const gradoIDCorrecto = seccion.gradoID;
      const capacidadCorrecta = seccion.capacidad;

      // Verificar si hay inconsistencias
      if (cupo.gradoID !== gradoIDCorrecto) {
        console.log(`🔧 Cupo ID ${cupo.id}:`);
        console.log(`   Sección: ${seccion.nombre_seccion} (ID ${seccion.id})`);
        console.log(`   ❌ gradoID actual: ${cupo.gradoID} → ✅ debe ser: ${gradoIDCorrecto}`);
        actualizaciones.push({
          id: cupo.id,
          cambios: { gradoID: gradoIDCorrecto }
        });
      }

      if (cupo.capacidad !== capacidadCorrecta) {
        if (!actualizaciones.find(a => a.id === cupo.id)) {
          console.log(`🔧 Cupo ID ${cupo.id}:`);
          console.log(`   Sección: ${seccion.nombre_seccion} (ID ${seccion.id})`);
        }
        console.log(`   ❌ capacidad actual: ${cupo.capacidad} → ✅ debe ser: ${capacidadCorrecta}`);
        
        const existente = actualizaciones.find(a => a.id === cupo.id);
        if (existente) {
          existente.cambios.capacidad = capacidadCorrecta;
        } else {
          actualizaciones.push({
            id: cupo.id,
            cambios: { capacidad: capacidadCorrecta }
          });
        }
      }
    }

    // Aplicar actualizaciones
    if (actualizaciones.length > 0) {
      console.log(`\n⚙️  Actualizando ${actualizaciones.length} cupos...\n`);
      for (const { id, cambios } of actualizaciones) {
        await Cupo.update(cambios, { where: { id } });
        cuposActualizados++;
      }
    }

    // Eliminar cupos huérfanos
    if (eliminaciones.length > 0) {
      console.log(`\n🗑️  Eliminando ${eliminaciones.length} cupos huérfanos...\n`);
      await Cupo.destroy({ where: { id: eliminaciones } });
      cuposEliminados = eliminaciones.length;
    }

    // Mostrar resumen
    console.log('\n📊 RESUMEN DE CAMBIOS:');
    console.log(`   ✅ Cupos actualizados: ${cuposActualizados}`);
    console.log(`   🗑️  Cupos eliminados: ${cuposEliminados}`);

    // Verificar estado final
    console.log('\n🔍 ESTADO FINAL DE CUPOS:\n');
    const cuposFinales = await Cupo.findAll({
      include: [
        { 
          model: Secciones, 
          as: 'Secciones',
          attributes: ['nombre_seccion']
        },
        {
          model: Grados,
          as: 'grado',
          attributes: ['nombre_grado']
        }
      ],
      order: [
        [{ model: Grados, as: 'grado' }, 'nombre_grado', 'ASC'],
        [{ model: Secciones, as: 'Secciones' }, 'nombre_seccion', 'ASC']
      ]
    });

    const cuposPorGrado = {};
    cuposFinales.forEach(c => {
      const nombreGrado = c.grado?.nombre_grado || 'SIN GRADO';
      if (!cuposPorGrado[nombreGrado]) {
        cuposPorGrado[nombreGrado] = [];
      }
      cuposPorGrado[nombreGrado].push(c.Secciones?.nombre_seccion || '?');
    });

    Object.entries(cuposPorGrado).forEach(([grado, secciones]) => {
      const seccionesUnicas = [...new Set(secciones)];
      console.log(`   ${grado}: ${seccionesUnicas.join(', ')}`);
    });

    console.log('\n✅ ✅ ✅ SINCRONIZACIÓN COMPLETADA ✅ ✅ ✅\n');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

sincronizarCupos();
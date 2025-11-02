/**
 * Script para diagnosticar el problema de cupos duplicados
 */

const db = require('./models');
const Cupo = db.Cupos;
const Secciones = db.Secciones;
const Grados = db.Grados;

async function diagnosticar() {
  try {
    console.log('🔍 DIAGNÓSTICO DE CUPOS\n');

    // Obtener TODOS los cupos con sus secciones
    const cupos = await Cupo.findAll({
      include: [
        { 
          model: Secciones, 
          as: 'Secciones',
          attributes: ['id', 'nombre_seccion', 'gradoID']
        },
        {
          model: Grados,
          as: 'grado',
          attributes: ['id', 'nombre_grado']
        }
      ],
      order: [
        [{ model: Grados, as: 'grado' }, 'nombre_grado', 'ASC'],
        ['seccionID', 'ASC']
      ]
    });

    console.log(`Total de cupos en BD: ${cupos.length}\n`);

    // Agrupar por grado
    const cuposPorGrado = {};
    cupos.forEach(c => {
      const nombreGrado = c.grado?.nombre_grado || 'SIN GRADO';
      if (!cuposPorGrado[nombreGrado]) {
        cuposPorGrado[nombreGrado] = [];
      }
      cuposPorGrado[nombreGrado].push({
        id: c.id,
        gradoID: c.gradoID,
        seccionID: c.seccionID,
        nombreSeccion: c.Secciones?.nombre_seccion || 'SIN SECCIÓN',
        seccionGradoID: c.Secciones?.gradoID || 'N/A'
      });
    });

    // Mostrar análisis por grado
    Object.entries(cuposPorGrado).forEach(([grado, cuposList]) => {
      console.log(`\n📌 ${grado}:`);
      const secciones = new Set();
      cuposList.forEach(c => {
        console.log(`   Cupo ID ${c.id}: seccionID=${c.seccionID}, nombreSeccion=${c.nombreSeccion}, seccionGradoID=${c.seccionGradoID}`);
        secciones.add(c.nombreSeccion);
      });
      console.log(`   → Secciones únicas: ${Array.from(secciones).join(', ')}`);
      if (secciones.size !== cuposList.length) {
        console.log(`   ⚠️  DUPLICADOS DETECTADOS: ${cuposList.length} cupos pero solo ${secciones.size} secciones`);
      }
    });

    console.log('\n\n📊 DETALLE DE SECCIONES EN BD:\n');
    const secciones = await Secciones.findAll({
      include: [{
        model: Grados,
        as: 'Grados',
        attributes: ['nombre_grado']
      }],
      order: [['gradoID', 'ASC'], ['nombre_seccion', 'ASC']]
    });

    const seccionesPorGrado = {};
    secciones.forEach(s => {
      const nombreGrado = s.Grados?.nombre_grado || 'SIN GRADO';
      if (!seccionesPorGrado[nombreGrado]) {
        seccionesPorGrado[nombreGrado] = [];
      }
      seccionesPorGrado[nombreGrado].push({
        id: s.id,
        nombre: s.nombre_seccion,
        capacidad: s.capacidad
      });
    });

    Object.entries(seccionesPorGrado).forEach(([grado, seccionesList]) => {
      console.log(`${grado}:`);
      seccionesList.forEach(s => {
        console.log(`   Sección ID ${s.id}: ${s.nombre} (capacidad: ${s.capacidad})`);
      });
    });

    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

diagnosticar();
const db = require('../models');

const permisosInicial = [
  // Permisos de académico
  {
    nombre: 'ver_grados',
    descripcion: 'Visualizar listado de grados',
    categoria: 'academico',
    ruta: '/admin/academico/grados'
  },
  {
    nombre: 'editar_grados',
    descripcion: 'Editar información de grados',
    categoria: 'academico',
    ruta: '/admin/academico/grados'
  },
  {
    nombre: 'ver_secciones',
    descripcion: 'Visualizar listado de secciones',
    categoria: 'academico',
    ruta: '/admin/academico/secciones'
  },
  {
    nombre: 'editar_secciones',
    descripcion: 'Editar información de secciones',
    categoria: 'academico',
    ruta: '/admin/academico/secciones'
  },
  {
    nombre: 'ver_materias',
    descripcion: 'Visualizar listado de materias',
    categoria: 'academico',
    ruta: '/admin/academico/materias'
  },
  {
    nombre: 'editar_materias',
    descripcion: 'Editar información de materias',
    categoria: 'academico',
    ruta: '/admin/academico/materias'
  },
  {
    nombre: 'ver_horarios',
    descripcion: 'Visualizar horarios',
    categoria: 'academico',
    ruta: '/admin/academico/horarios'
  },
  {
    nombre: 'editar_horarios',
    descripcion: 'Editar horarios',
    categoria: 'academico',
    ruta: '/admin/academico/horarios'
  },
  {
    nombre: 'ver_cupos',
    descripcion: 'Visualizar cupos de secciones',
    categoria: 'academico',
    ruta: '/admin/cupos'
  },
  {
    nombre: 'editar_cupos',
    descripcion: 'Editar cupos de secciones',
    categoria: 'academico',
    ruta: '/admin/cupos'
  },

  // Permisos de estudiantes
  {
    nombre: 'ver_estudiantes',
    descripcion: 'Visualizar listado de estudiantes',
    categoria: 'estudiantes',
    ruta: '/admin/estudiantes'
  },
  {
    nombre: 'editar_estudiantes',
    descripcion: 'Editar información de estudiantes',
    categoria: 'estudiantes',
    ruta: '/admin/estudiantes'
  },
  {
    nombre: 'ver_inscripciones',
    descripcion: 'Visualizar inscripciones',
    categoria: 'estudiantes',
    ruta: '/admin/inscripciones'
  },
  {
    nombre: 'editar_inscripciones',
    descripcion: 'Editar inscripciones',
    categoria: 'estudiantes',
    ruta: '/admin/inscripciones'
  },

  // Permisos de representantes
  {
    nombre: 'ver_representantes',
    descripcion: 'Visualizar listado de representantes',
    categoria: 'representantes',
    ruta: '/admin/representantes'
  },
  {
    nombre: 'editar_representantes',
    descripcion: 'Editar información de representantes',
    categoria: 'representantes',
    ruta: '/admin/representantes'
  },

  // Permisos de profesores
  {
    nombre: 'ver_profesores',
    descripcion: 'Visualizar listado de profesores',
    categoria: 'profesores',
    ruta: '/admin/profesores'
  },
  {
    nombre: 'editar_profesores',
    descripcion: 'Editar información de profesores',
    categoria: 'profesores',
    ruta: '/admin/profesores'
  },

  // Permisos de empleados
  {
    nombre: 'ver_empleados',
    descripcion: 'Visualizar listado de empleados',
    categoria: 'empleados',
    ruta: '/admin/empleados'
  },
  {
    nombre: 'editar_empleados',
    descripcion: 'Editar información de empleados',
    categoria: 'empleados',
    ruta: '/admin/empleados'
  },

  // Permisos de pagos
  {
    nombre: 'ver_pagos',
    descripcion: 'Visualizar pagos',
    categoria: 'pagos',
    ruta: '/admin/pagos'
  },
  {
    nombre: 'editar_pagos',
    descripcion: 'Editar pagos',
    categoria: 'pagos',
    ruta: '/admin/pagos'
  },
  {
    nombre: 'ver_aranceles',
    descripcion: 'Visualizar aranceles',
    categoria: 'pagos',
    ruta: '/admin/aranceles'
  },
  {
    nombre: 'editar_aranceles',
    descripcion: 'Editar aranceles',
    categoria: 'pagos',
    ruta: '/admin/aranceles'
  },

  // Permisos de nómina
  {
    nombre: 'ver_nomina',
    descripcion: 'Visualizar nómina',
    categoria: 'nomina',
    ruta: '/admin/nomina'
  },
  {
    nombre: 'editar_nomina',
    descripcion: 'Editar nómina',
    categoria: 'nomina',
    ruta: '/admin/nomina'
  },

  // Permisos de reportes
  {
    nombre: 'ver_reportes',
    descripcion: 'Visualizar reportes',
    categoria: 'reportes',
    ruta: '/admin/reportes'
  },
  {
    nombre: 'descargar_reportes',
    descripcion: 'Descargar reportes',
    categoria: 'reportes',
    ruta: '/admin/reportes'
  },

  // Permisos de configuración
  {
    nombre: 'ver_configuracion',
    descripcion: 'Visualizar configuración del sistema',
    categoria: 'configuracion',
    ruta: '/admin/configuracion'
  },
  {
    nombre: 'editar_configuracion',
    descripcion: 'Editar configuración del sistema',
    categoria: 'configuracion',
    ruta: '/admin/configuracion'
  },
  {
    nombre: 'ver_periodo_escolar',
    descripcion: 'Visualizar período escolar',
    categoria: 'configuracion',
    ruta: '/admin/periodo-escolar'
  },
  {
    nombre: 'editar_periodo_escolar',
    descripcion: 'Editar período escolar',
    categoria: 'configuracion',
    ruta: '/admin/periodo-escolar'
  },

  // Permisos de usuarios
  {
    nombre: 'ver_usuarios',
    descripcion: 'Visualizar usuarios administrativos',
    categoria: 'usuarios',
    ruta: '/admin/usuarios'
  },
  {
    nombre: 'editar_usuarios',
    descripcion: 'Editar usuarios administrativos',
    categoria: 'usuarios',
    ruta: '/admin/usuarios'
  },
  {
    nombre: 'gestionar_permisos',
    descripcion: 'Gestionar permisos de usuarios',
    categoria: 'usuarios',
    ruta: '/admin/usuarios'
  }
];

async function seedPermisos() {
  try {
    const Permiso = db.Permiso;

    // Verificar si ya existen permisos
    const existentes = await Permiso.count();
    if (existentes > 0) {
      console.log('Los permisos ya existen en la base de datos.');
      return;
    }

    // Crear permisos
    await Permiso.bulkCreate(permisosInicial);
    console.log('Permisos iniciales creados exitosamente.');
  } catch (error) {
    console.error('Error al crear permisos:', error);
  }
}

// Ejecutar si se corre directamente
if (require.main === module) {
  seedPermisos().then(() => process.exit(0));
}

module.exports = seedPermisos;
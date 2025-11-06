'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const permisos = [
      // ACADÉMICO
      {
        nombre: 'ver_dashboard',
        descripcion: 'Ver dashboard de administración',
        categoria: 'academico',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nombre: 'gestionar_cupos',
        descripcion: 'Gestionar cupos de estudiantes',
        categoria: 'academico',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nombre: 'ver_grados',
        descripcion: 'Ver lista de grados',
        categoria: 'academico',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nombre: 'editar_grados',
        descripcion: 'Editar grados',
        categoria: 'academico',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nombre: 'ver_materias',
        descripcion: 'Ver lista de materias',
        categoria: 'academico',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nombre: 'editar_materias',
        descripcion: 'Editar materias',
        categoria: 'academico',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nombre: 'ver_secciones',
        descripcion: 'Ver lista de secciones',
        categoria: 'academico',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nombre: 'editar_secciones',
        descripcion: 'Editar secciones',
        categoria: 'academico',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nombre: 'ver_horarios',
        descripcion: 'Ver horarios académicos',
        categoria: 'academico',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nombre: 'editar_horarios',
        descripcion: 'Editar horarios académicos',
        categoria: 'academico',
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // INSCRIPCIONES
      {
        nombre: 'ver_inscripciones',
        descripcion: 'Ver lista de inscripciones',
        categoria: 'estudiantes',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nombre: 'editar_inscripciones',
        descripcion: 'Editar inscripciones',
        categoria: 'estudiantes',
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // ESTUDIANTES
      {
        nombre: 'ver_estudiantes',
        descripcion: 'Ver lista de estudiantes',
        categoria: 'estudiantes',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nombre: 'editar_estudiantes',
        descripcion: 'Editar información de estudiantes',
        categoria: 'estudiantes',
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // REPRESENTANTES
      {
        nombre: 'ver_representantes',
        descripcion: 'Ver lista de representantes',
        categoria: 'representantes',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nombre: 'crear_representantes',
        descripcion: 'Crear nuevos representantes',
        categoria: 'representantes',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nombre: 'editar_representantes',
        descripcion: 'Editar representantes',
        categoria: 'representantes',
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // PROFESORES
      {
        nombre: 'ver_profesores',
        descripcion: 'Ver lista de profesores',
        categoria: 'profesores',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nombre: 'crear_profesores',
        descripcion: 'Crear nuevos profesores',
        categoria: 'profesores',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nombre: 'editar_profesores',
        descripcion: 'Editar profesores',
        categoria: 'profesores',
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // PAGOS
      {
        nombre: 'ver_aranceles',
        descripcion: 'Ver aranceles',
        categoria: 'pagos',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nombre: 'editar_aranceles',
        descripcion: 'Editar aranceles',
        categoria: 'pagos',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nombre: 'ver_pagos',
        descripcion: 'Ver lista de pagos',
        categoria: 'pagos',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nombre: 'procesar_pagos',
        descripcion: 'Procesar pagos de estudiantes',
        categoria: 'pagos',
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // EMPLEADOS
      {
        nombre: 'ver_empleados',
        descripcion: 'Ver lista de empleados',
        categoria: 'empleados',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nombre: 'crear_empleados',
        descripcion: 'Crear nuevos empleados',
        categoria: 'empleados',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nombre: 'editar_empleados',
        descripcion: 'Editar empleados',
        categoria: 'empleados',
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // CONFIGURACIÓN
      {
        nombre: 'ver_configuracion',
        descripcion: 'Ver configuración del sistema',
        categoria: 'configuracion',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nombre: 'editar_configuracion',
        descripcion: 'Editar configuración del sistema',
        categoria: 'configuracion',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nombre: 'ver_periodo_escolar',
        descripcion: 'Ver período escolar',
        categoria: 'configuracion',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nombre: 'editar_periodo_escolar',
        descripcion: 'Editar período escolar',
        categoria: 'configuracion',
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // USUARIOS
      {
        nombre: 'ver_usuarios',
        descripcion: 'Ver lista de usuarios',
        categoria: 'usuarios',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nombre: 'editar_usuarios',
        descripcion: 'Editar usuarios del sistema',
        categoria: 'usuarios',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nombre: 'gestionar_permisos',
        descripcion: 'Gestionar permisos de usuarios',
        categoria: 'usuarios',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nombre: 'cambiar_estado_usuario',
        descripcion: 'Cambiar estado de usuarios',
        categoria: 'usuarios',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await queryInterface.bulkInsert('Permisos', permisos);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Permisos', null, {});
  }
};
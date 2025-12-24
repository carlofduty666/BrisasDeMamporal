'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      const permisosData = [
        // ACADÉMICO
        {
          nombre: 'ver_dashboard',
          descripcion: 'Ver dashboard de administración',
          categoria: 'academico',
          ruta: '/admin/dashboard',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          nombre: 'gestionar_cupos',
          descripcion: 'Gestionar cupos de estudiantes',
          categoria: 'academico',
          ruta: '/admin/cupos',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          nombre: 'ver_grados',
          descripcion: 'Ver lista de grados',
          categoria: 'academico',
          ruta: '/admin/academico/grados',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          nombre: 'editar_grados',
          descripcion: 'Editar grados',
          categoria: 'academico',
          ruta: '/admin/academico/grados',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          nombre: 'ver_materias',
          descripcion: 'Ver lista de materias',
          categoria: 'academico',
          ruta: '/admin/academico/materias',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          nombre: 'editar_materias',
          descripcion: 'Editar materias',
          categoria: 'academico',
          ruta: '/admin/academico/materias',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          nombre: 'ver_secciones',
          descripcion: 'Ver lista de secciones',
          categoria: 'academico',
          ruta: '/admin/academico/secciones',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          nombre: 'editar_secciones',
          descripcion: 'Editar secciones',
          categoria: 'academico',
          ruta: '/admin/academico/secciones',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          nombre: 'ver_horarios',
          descripcion: 'Ver horarios académicos',
          categoria: 'academico',
          ruta: '/admin/academico/horarios',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          nombre: 'editar_horarios',
          descripcion: 'Editar horarios académicos',
          categoria: 'academico',
          ruta: '/admin/academico/horarios',
          createdAt: new Date(),
          updatedAt: new Date()
        },

        // ESTUDIANTES E INSCRIPCIONES
        {
          nombre: 'ver_estudiantes',
          descripcion: 'Ver lista de estudiantes',
          categoria: 'estudiantes',
          ruta: '/admin/estudiantes',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          nombre: 'editar_estudiantes',
          descripcion: 'Editar información de estudiantes',
          categoria: 'estudiantes',
          ruta: '/admin/estudiantes',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          nombre: 'ver_inscripciones',
          descripcion: 'Ver lista de inscripciones',
          categoria: 'estudiantes',
          ruta: '/admin/inscripciones',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          nombre: 'editar_inscripciones',
          descripcion: 'Editar inscripciones',
          categoria: 'estudiantes',
          ruta: '/admin/inscripciones',
          createdAt: new Date(),
          updatedAt: new Date()
        },

        // REPRESENTANTES
        {
          nombre: 'ver_representantes',
          descripcion: 'Ver lista de representantes',
          categoria: 'representantes',
          ruta: '/admin/representantes',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          nombre: 'crear_representantes',
          descripcion: 'Crear nuevos representantes',
          categoria: 'representantes',
          ruta: '/admin/representantes',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          nombre: 'editar_representantes',
          descripcion: 'Editar representantes',
          categoria: 'representantes',
          ruta: '/admin/representantes',
          createdAt: new Date(),
          updatedAt: new Date()
        },

        // PROFESORES
        {
          nombre: 'ver_profesores',
          descripcion: 'Ver lista de profesores',
          categoria: 'profesores',
          ruta: '/admin/profesores',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          nombre: 'crear_profesores',
          descripcion: 'Crear nuevos profesores',
          categoria: 'profesores',
          ruta: '/admin/profesores',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          nombre: 'editar_profesores',
          descripcion: 'Editar profesores',
          categoria: 'profesores',
          ruta: '/admin/profesores',
          createdAt: new Date(),
          updatedAt: new Date()
        },

        // EMPLEADOS
        {
          nombre: 'ver_empleados',
          descripcion: 'Ver lista de empleados',
          categoria: 'empleados',
          ruta: '/admin/empleados',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          nombre: 'crear_empleados',
          descripcion: 'Crear nuevos empleados',
          categoria: 'empleados',
          ruta: '/admin/empleados',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          nombre: 'editar_empleados',
          descripcion: 'Editar empleados',
          categoria: 'empleados',
          ruta: '/admin/empleados',
          createdAt: new Date(),
          updatedAt: new Date()
        },

        // PAGOS
        {
          nombre: 'ver_aranceles',
          descripcion: 'Ver aranceles',
          categoria: 'pagos',
          ruta: '/admin/aranceles',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          nombre: 'editar_aranceles',
          descripcion: 'Editar aranceles',
          categoria: 'pagos',
          ruta: '/admin/aranceles',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          nombre: 'ver_pagos',
          descripcion: 'Ver lista de pagos',
          categoria: 'pagos',
          ruta: '/admin/pagos',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          nombre: 'procesar_pagos',
          descripcion: 'Procesar pagos de estudiantes',
          categoria: 'pagos',
          ruta: '/admin/pagos',
          createdAt: new Date(),
          updatedAt: new Date()
        },

        // CONFIGURACIÓN
        {
          nombre: 'ver_configuracion',
          descripcion: 'Ver configuración del sistema',
          categoria: 'configuracion',
          ruta: '/admin/configuracion',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          nombre: 'editar_configuracion',
          descripcion: 'Editar configuración del sistema',
          categoria: 'configuracion',
          ruta: '/admin/configuracion',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          nombre: 'ver_periodo_escolar',
          descripcion: 'Ver período escolar',
          categoria: 'configuracion',
          ruta: '/admin/periodo-escolar',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          nombre: 'editar_periodo_escolar',
          descripcion: 'Editar período escolar',
          categoria: 'configuracion',
          ruta: '/admin/periodo-escolar',
          createdAt: new Date(),
          updatedAt: new Date()
        },

        // USUARIOS
        {
          nombre: 'ver_usuarios',
          descripcion: 'Ver lista de usuarios',
          categoria: 'usuarios',
          ruta: '/admin/usuarios',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          nombre: 'editar_usuarios',
          descripcion: 'Editar usuarios del sistema',
          categoria: 'usuarios',
          ruta: '/admin/usuarios',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          nombre: 'gestionar_permisos',
          descripcion: 'Gestionar permisos de usuarios',
          categoria: 'usuarios',
          ruta: '/admin/usuarios',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          nombre: 'cambiar_estado_usuario',
          descripcion: 'Cambiar estado de usuarios',
          categoria: 'usuarios',
          ruta: '/admin/usuarios',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      // Insertar permisos (ignorar si ya existen)
      await queryInterface.bulkInsert('Permisos', permisosData, { 
        transaction,
        ignoreDuplicates: true 
      });

      // Crear roles
      const rolesData = [
        {
          nombre: 'administrativo',
          descripcion: 'Personal administrativo con acceso a gestión académica y administrativa',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          nombre: 'profesor',
          descripcion: 'Profesores con acceso a sus clases y estudiantes',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          nombre: 'representante',
          descripcion: 'Representantes con acceso a información de sus representados',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      await queryInterface.bulkInsert('Roles', rolesData, { 
        transaction,
        ignoreDuplicates: true 
      });

      await transaction.commit();
      console.log('✅ Permisos y roles inicializados correctamente');
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Error en seeder:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.bulkDelete('Roles', null, { transaction });
      await queryInterface.bulkDelete('Permisos', null, { transaction });
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};

const db = require('../models');

async function seedRolesPermisos() {
  try {
    const { Roles, Permiso } = db;

    // Obtener todos los permisos
    const todosLosPermisos = await Permiso.findAll();
    
    if (todosLosPermisos.length === 0) {
      console.log('No hay permisos en la base de datos. Ejecuta primero el seeder de permisos.');
      return;
    }

    // Crear roles
    const roles = [
      {
        nombre: 'administrativo',
        descripcion: 'Personal administrativo con acceso a gestión académica y administrativa'
      },
      {
        nombre: 'profesor',
        descripcion: 'Profesores con acceso a sus clases y estudiantes'
      },
      {
        nombre: 'representante',
        descripcion: 'Representantes con acceso a información de sus representados'
      }
    ];

    for (const rolData of roles) {
      const [rol, created] = await Roles.findOrCreate({
        where: { nombre: rolData.nombre },
        defaults: rolData
      });
      console.log(`Rol ${created ? 'creado' : 'encontrado'}: ${rol.nombre}`);

      // Asignar permisos según el rol
      if (rol.nombre === 'administrativo') {
        // Administrativos tienen todos los permisos excepto configuración
        const permisosAdministrativo = todosLosPermisos.filter(p => 
          p.categoria !== 'configuracion' && p.categoria !== 'usuarios'
        );
        await rol.setPermisos(permisosAdministrativo, { through: { timestamps: false } });
        console.log(`  - ${permisosAdministrativo.length} permisos asignados`);
      } else if (rol.nombre === 'profesor') {
        // Profesores solo ven académico y estudiantes (lectura)
        const permisosProfesor = todosLosPermisos.filter(p => 
          (p.categoria === 'academico' || p.categoria === 'estudiantes') && 
          p.nombre.startsWith('ver_')
        );
        await rol.setPermisos(permisosProfesor, { through: { timestamps: false } });
        console.log(`  - ${permisosProfesor.length} permisos asignados`);
      } else if (rol.nombre === 'representante') {
        // Representantes solo ven información de sus hijos
        const permisosRepresentante = todosLosPermisos.filter(p => 
          p.nombre === 'ver_estudiantes' || p.nombre === 'ver_pagos'
        );
        await rol.setPermisos(permisosRepresentante, { through: { timestamps: false } });
        console.log(`  - ${permisosRepresentante.length} permisos asignados`);
      }
    }

    console.log('Roles y permisos creados exitosamente.');
  } catch (error) {
    console.error('Error al crear roles y permisos:', error);
  }
}

// Ejecutar si se corre directamente
if (require.main === module) {
  seedRolesPermisos().then(() => process.exit(0));
}

module.exports = seedRolesPermisos;

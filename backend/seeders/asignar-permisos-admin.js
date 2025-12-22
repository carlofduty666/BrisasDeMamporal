const db = require('../models');

async function asignarPermisosAdmin() {
  try {
    // Usar query directa para insertar permisos sin timestamps
    const permisos = await db.Permiso.findAll({
      where: {
        categoria: {
          [db.Sequelize.Op.notIn]: ['configuracion', 'usuarios']
        }
      }
    });

    if (permisos.length === 0) {
      console.log('No hay permisos disponibles');
      return;
    }

    // Obtener el rol administrativo
    const rolAdmin = await db.Roles.findOne({ where: { nombre: 'administrativo' } });
    
    if (!rolAdmin) {
      console.log('No existe el rol administrativo');
      return;
    }

    // Eliminar permisos existentes
    await db.sequelize.query(
      'DELETE FROM Rol_Permisos WHERE rolID = ?',
      {
        replacements: [rolAdmin.id],
        type: db.Sequelize.QueryTypes.DELETE
      }
    );

    // Insertar permisos uno por uno
    for (const permiso of permisos) {
      await db.sequelize.query(
        'INSERT INTO Rol_Permisos (rolID, permisoID) VALUES (?, ?)',
        {
          replacements: [rolAdmin.id, permiso.id],
          type: db.Sequelize.QueryTypes.INSERT
        }
      );
    }

    console.log(`✓ ${permisos.length} permisos asignados al rol administrativo`);
    console.log('✓ Permisos asignados exitosamente');

  } catch (error) {
    console.error('Error al asignar permisos:', error);
  }
}

// Ejecutar si se corre directamente
if (require.main === module) {
  asignarPermisosAdmin().then(() => process.exit(0));
}

module.exports = asignarPermisosAdmin;

const db = require('./models');

const run = async () => {
  try {
    console.log('=== VERIFICAR ROLES ===');
    const roles = await db.Roles.findAll();
    console.log('Roles:', roles.map(r => ({ id: r.id, nombre: r.nombre })));

    console.log('\n=== VERIFICAR PERMISOS ===');
    const permisos = await db.Permiso.findAll();
    console.log('Permisos:', permisos.length, permisos.slice(0, 3).map(p => ({ id: p.id, nombre: p.nombre })));

    console.log('\n=== VERIFICAR ROL_PERMISOS ===');
    const rolPermisos = await db.Rol_Permiso.findAll({
      attributes: ['rolID', 'permisoID']
    });
    console.log('Rol_Permisos count:', rolPermisos.length);

    console.log('\n=== VERIFICAR USUARIO_PERMISOS ===');
    const usuarioPermisos = await db.Usuario_Permiso.findAll({
      attributes: ['usuarioID', 'permisoID']
    });
    console.log('Usuario_Permisos count:', usuarioPermisos.length);

    console.log('\n=== VERIFICAR USUARIOS CON PERSONAS ===');
    const usuarios = await db.Usuarios.findAll({
      include: [{
        model: db.Personas,
        as: 'persona',
        attributes: ['tipo', 'nombre']
      }],
      limit: 5
    });
    console.log('Usuarios sample:');
    usuarios.forEach(u => {
      console.log(`  - ID: ${u.id}, Email: ${u.email}, Tipo: ${u.persona?.tipo}`);
    });

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    process.exit(0);
  }
};

run();
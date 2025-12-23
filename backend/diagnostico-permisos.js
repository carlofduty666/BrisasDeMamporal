const db = require('./models');

async function diagnosticar() {
  try {
    console.log('🔍 Iniciando diagnóstico de permisos...\n');

    // 1. Verificar tabla Usuario_Permisos
    console.log('1️⃣ Verificando tabla Usuario_Permisos...');
    const [results] = await db.sequelize.query(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE() 
      AND table_name = 'Usuario_Permisos'
    `);
    
    if (results[0].count === 0) {
      console.log('❌ La tabla Usuario_Permisos NO existe');
    } else {
      console.log('✅ La tabla Usuario_Permisos existe');
      
      // Mostrar estructura
      const [estructura] = await db.sequelize.query('DESCRIBE Usuario_Permisos');
      console.log('\n📋 Estructura de la tabla:');
      console.table(estructura);
    }

    // 2. Verificar permisos en la base de datos
    console.log('\n2️⃣ Verificando permisos en la base de datos...');
    const permisos = await db.Permiso.findAll({
      attributes: ['id', 'nombre', 'categoria'],
      order: [['categoria', 'ASC'], ['nombre', 'ASC']]
    });
    
    console.log(`\n✅ Total de permisos: ${permisos.length}`);
    
    // Agrupar por categoría
    const porCategoria = {};
    permisos.forEach(p => {
      if (!porCategoria[p.categoria]) {
        porCategoria[p.categoria] = 0;
      }
      porCategoria[p.categoria]++;
    });
    
    console.log('\n📊 Permisos por categoría:');
    console.table(porCategoria);

    // 3. Verificar duplicados
    console.log('\n3️⃣ Verificando permisos duplicados...');
    const [duplicados] = await db.sequelize.query(`
      SELECT nombre, COUNT(*) as count 
      FROM Permisos 
      GROUP BY nombre 
      HAVING count > 1
    `);
    
    if (duplicados.length > 0) {
      console.log('⚠️  Permisos duplicados encontrados:');
      console.table(duplicados);
    } else {
      console.log('✅ No hay permisos duplicados');
    }

    // 4. Verificar usuarios
    console.log('\n4️⃣ Verificando usuarios...');
    const usuarios = await db.Usuarios.findAll({
      include: [{
        model: db.Personas,
        as: 'persona',
        attributes: ['nombre', 'apellido', 'tipo']
      }],
      attributes: ['id', 'email']
    });
    
    console.log(`\n✅ Total de usuarios: ${usuarios.length}`);

    // 5. Verificar permisos asignados a usuarios
    console.log('\n5️⃣ Verificando permisos asignados a usuarios...');
    const [asignaciones] = await db.sequelize.query(`
      SELECT 
        u.id as usuarioID,
        u.email,
        p.nombre as nombrePersona,
        p.tipo,
        COUNT(up.permisoID) as totalPermisos
      FROM Usuarios u
      INNER JOIN Personas p ON u.personaID = p.id
      LEFT JOIN Usuario_Permisos up ON u.id = up.usuarioID
      GROUP BY u.id, u.email, p.nombre, p.tipo
      ORDER BY totalPermisos DESC
    `);
    
    console.log('\n📊 Permisos asignados por usuario:');
    console.table(asignaciones);

    // 6. Probar inserción directa
    console.log('\n6️⃣ Probando inserción directa en Usuario_Permisos...');
    const primerUsuario = usuarios[0];
    const primerPermiso = permisos[0];
    
    if (primerUsuario && primerPermiso) {
      console.log(`\nIntentando asignar permiso "${primerPermiso.nombre}" (ID: ${primerPermiso.id}) al usuario "${primerUsuario.email}" (ID: ${primerUsuario.id})...`);
      
      try {
        // Primero eliminar si existe
        await db.sequelize.query(`
          DELETE FROM Usuario_Permisos 
          WHERE usuarioID = ? AND permisoID = ?
        `, {
          replacements: [primerUsuario.id, primerPermiso.id],
          type: db.Sequelize.QueryTypes.DELETE
        });
        
        // Insertar
        await db.sequelize.query(`
          INSERT INTO Usuario_Permisos (usuarioID, permisoID) 
          VALUES (?, ?)
        `, {
          replacements: [primerUsuario.id, primerPermiso.id],
          type: db.Sequelize.QueryTypes.INSERT
        });
        
        console.log('✅ Inserción directa exitosa');
        
        // Verificar
        const [verificar] = await db.sequelize.query(`
          SELECT * FROM Usuario_Permisos 
          WHERE usuarioID = ? AND permisoID = ?
        `, {
          replacements: [primerUsuario.id, primerPermiso.id],
          type: db.Sequelize.QueryTypes.SELECT
        });
        
        console.log('✅ Verificación:', verificar);
        
        // Limpiar
        await db.sequelize.query(`
          DELETE FROM Usuario_Permisos 
          WHERE usuarioID = ? AND permisoID = ?
        `, {
          replacements: [primerUsuario.id, primerPermiso.id],
          type: db.Sequelize.QueryTypes.DELETE
        });
        
      } catch (error) {
        console.error('❌ Error en inserción directa:', error.message);
      }
    }

    console.log('\n✅ Diagnóstico completado');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error en diagnóstico:', error);
    process.exit(1);
  }
}

diagnosticar();

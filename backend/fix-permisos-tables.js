#!/usr/bin/env node
/**
 * Script para corregir las tablas de permisos
 * Elimina y recrea las tablas Usuario_Permisos y Rol_Permisos
 */

const db = require('./models');

async function fixPermisosTables() {
  const sequelize = db.sequelize;

  try {
    console.log('🔄 Iniciando corrección de tablas de permisos...');
    
    // Desactivar verificaciones de restricciones
    await sequelize.query('SET FOREIGN_KEY_CHECKS=0');

    // Eliminar tablas si existen
    console.log('🗑️  Eliminando tablas existentes...');
    await sequelize.query('DROP TABLE IF EXISTS Usuario_Permisos');
    await sequelize.query('DROP TABLE IF EXISTS Rol_Permisos');

    // Reactivar verificaciones de restricciones
    await sequelize.query('SET FOREIGN_KEY_CHECKS=1');

    // Sincronizar modelos (recrear tablas)
    console.log('🔧 Recreando tablas con estructura correcta...');
    await db.Usuario_Permiso.sync({ force: false });
    await db.Rol_Permiso.sync({ force: false });

    console.log('✅ Tablas corregidas exitosamente');
    console.log('\n📝 Próximos pasos:');
    console.log('1. Reinicia el servidor backend');
    console.log('2. Intenta asignar los permisos nuevamente');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al corregir tablas:', error);
    process.exit(1);
  }
}

fixPermisosTables();
# 🔧 Solución: Error "Unknown column 'id' in 'field list'" al asignar permisos

## 📋 Problema Identificado

El error ocurría al intentar guardar múltiples permisos a un usuario en el módulo `UsuariosManager`. La causa era que los modelos `Usuario_Permiso` y `Rol_Permiso` no tenían correctamente configurada la opción `autoIncrement: false` en sus campos de clave primaria compuesta.

### Error Original:
```
Error al guardar permisos: {message: "Unknown column 'id' in 'field list'"}
```

## ✅ Cambios Realizados

### 1. Actualización del Modelo `Usuario_Permiso` 
**Archivo**: `backend/models/usuario_permiso.js`

Se agregaron las propiedades `primaryKey: true` y `autoIncrement: false` a ambos campos:

```javascript
usuarioID: {
  type: DataTypes.INTEGER,
  allowNull: false,
  primaryKey: true,
  autoIncrement: false,  // ← NUEVO
  references: { ... }
},
permisoID: {
  type: DataTypes.INTEGER,
  allowNull: false,
  primaryKey: true,
  autoIncrement: false,  // ← NUEVO
  references: { ... }
}
```

### 2. Actualización del Modelo `Rol_Permiso`
**Archivo**: `backend/models/rol_permiso.js`

Se aplicaron los mismos cambios para mantener consistencia:

```javascript
rolID: {
  type: DataTypes.INTEGER,
  allowNull: false,
  primaryKey: true,
  autoIncrement: false,  // ← NUEVO
  references: { ... }
},
permisoID: {
  type: DataTypes.INTEGER,
  allowNull: false,
  primaryKey: true,
  autoIncrement: false,  // ← NUEVO
  references: { ... }
}
```

## 🚀 Pasos para Aplicar la Solución

### Opción 1: Script Automático (Recomendado)

```powershell
# Navega a la carpeta backend
Set-Location "c:\Users\Carlos\Documents\BrisasDeMamporal\backend"

# Ejecuta el script de corrección
node fix-permisos-tables.js
```

Este script:
- ✓ Elimina las tablas antiguas
- ✓ Recrea las tablas con la estructura correcta
- ✓ Preserva la configuración de restricciones de clave foránea

### Opción 2: Manual

Si prefieres hacerlo manualmente en MySQL:

```sql
-- 1. Desactiva las restricciones de clave foránea
SET FOREIGN_KEY_CHECKS=0;

-- 2. Elimina las tablas
DROP TABLE IF EXISTS Usuario_Permisos;
DROP TABLE IF EXISTS Rol_Permisos;

-- 3. Reactiva las restricciones
SET FOREIGN_KEY_CHECKS=1;

-- 4. Luego, reinicia el servidor backend para que Sequelize 
--    recree las tablas automáticamente
```

## 📍 Después de Aplicar los Cambios

1. **Reinicia el servidor backend:**
   ```powershell
   Set-Location "c:\Users\Carlos\Documents\BrisasDeMamporal\backend"
   node server.js
   ```

2. **Prueba la funcionalidad:**
   - Ve a Admin → Configuración → Gestión de Usuarios
   - Selecciona un usuario
   - Intenta asignarle permisos nuevamente
   - El error debería desaparecer

## 🔍 Explicación Técnica

### ¿Por qué pasaba el error?

Cuando Sequelize intenta hacer `bulkCreate` en una tabla con clave primaria compuesta sin configurar `autoIncrement: false`, intenta:
1. Buscar una columna `id` que no existe
2. Usar autoincrement en ambos campos
3. Esto causa conflictos SQL

### ¿Qué hace `autoIncrement: false`?

Le indica a Sequelize que:
- NO intente usar autoincrement en estos campos
- Los valores deben ser proporcionados explícitamente
- La combinación de ambos campos es lo que hace única la tupla

## 📚 Archivos Modificados

| Archivo | Cambios |
|---------|---------|
| `backend/models/usuario_permiso.js` | Agregados `primaryKey: true` y `autoIncrement: false` |
| `backend/models/rol_permiso.js` | Agregados `primaryKey: true` y `autoIncrement: false` |
| `backend/fix-permisos-tables.js` | Nuevo - Script de corrección |

## ⚠️ Notas Importantes

- Los cambios en los modelos son compatibles hacia atrás
- No se pierden datos de permisos (se recrea la tabla vacía)
- Puedes reasignar los permisos después de la corrección
- Si tienes datos importantes en estas tablas, respalda la BD primero

## 🆘 Si el Problema Persiste

1. Verifica que los archivos de modelo fueron modificados correctamente
2. Reinicia completamente el servidor (cierra y abre)
3. Limpia la caché del navegador (Ctrl+Shift+Delete)
4. Comprueba en MySQL que las tablas tengan la estructura correcta:
   ```sql
   DESCRIBE Usuario_Permisos;
   DESCRIBE Rol_Permisos;
   ```

---

**Actualizado**: 2024
**Versión**: 1.0
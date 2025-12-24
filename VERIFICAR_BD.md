# VERIFICAR BASE DE DATOS

## Opción 1: Usar el script batch (Recomendado para Windows)

1. Abre **Command Prompt** o **PowerShell**
2. Navega a la carpeta del proyecto:
   ```
   cd c:\Users\Carlos\Documents\BrisasDeMamporal
   ```

3. Ejecuta el script:
   ```
   run_db_check.bat
   ```

---

## Opción 2: Usar MySQL Workbench

1. Abre **MySQL Workbench**
2. Conecta a tu instancia de MySQL local
3. Abre un nuevo SQL tab
4. Abre el archivo `query_permisos.sql` en Workbench
5. Ejecuta el contenido (Ctrl+Shift+Enter o Run All)

---

## Opción 3: Usar línea de comando MySQL directa

```bash
mysql -h 127.0.0.1 -u root brisasdemamporaldb < query_permisos.sql
```

---

## QUÉ ESPERAR

### ✓ ESPERADO (Sistema funcionando):
```
1. DESCRIBE Usuario_Permisos:
   - Debe mostrar: id, usuarioID, permisoID, createdAt, updatedAt

2. Usuarios administrativos:
   - Debe mostrar al menos UN usuario con tipo='administrativo'

3. Permisos asignados:
   - Debe mostrar registros donde cada uno tiene:
     - usuarioID (del usuario administrativo)
     - email
     - permiso (nombre del permiso, ej: 'ver_estudiantes')
     - categoria

4. Permisos por usuario:
   - El usuario administrativo debe tener > 0 permisos

5. Tablas viejas:
   - NO debe mostrar Rol_Permisos
   - NO debe mostrar Persona_Roles
```

### ✗ PROBLEMAS COMUNES:

**Problema 1: No hay registros en Usuario_Permisos**
```
Solución: Los permisos no han sido asignados al usuario administrativo
Acción: Ir a Admin > Gestión de Usuarios > Seleccionar usuario > Asignar permisos
```

**Problema 2: El usuario administrativo no existe**
```
Solución: Crear un usuario de tipo 'administrativo'
Acción: Registrar usuario y cambiar su tipo a 'administrativo' en la BD
```

**Problema 3: Tabla Usuario_Permisos no existe**
```
Solución: Ejecutar las migraciones
Acción: Backend: npm run migrate
```

**Problema 4: Las tablas viejas aún existen**
```
Solución: Ejecutar la migración para eliminarlas
Acción: Backend: npm run migrate (si no se ha ejecutado 20250324000000-drop-unused-permission-tables.js)
```

---

## DESPUÉS DE VERIFICAR LA BD

Si todo está correcto en la BD:
1. El backend está retornando los permisos correctamente
2. El problema está en el frontend ProtectedRoute

Si hay problemas en la BD:
1. Revisar que los permisos fueron asignados correctamente
2. Verificar que la migración se ejecutó
3. Asignar permisos manualmente si es necesario


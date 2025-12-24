# PRÓXIMOS PASOS PARA RESOLVER EL PROBLEMA DE PERMISOS

## RESUMEN DEL PROBLEMA IDENTIFICADO

El usuario administrativo no puede ver nada porque los permisos **no se cargan correctamente en el frontend**. 

**Causa raíz**: Hay una desincronización entre:
1. **localStorage** (donde se guardan los permisos del usuario)
2. **Backend API** (que retorna los permisos)
3. **ProtectedRoute.jsx** (que verifica si tiene permisos)

---

## CAMBIOS REALIZADOS

### ✓ Backend: `backend/models/index.js`
- **Arreglado**: Manejo de null en el loader de modelos

### ✓ Frontend: `frontend/src/components/admin/ProtectedRoute.jsx`
- **Mejorado**: Ahora carga permisos del backend si están vacíos en localStorage
- **Agregado**: Lógica async para esperar a que se carguen los permisos
- **Mejorado**: Cachea los permisos en localStorage para futuras cargas

---

## PASOS PARA VERIFICAR Y RESOLVER

### PASO 1: Verifica la Base de Datos
```
Archivo: query_permisos.sql (ya creado)
Cómo ejecutar:
  - Opción A: Ejecuta c:\Users\Carlos\Documents\BrisasDeMamporal\run_db_check.bat
  - Opción B: Abre MySQL Workbench y corre query_permisos.sql
  - Opción C: Línea de comando: mysql -h 127.0.0.1 -u root brisasdemamporaldb < query_permisos.sql

Qué verificar:
  ✓ La tabla Usuario_Permisos existe
  ✓ Hay registros en Usuario_Permisos
  ✓ El usuario administrativo tiene permisos asignados
  ✓ Las tablas viejas (Rol_Permisos, Persona_Roles) NO existen

Ver detalles en: VERIFICAR_BD.md
```

### PASO 2: Haz Debug en el Frontend
```
Archivo: DEBUG_FRONTEND.md (documento con instrucciones)

Cómo:
  1. Abre el navegador con F12
  2. Ve a Console
  3. Haz login con usuario administrativo
  4. Ejecuta el script de debugging (incluido en DEBUG_FRONTEND.md)
  5. Revisa qué muestra

Qué esperar:
  ✓ localStorage debe tener permisos del usuario
  ✓ Backend debe retornar los permisos con status 200
  ✓ Los nombres de permisos deben ser correctos
```

### PASO 3: Reinicia el frontend
```
Asegúrate de que los cambios están cargados:
  1. Npm run dev (si está en desarrollo)
  2. Limpia el caché del navegador (Ctrl+Shift+Del)
  3. Cierra todas las pestañas del sitio
  4. Abre de nuevo y haz login
```

---

## ÁRBOL DE DECISIÓN PARA RESOLVER

```
¿El usuario administrativo puede acceder a las vistas?
├─ SÍ → ✓ PROBLEMA RESUELTO
│
└─ NO → Ve a "¿Qué dice localStorage?"
   ├─ "Tiene permisos correctos" 
   │  └─ El problema es en ProtectedRoute
   │     └─ Verifica permisosMapping.js - ¿El nombre coincide?
   │
   └─ "localStorage está vacío"
      └─ ¿El backend retorna permisos?
         ├─ SÍ → El problema es que loadPermissions() no se ejecutó
         │       Solución: Limpia cache, vuelve a hacer login
         │
         └─ NO → No hay permisos asignados en la BD
                 Solución: Ve a Admin > Usuarios > Asigna permisos
```

---

## ARCHIVOS AUXILIARES CREADOS

1. **DIAGNOSTICO_PERMISOS.md** - Análisis detallado de los problemas
2. **query_permisos.sql** - Queries para verificar la BD
3. **run_db_check.bat** - Script Windows para ejecutar queries
4. **VERIFICAR_BD.md** - Instrucciones para verificar la BD
5. **DEBUG_FRONTEND.md** - Instrucciones para debugging en navegador
6. **PROXIMOS_PASOS.md** - Este archivo

---

## CAMBIOS DE CÓDIGO

### 1. `frontend/src/components/admin/ProtectedRoute.jsx`

**Cambio clave**: Ahora hace un fetch a `/permisos/usuario/{usuarioID}` si los permisos están vacíos:

```javascript
if (permisos.length === 0 && currentUser.id) {
  try {
    const response = await api.get(`/permisos/usuario/${currentUser.id}`);
    permisos = response.data.map(p => p.nombre);
    
    currentUser.permisos = permisos;
    localStorage.setItem('user', JSON.stringify(currentUser));
  } catch (error) {
    console.error('Error al cargar permisos:', error);
  }
}
```

---

## TESTING FINAL

Después de hacer los cambios:

1. **Limpia cache del navegador**: Ctrl+Shift+Delete
2. **Cierra completamente el navegador**
3. **Abre de nuevo**
4. **Haz login con usuario administrativo**
5. **Verifica que accede a las vistas**
6. **Abre DevTools y ejecuta el script de debug** (en DEBUG_FRONTEND.md)

---

## SI SIGUE SIN FUNCIONAR

1. Revisa los logs del backend (hay algún error en `/permisos/usuario/{usuarioID}`?)
2. Verifica que el usuario es realmente de tipo 'administrativo'
3. Verifica que hay permisos asignados en Usuario_Permisos
4. Limpia completamente el cache del navegador
5. Prueba en una pestaña incógnito

---

## RESUMEN RÁPIDO

| Problema | Solución |
|----------|----------|
| localStorage vacío | Limpia cache y vuelve a hacer login |
| Backend no retorna permisos | Verifica que hay permisos en Usuario_Permisos |
| Usuario no tiene tipo administrativo | Cambia el tipo en la BD |
| ProtectedRoute muestra Acceso Denegado | Verifica que el nombre del permiso es exacto |
| Las tablas viejas existen | Ejecuta la migración 20250324000000 |


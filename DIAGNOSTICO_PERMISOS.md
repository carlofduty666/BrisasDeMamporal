# DIAGNÓSTICO DEL SISTEMA DE PERMISOS

## PROBLEMAS IDENTIFICADOS

### 1. **PROBLEMA CRÍTICO: Los permisos NO se cargan automáticamente en el frontend**

#### Flujo actual (INCORRECTO):
```
Login → Backend retorna {token, user}
  ↓
localStorage.setItem('user', JSON.stringify(user)) // SIN permisos
  ↓
loadPermissions() es llamada → GET /permisos/usuario/{usuarioID}
  ↓
user.permisos = response.data.map(p => p.nombre) // se añaden permisos
  ↓
localStorage.setItem('user', JSON.stringify(user)) // se guardan
```

**PERO**: El frontend está usando `ProtectedRoute.jsx` que llama a `getCurrentUser()` apenas monta, ANTES de que `loadPermissions()` termine.

**Resultado**: El usuario se carga SIN permisos porque la promesa de `loadPermissions()` no está siendo esperada.

---

### 2. **PROBLEMA EN auth.service.js (línea 37)**

```javascript
// Línea 30-38 en loginUser():
const response = await api.post('/auth/login', credentials);
if (response.data.token) {
  localStorage.setItem('user', JSON.stringify(response.data.user)); // ← AQUÍ
  
  await loadPermissions(response.data.user.id); // ← Pero esto es async
}
```

El problema es que **NO se está esperando** que `loadPermissions()` termine antes de retornar. El login se completa antes de que los permisos se carguen.

---

### 3. **PROBLEMA EN ProtectedRoute.jsx (línea 22-43)**

```javascript
useEffect(() => {
  const loadUserData = () => {
    const currentUser = getCurrentUser(); // ← Obtiene del localStorage
    if (currentUser) {
      setUserType(currentUser.tipo); // ✓ Esto está ok
      setUserPermissions(currentUser.permisos || []); // ✗ permisos pueden ser undefined
    }
    setLoading(false);
  };

  loadUserData();
  // ... listener para storage changes
}, []);
```

**Problema**: 
- El useEffect solo corre UNA VEZ al montar
- El usuario se obtiene del localStorage
- Si los permisos NO están en localStorage (porque loadPermissions() aún no terminó), entonces `currentUser.permisos` es `undefined`
- Se intenta acceder a un array vacío: `setUserPermissions(currentUser.permisos || [])` → array vacío
- **El usuario nunca verá sus permisos**

---

### 4. **FALTA DE SINCRONIZACIÓN ENTRE STORAGE Y COMPONENTE**

El event listener `window.addEventListener('storage')` solo escucha cambios en **OTRAS PESTAÑAS**, no en la misma pestaña.

Cuando `loadPermissions()` termina y guarda en localStorage:
```javascript
localStorage.setItem('user', JSON.stringify(user)); // ← ocurre en la misma pestaña
```

El evento 'storage' NO se dispara en la misma ventana.

---

## SOLUCIONES REQUERIDAS

### Solución 1: Esperar a que se carguen los permisos en el login
```javascript
export const loginUser = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    
    // ✓ ESPERAR a que se carguen los permisos
    await loadPermissions(response.data.user.id);
  }
  return response.data;
};
```

### Solución 2: Recargar permisos en ProtectedRoute si están vacíos
```javascript
useEffect(() => {
  const loadUserData = async () => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUserType(currentUser.tipo);
      
      // Si no hay permisos, cargar del backend
      if (!currentUser.permisos || currentUser.permisos.length === 0) {
        const loadedPermisos = await loadPermissions(currentUser.id);
        setUserPermissions(loadedPermisos.map(p => p.nombre));
      } else {
        setUserPermissions(currentUser.permisos);
      }
    }
    setLoading(false);
  };

  loadUserData();
}, []);
```

### Solución 3: Usar una función para forzar recarga de datos
Agregar una función en `auth.service.js` que sea llamada después del login.

---

## VERIFICACIÓN DE BD

Para verificar que los datos están en la BD, usar estos comandos SQL:

```sql
-- Ver usuarios administrativos
SELECT u.id, u.email, p.tipo, p.nombre 
FROM Usuarios u 
JOIN Personas p ON u.personaID = p.id 
WHERE p.tipo='administrativo';

-- Ver permisos asignados a un usuario específico
SELECT up.usuarioID, p.nombre, p.categoria 
FROM Usuario_Permisos up 
JOIN Permisos p ON up.permisoID = p.id 
WHERE up.usuarioID = [ID_DEL_USUARIO];

-- Ver estructura de tabla Usuario_Permisos
DESCRIBE Usuario_Permisos;

-- Ver si existen tablas viejas
SHOW TABLES LIKE 'Rol_%';
SHOW TABLES LIKE 'Persona_Roles';
```

---

## VERIFICACIÓN DE FRONTEND

En la consola del navegador, después del login, ejecutar:
```javascript
// Ver qué está guardado en localStorage
console.log(JSON.stringify(localStorage.getItem('user'), null, 2));

// Ver estructura del usuario
const user = JSON.parse(localStorage.getItem('user'));
console.log('Usuario:', user);
console.log('Permisos:', user.permisos);
console.log('Tiene permisos:', user.permisos && user.permisos.length > 0);
```


# DEBUGGING DEL SISTEMA DE PERMISOS (Frontend)

## Pasos para debugging:

### 1. Abre la consola del navegador
- En Chrome/Firefox: `F12`
- Vete a la pestaña **Console**

### 2. Haz login con un usuario administrativo que tenga permisos

### 3. Ejecuta estos comandos en la consola:

```javascript
// Ver el usuario guardado en localStorage
const user = JSON.parse(localStorage.getItem('user'));
console.log('Usuario en localStorage:', user);
console.log('Permisos:', user?.permisos);
console.log('¿Tiene permisos?', user?.permisos && user.permisos.length > 0);
```

### 4. Revisa qué imprime:

**✓ ESPERADO:**
```
Usuario en localStorage: {
  id: 1,
  email: "admin@example.com",
  tipo: "administrativo",
  permisos: ["ver_estudiantes", "ver_profesores", "ver_pagos"] ← DEBE tener permisos
}

Permisos: Array(3) ["ver_estudiantes", "ver_profesores", "ver_pagos"]
¿Tiene permisos?: true
```

**✗ PROBLEMA:**
```
Usuario en localStorage: {
  id: 1,
  email: "admin@example.com",
  tipo: "administrativo",
  permisos: [] ← VACÍO - AQUÍ ESTÁ EL PROBLEMA
}

Permisos: []
¿Tiene permisos?: false
```

---

### 5. Si los permisos están vacíos, revisa que el backend esté retornando correctamente:

```javascript
// Verificar que el endpoint del backend funciona
const usuarioID = user?.id;
console.log('Llamando a /permisos/usuario/' + usuarioID);

fetch(`/api/permisos/usuario/${usuarioID}`)
  .then(res => res.json())
  .then(data => {
    console.log('Respuesta del backend:', data);
    console.log('Cantidad de permisos:', data.length);
    console.log('Primeros permisos:', data.slice(0, 3));
  })
  .catch(err => console.error('Error:', err));
```

**✓ ESPERADO:**
```
Respuesta del backend: Array(5) [
  { id: 1, nombre: "ver_estudiantes", descripcion: "...", categoria: "Estudiantes" },
  { id: 2, nombre: "ver_profesores", descripcion: "...", categoria: "Profesores" },
  ...
]
Cantidad de permisos: 5
```

**✗ PROBLEMA:**
```
Respuesta del backend: []  ← VACÍO - No hay permisos en la BD para este usuario
```

---

### 6. Revisa la red en el navegador:

1. Abre DevTools (F12)
2. Vete a la pestaña **Network**
3. Filtra por XHR o Fetch
4. Haz login
5. Busca la llamada a `/permisos/usuario/...`
6. Click en esa llamada y revisa:
   - **Status**: Debe ser 200 (éxito)
   - **Response**: Debe tener permisos en formato JSON
   - **Headers**: Verifica que el Authorization header esté presente

---

## QUÉ HACER SEGÚN EL RESULTADO

### Caso 1: localStorage tiene permisos, pero ProtectedRoute muestra "Acceso Denegado"
- El problema es en la verificación de permisos
- Verifica el mapping de rutas en `permisosMapping.js`
- Revisa que el nombre del permiso coincida exactamente

### Caso 2: localStorage está vacío, backend retorna permisos
- El problema es que `loadPermissions()` se ejecutó pero no actualizó localStorage
- Verifica que `loadPermissions()` en `auth.service.js` está guardando correctamente

### Caso 3: Backend retorna vacío
- No hay permisos asignados en la BD para este usuario
- Ve a Admin > Gestión de Usuarios > Asigna permisos

### Caso 4: Error 404 o 500 desde el backend
- Hay un problema en el endpoint `/permisos/usuario/{usuarioID}`
- Revisa logs del backend
- Verifica que el usuario es de tipo 'administrativo'

---

## SCRIPT RÁPIDO PARA COPIAR Y PEGAR

Copia y pega esto en la consola del navegador después de hacer login:

```javascript
console.clear();
console.log('===== DIAGNOSTICO DE PERMISOS =====');

const user = JSON.parse(localStorage.getItem('user'));
console.log('1. Usuario:', user?.email, `(${user?.tipo})`);
console.log('2. Permisos en localStorage:', user?.permisos || []);
console.log('3. ¿Tiene permisos?', user?.permisos?.length > 0 ? 'SÍ' : 'NO');

console.log('\n4. Verificando backend...');
fetch(`/api/permisos/usuario/${user?.id}`)
  .then(res => res.json())
  .then(data => {
    console.log('5. Respuesta del backend:', data);
    console.log('6. Permisos del backend:', data.map(p => p.nombre));
  })
  .catch(err => {
    console.error('ERROR:', err);
    console.log('No se pudo conectar al backend');
  });

console.log('\n7. Verificando token...');
const token = localStorage.getItem('token');
console.log('8. ¿Hay token?', !!token ? 'SÍ' : 'NO');
if (token) {
  console.log('9. Primeros 20 caracteres del token:', token.substring(0, 20) + '...');
}
```

Este script mostrará toda la información necesaria para diagnosticar el problema.


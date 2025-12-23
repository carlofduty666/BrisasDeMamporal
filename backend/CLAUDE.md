# 🔧 Guía de Configuración - Brisas de Mamporal Backend

## ⚠️ IMPORTANTE - Seeders Consolidados

### Inconsistencias Encontradas y Resueltas

#### **Problema 1: Dos Seeders de Permisos Conflictivos**
- ❌ `seed-permisos-rutas.js` (Migration) - 33 permisos, SIN campo `ruta`
- ❌ `seed-permisos.js` (Seeder) - 32 permisos, CON campo `ruta`
- ❌ `seed-roles-permisos.js` - Asigna permisos a roles
- ❌ `asignar-permisos-admin.js` - Script duplicado asignando permisos

**Causa**: Dos fuentes de verdad para los permisos → inconsistencia en BD

#### **Problema 2: Permisos Faltantes**
Algunos permisos (como `crear_representantes`, `crear_profesores`, `cambiar_estado_usuario`) estaban en un archivo pero no en otro.

#### **Problema 3: Modal Mostrando Permisos del Rol**
El modal de gestión mostraba los permisos del rol como si fueran permisos específicos del usuario, causando confusión.

---

## ✅ Solución Implementada

### 1. Nuevo Seeder Consolidado
📁 `seeders/20250101-init-permisos-y-roles.js`

Este seeder:
- ✅ Define todos los permisos (combinación de ambos archivos)
- ✅ Crea los roles (`administrativo`, `profesor`, `representante`)
- ✅ Asigna permisos a cada rol de forma clara
- ✅ Limpia y reinicia `Rol_Permisos` en cada ejecución

### 2. Archivos a Eliminar (DEPRECATED)
⚠️ Ya no usar (pueden dejarse pero se ignorarán):
- `seed-permisos.js` → DEPRECATED
- `seed-permisos-rutas.js` → DEPRECATED
- `seed-roles-permisos.js` → DEPRECATED
- `asignar-permisos-admin.js` → DEPRECATED

### 3. Cambios en Backend

**Controller: `permisos.controller.js`**
- ✅ Nueva función `getPermisosEspecificosUsuario()` - retorna SOLO permisos del usuario
- ✅ Función `getPermisosByUsuario()` - retorna rol + usuario (para login)

**Routes: `permisos.routes.js`**
- ✅ Nueva ruta: `GET /permisos/usuario/:usuarioID/especificos`
- ✅ Ruta existente: `GET /permisos/usuario/:usuarioID` (para login)

**Auth: `auth.controller.js`**
- ✅ Función `obtenerPermisosUsuario()` simplificada y corregida

---

## 🚀 Ejecutar Seeders

### Opción 1: Via Sequelize CLI (Recomendado)
```bash
cd backend
npx sequelize-cli db:seed:all
```

### Opción 2: Ejecutar seed específico
```bash
npx sequelize-cli db:seed --seed 20250101-init-permisos-y-roles.js
```

### Opción 3: Deshacer y reiniciar (DESARROLLO SOLAMENTE)
```bash
# Deshacer todos los seeders
npx sequelize-cli db:seed:undo:all

# Ejecutar seeders nuevamente
npx sequelize-cli db:seed:all
```

---

## 📊 Estructura de Permisos por Rol

### Administrativo
Tiene acceso a TODO EXCEPTO:
- `ver_configuracion`, `editar_configuracion`
- `ver_periodo_escolar`, `editar_periodo_escolar`
- `ver_usuarios`, `editar_usuarios`
- `gestionar_permisos`, `cambiar_estado_usuario`

### Profesor
Solo lectura:
- `ver_dashboard`, `ver_grados`, `ver_materias`
- `ver_secciones`, `ver_horarios`
- `ver_estudiantes`, `ver_inscripciones`

### Representante
Solo info de estudiantes y pagos:
- `ver_estudiantes`, `ver_pagos`

---

## 🔄 Flujo de Permisos

### En Login (Auth)
```
Usuario intenta login
  ↓
obtenerPermisosUsuario(usuarioID, tipo)
  ↓
Obtener permisos del ROL (si existe)
  ↓
Agregar permisos específicos en Usuario_Permisos
  ↓
Token incluye: [...permisos combinados]
  ↓
Frontend guarda en localStorage
```

### En Modal de Gestión (Admin)
```
Admin abre modal de permisos
  ↓
getPermisosEspecificosUsuario(usuarioID)
  ↓
Retorna SOLO Usuario_Permisos (sin rol)
  ↓
Modal muestra checkboxes con permisos específicos
  ↓
Admin guarda cambios → actualiza Usuario_Permisos
```

---

## ⚠️ Diferencias Clave

| Endpoint | Retorna | Usado Por |
|----------|---------|----------|
| `/permisos/usuario/:id` | Rol + Usuario | Login (auth.service) |
| `/permisos/usuario/:id/especificos` | SOLO Usuario | Modal (UsuariosManager) |
| `/permisos` | TODOS | Modal (para mostrar opciones) |

---

## 🐛 Debugging

### Ver permisos del usuario en BD
```sql
SELECT up.usuarioID, up.permisoID, p.nombre 
FROM Usuario_Permisos up
JOIN Permisos p ON up.permisoID = p.id
WHERE up.usuarioID = 2;
```

### Ver permisos del rol en BD
```sql
SELECT rp.rolID, rp.permisoID, p.nombre 
FROM Rol_Permisos rp
JOIN Permisos p ON rp.permisoID = p.id
WHERE rp.rolID = 1;
```

### Verificar que los permisos se cargan en login
```javascript
// Console en frontend
const user = JSON.parse(localStorage.getItem('user'));
console.log('Permisos:', user.permisos);
```

---

## ✨ Resultado Final

✅ **Un único seeder** que define permisos y roles
✅ **Dos endpoints claros** en permisos:
  - Combinados (para login/autorización)
  - Específicos (para gestión)
✅ **Modal correctamente** muestra solo permisos asignados al usuario
✅ **Consistencia** entre BD, backend y frontend

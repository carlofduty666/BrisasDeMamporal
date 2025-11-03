# Arquitectura de Gestión de Roles y Permisos

## 📋 Resumen General
Sistema de control de acceso basado en roles (RBAC) con permisos por usuario. Soporta dos niveles de asignación de permisos:
1. **Permisos por Rol** - Asignados a todos los usuarios de un tipo específico
2. **Permisos por Usuario** - Permisos adicionales individuales

---

## 🗄️ MODELOS (Backend)

### 1. **Permiso** (`backend/models/permiso.js`)
```
- nombre: STRING (unique)
- descripcion: TEXT
- categoria: ENUM ['academico', 'estudiantes', 'representantes', 'profesores', 
                   'empleados', 'pagos', 'nomina', 'reportes', 'configuracion', 'usuarios']
- ruta: STRING (opcional)

Asociaciones:
- belongsToMany Roles (through: Rol_Permisos)
- belongsToMany Usuarios (through: Usuario_Permisos)
```

### 2. **Roles** (`backend/models/roles.js`)
```
- nombre: STRING (unique)
- descripcion: STRING

Asociaciones:
- belongsToMany Personas (through: Persona_Roles) → as 'personas'
- belongsToMany Permiso (through: Rol_Permisos) → as 'permisos'
```

### 3. **Usuarios** (`backend/models/usuarios.js`)
```
- personaID: INTEGER (FK)
- email: STRING
- verificado: BOOLEAN
- ultimoLogin: DATETIME

Asociaciones:
- belongsTo Personas (as: 'persona')
- belongsToMany Permiso (through: Usuario_Permisos) → as 'permisos'
- belongsToMany Roles (through: Persona_Roles indirectamente)
```

### 4. **Rol_Permiso** (`backend/models/rol_permiso.js`) - Junction Table
```
Campos:
- rolID: INTEGER (PK, FK)
- permisoID: INTEGER (PK, FK)

Configuración especial:
- id: false (no tiene auto-increment id)
- primaryKey: ['rolID', 'permisoID'] (composite key)

Asociaciones:
- belongsTo Permiso (as: 'permiso')
- belongsTo Roles (as: 'rol')
```

### 5. **Usuario_Permiso** (`backend/models/usuario_permiso.js`) - Junction Table
```
Campos:
- usuarioID: INTEGER (PK, FK)
- permisoID: INTEGER (PK, FK)

Configuración especial:
- id: false (no tiene auto-increment id)
- primaryKey: ['usuarioID', 'permisoID'] (composite key)

Asociaciones:
- belongsTo Permiso (as: 'permiso')
- belongsTo Usuarios (as: 'usuario')
```

### 6. **Personas** (`backend/models/persona.js`)
```
Campos principales:
- nombre, apellido, cedula
- tipo: ENUM ['estudiante', 'representante', 'profesor', 'administrativo', 
               'obrero', 'owner', 'adminWeb']
- email, telefono, password, username

Importante: El tipo de Persona es la base para la asignación de permisos por rol
```

---

## 🎮 CONTROLADORES (Backend)

### 1. **permisos.controller.js** - Gestión de Permisos
Localización: `backend/controllers/permisos.controller.js`

**Funciones principales:**

| Función | Descripción | Parámetros |
|---------|-------------|-----------|
| `getAllPermisos()` | Obtiene todos los permisos | - |
| `getPermisosByCategoria()` | Filtra por categoría | `categoria` (param) |
| `getPermisosByRol()` | Permisos asignados a un rol | `rolID` (param) |
| `getPermisosByUsuario()` | **Combina permisos de rol + usuario individual** | `usuarioID` (param) |
| `crearPermiso()` | Crea nuevo permiso (admin) | `nombre, descripcion, categoria, ruta` (body) |
| `asignarPermisoUsuario()` | Asigna permiso individual | `usuarioID, permisoID` (body) |
| `removerPermisoUsuario()` | Quita permiso individual | `usuarioID, permisoID` (body) |
| `asignarMultiplesPermisosUsuario()` | Asigna/reemplaza múltiples permisos | `usuarioID, permisoIDs[]` (body) |
| `asignarPermisosRol()` | Asigna/reemplaza permisos de rol | `rolID, permisoIDs[]` (body) |

**Lógica importante de `getPermisosByUsuario()`:**
```javascript
// Si es owner o adminWeb → acceso a TODO
if (tipo === 'owner' || tipo === 'adminWeb') {
  return todos los permisos
} else {
  // Combina:
  // 1. Permisos del rol (busca rol con nombre = tipo de persona)
  // 2. Permisos adicionales del usuario
  // Elimina duplicados y devuelve union
}
```

### 2. **roles.controller.js** - Gestión de Roles
Localización: `backend/controllers/roles.controller.js`

| Función | Descripción | Parámetros |
|---------|-------------|-----------|
| `getAllRoles()` | Obtiene todos los roles | - |
| `getRolById()` | Obtiene rol específico | `id` (param) |
| `createRol()` | Crea nuevo rol | `nombre, descripcion` (body) |
| `updateRol()` | Actualiza rol | `id` (param), `nombre, descripcion` (body) |
| `deleteRol()` | Elimina rol si no está en uso | `id` (param) |
| `getPersonasByRol()` | Obtiene personas asignadas al rol | `id` (param) |

### 3. **usuarios.controller.js** - Gestión de Usuarios
Localización: `backend/controllers/usuarios.controller.js`

Funciones relacionadas con permisos:
- `getAllUsuarios()` - Incluye datos de persona
- `getUsuarioById()` - Incluye datos de persona
- `updateUsuario()` - Actualiza datos de usuario

---

## 🛣️ RUTAS (Backend)

### 1. **Rutas de Permisos** (`backend/routes/permisos.routes.js`)

```javascript
GET    /              → getAllPermisos
GET    /categoria/:categoria  → getPermisosByCategoria
GET    /rol/:rolID            → getPermisosByRol
GET    /usuario/:usuarioID    → getPermisosByUsuario ⭐ (MÁS IMPORTANTE)

POST   /                       → crearPermiso (auth + admin)
POST   /usuario/asignar        → asignarPermisoUsuario (auth + admin)
DELETE /usuario/remover        → removerPermisoUsuario (auth + admin)
POST   /usuario/asignar-multiples → asignarMultiplesPermisosUsuario (auth + admin)
POST   /rol/asignar            → asignarPermisosRol (auth + admin)
```

### 2. **Rutas de Roles** (`backend/routes/roles.routes.js`)

```javascript
GET    /roles              → getAllRoles
GET    /roles/:id          → getRolById
GET    /roles/:id/personas → getPersonasByRol

POST   /roles              → createRol
PUT    /roles/:id          → updateRol
DELETE /roles/:id          → deleteRol
```

### 3. **Rutas relacionadas en Personas** (`backend/routes/persona.routes.js`)

```javascript
GET    /personas/:id/roles → getRolesDePersona (auth)
DELETE /personas/:personaID/roles/:rolID → eliminarRolDePersona (auth)
```

---

## 🎨 COMPONENTES FRONTEND

### 1. **UsuariosManager.jsx**
Localización: `frontend/src/components/usuarios/UsuariosManager.jsx`

**Función clave para cargar permisos:**
```javascript
const handleAbrirModalPermisos = async (usuario) => {
  try {
    // Llamada a: GET /api/permisos/usuario/:usuarioID
    const response = await axios.get(
      `/api/permisos/usuario/${usuario.id}`
    );
    setPermisosDisponibles(response.data);
    setUsuarioSeleccionado(usuario);
    setAbrirModalPermisos(true);
  } catch (error) {
    console.error('Error al cargar permisos:', error);
  }
};
```

---

## 🔑 PUNTOS CLAVE A RECORDAR

### ⚠️ Composite Primary Keys
Los modelos `Usuario_Permiso` y `Rol_Permiso` son junction tables **sin ID auto-increment**:
```javascript
// IMPORTANTE: En el init()
id: false,
primaryKey: ['usuarioID', 'permisoID']
```

**Implicación:** Cuando haces queries, debes especificar explícitamente los atributos:
```javascript
attributes: ['usuarioID', 'permisoID']  // ← Obligatorio
```

### 🔄 Lógica de Permisos Combinados
`getPermisosByUsuario()` devuelve:
- **Para owner/adminWeb:** Todos los permisos
- **Para otros:** Permisos del rol (si existe) + permisos individuales del usuario

### 📊 Relación Personas-Usuarios-Roles
```
Personas (tipo: 'profesor', 'estudiante', etc.)
    ↓ belongsTo
Usuarios
    ↓ belongsToMany
Roles (busca por nombre = tipo de Persona)
    ↓ belongsToMany
Permisos
```

### 🚨 Problemas Comunes
1. **"Unknown column 'Usuario_Permiso.id'"** → No especificaste `attributes`
2. **Permisos no aparecen** → No hay datos en `Rol_Permisos` o `Usuario_Permisos`
3. **Error de associations** → Falta `id: false` y `primaryKey` en junction tables

---

## 📈 Flujo de Datos Típico

```
Usuario abre UsuariosManager
    ↓
Hace clic en "Gestionar Permisos" de un usuario
    ↓
handleAbrirModalPermisos() → GET /api/permisos/usuario/usuarioID
    ↓
getPermisosByUsuario() en controller
    ├─ Obtiene tipo de persona
    ├─ Si owner/adminWeb → todos los permisos
    └─ Si otro → combina rol + usuario
    ↓
Devuelve array de permisos
    ↓
Modal muestra permisos disponibles
    ↓
Usuario puede asignar/remover permisos
    ↓
POST /api/permisos/usuario/asignar-multiples
    ↓
asignarMultiplesPermisosUsuario() actualiza Usuario_Permiso
```

---

## 🛠️ Desarrollo Futuro

### Cuando agregues nuevas funcionalidades:
1. ✅ Crea permiso en tabla `Permisos`
2. ✅ Asigna a roles si es rol-based en `Rol_Permisos`
3. ✅ Verifica en `getPermisosByUsuario()` que se devuelvan correctamente
4. ✅ En frontend, usa el permiso para mostrar/ocultar features

### Para debugging:
```bash
# Verificar estructura de junction table
DESCRIBE Usuario_Permisos;

# Verificar permisos de un usuario
SELECT * FROM Usuario_Permisos WHERE usuarioID = X;
SELECT * FROM Rol_Permisos WHERE rolID = Y;
```
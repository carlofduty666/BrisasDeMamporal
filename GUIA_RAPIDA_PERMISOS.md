# Guía Rápida - Sistema de Permisos

## 🎯 Ubicación en la UI

### UsuariosManager (`/admin/usuarios`)

```
┌─────────────────────────────────────────────────────────────────┐
│                    GESTIÓN DE USUARIOS                           │
│  ← Volver  👥 Total: 5 usuarios | ✓ Verificados: 4             │
├─────────────────────────────────────────────────────────────────┤
│  🔍 Buscar por nombre, email o cédula...    [Tabla] [Tarjetas]  │
├─────────────────────────────────────────────────────────────────┤
│                           VISTA TABLA                             │
├─────────────────────────────────────────────────────────────────┤
│ Usuario    │ Email      │ **ROL**  │ Teléfono │ Estado │ Acciones│
├─────────────────────────────────────────────────────────────────┤
│ Juan P.    │ juan@...   │🟠Admin  │ 0412...  │ ✓      │✓🛡️🔑❌ │
│ María G.   │ maria@...  │🔵Adm    │ 0414...  │ ✓      │✓🛡️🔑❌ │
│ Carlos L.  │ carlos@... │🟠Admin  │ 0416...  │ ⚠️     │ 🛡️🔑❌ │
└─────────────────────────────────────────────────────────────────┘

Botones por usuario:
✓ = Verificar (si no está verificado)
🛡️ = Gestionar Permisos ← NUEVO
🔑 = Restablecer Contraseña
❌ = Eliminar Usuario
```

## 🛡️ Modal de Gestionar Permisos

```
╔═══════════════════════════════════════════════════════════════════╗
║  🛡️  GESTIONAR PERMISOS                                           ║
║      Juan Pablo Ruiz                                              ║
╟───────────────────────────────────────────────────────────────────╢
║  Tipo de usuario: 🟠 Administrativo                               ║
╟───────────────────────────────────────────────────────────────────╢
║                                                                   ║
║  📚 ACADÉMICO                                                     ║
║  ┌─────────────────────────────────────────────────────────────┐ ║
║  │ ☑ ver_grados          Visualizar listado de grados         │ ║
║  │ ☐ editar_grados       Editar información de grados         │ ║
║  │ ☑ ver_secciones       Visualizar listado de secciones      │ ║
║  │ ☑ editar_secciones    Editar información de secciones      │ ║
║  │ ☐ ver_materias        Visualizar listado de materias       │ ║
║  │ ☐ editar_materias     Editar información de materias       │ ║
║  └─────────────────────────────────────────────────────────────┘ ║
║                                                                   ║
║  👥 ESTUDIANTES                                                   ║
║  ┌─────────────────────────────────────────────────────────────┐ ║
║  │ ☑ ver_estudiantes     Visualizar listado de estudiantes    │ ║
║  │ ☐ editar_estudiantes  Editar información de estudiantes    │ ║
║  │ ☑ ver_inscripciones   Visualizar inscripciones             │ ║
║  │ ☐ editar_inscripciones                                     │ ║
║  └─────────────────────────────────────────────────────────────┘ ║
║                                                                   ║
║  💰 PAGOS                                                         ║
║  ┌─────────────────────────────────────────────────────────────┐ ║
║  │ ☑ ver_pagos           Visualizar pagos                     │ ║
║  │ ☑ editar_pagos        Editar pagos                         │ ║
║  │ ☑ ver_aranceles       Visualizar aranceles                 ║
║  │ ☐ editar_aranceles    Editar aranceles                     │ ║
║  └─────────────────────────────────────────────────────────────┘ ║
║                                                                   ║
║  [Cancelar]  [✓ Guardar Cambios]                                ║
╚═══════════════════════════════════════════════════════════════════╝
```

## 📋 Tabla de Tipos de Usuario y Colores

```
Tipo              Color    Acceso              Permisos
──────────────────────────────────────────────────────────
🟣 owner          Púrpura  ACCESO TOTAL        N/A
🔵 adminWeb       Azul     ACCESO TOTAL        N/A
🟠 administrativo  Naranja  LIMITADO (asignado) ✅ Gestionar
🟢 profesor       Verde    FIJO (su módulo)    ❌ No
🟣 estudiante     Índigo   FIJO (su módulo)    ❌ No
🔷 representante  Cian     FIJO (su módulo)    ❌ No
```

## 🔑 Categorías de Permisos

```
ACADÉMICO (10)
├ ver_grados
├ editar_grados
├ ver_secciones
├ editar_secciones
├ ver_materias
├ editar_materias
├ ver_horarios
├ editar_horarios
├ ver_cupos
└ editar_cupos

ESTUDIANTES (4)
├ ver_estudiantes
├ editar_estudiantes
├ ver_inscripciones
└ editar_inscripciones

REPRESENTANTES (2)
├ ver_representantes
└ editar_representantes

PROFESORES (2)
├ ver_profesores
└ editar_profesores

EMPLEADOS (2)
├ ver_empleados
└ editar_empleados

PAGOS (4)
├ ver_pagos
├ editar_pagos
├ ver_aranceles
└ editar_aranceles

NÓMINA (2)
├ ver_nomina
└ editar_nomina

REPORTES (2)
├ ver_reportes
└ descargar_reportes

CONFIGURACIÓN (4)
├ ver_configuracion
├ editar_configuracion
├ ver_periodo_escolar
└ editar_periodo_escolar

USUARIOS (3)
├ ver_usuarios
├ editar_usuarios
└ gestionar_permisos
```

## ⚙️ API Endpoints

### Obtener Permisos

```
GET /api/permisos
→ Todos los permisos

GET /api/permisos/usuario/5
→ Permisos de usuario ID 5 (combinados: rol + usuario)

GET /api/permisos/categoria/pagos
→ Solo permisos de la categoría "pagos"
```

### Gestionar Permisos

```
POST /api/permisos/usuario/asignar-multiples
Body:
{
  "usuarioID": 5,
  "permisoIDs": [1, 2, 3, 5, 10, 15, 18]
}
→ Asigna TODOS estos permisos al usuario
→ Reemplaza permisos anteriores

POST /api/permisos/usuario/asignar
Body:
{
  "usuarioID": 5,
  "permisoID": 1
}
→ Agrega UN permiso al usuario

DELETE /api/permisos/usuario/remover
Body:
{
  "usuarioID": 5,
  "permisoID": 1
}
→ Remueve UN permiso del usuario
```

## 🔧 Uso en Componentes

### Hook: usePermissions()

```javascript
import { usePermissions } from '../hooks/usePermissions';

const MiComponente = () => {
  const { 
    hasPermission,      // ¿Tiene UN permiso?
    hasAnyPermission,   // ¿Tiene ALGUNO de estos permisos?
    hasAllPermissions,  // ¿Tiene TODOS estos permisos?
    isAdmin,            // ¿Es owner o adminWeb?
    isAdministrativo,   // ¿Es administrativo?
    getPermissions,     // Obtener array de permisos
    getUserType,        // Obtener tipo de usuario
    permissions,        // Array directo de permisos
    userType,           // Tipo directo del usuario
    loading             // ¿Cargando?
  } = usePermissions();

  // Ejemplos:
  if (loading) return <div>Cargando...</div>;

  if (hasPermission('ver_pagos')) {
    // Mostrar módulo de pagos
  }

  if (hasAnyPermission(['ver_pagos', 'ver_reportes'])) {
    // Mostrar si tiene ALGUNO de estos permisos
  }

  if (hasAllPermissions(['ver_pagos', 'editar_pagos'])) {
    // Mostrar si tiene AMBOS permisos
  }

  if (isAdmin()) {
    // Usuario es owner o adminWeb
  }

  return (
    <div>
      <p>Tus permisos: {permissions.join(', ')}</p>
      <p>Tipo: {userType}</p>
    </div>
  );
};
```

### Componente: ProtectedRoute

```javascript
import ProtectedRoute from '../ProtectedRoute';

<ProtectedRoute 
  permissions="ver_pagos"
  fallback={<AccesoDenegado />}
>
  <PagosPage />
</ProtectedRoute>

// Múltiples permisos (requiere AL MENOS UNO):
<ProtectedRoute 
  permissions={["ver_pagos", "ver_reportes"]}
>
  <PagosPage />
</ProtectedRoute>

// Múltiples permisos (requiere TODOS):
<ProtectedRoute 
  permissions={["ver_pagos", "editar_pagos"]}
  requireAll={true}
>
  <PagosPage />
</ProtectedRoute>
```

## 🚀 Pasos para Usar

### 1️⃣ Inicializar Permisos

```bash
cd backend
node seeders/seed-permisos.js
# Output: "Permisos iniciales creados exitosamente."
```

### 2️⃣ Reiniciar Servidor

```bash
cd backend
npm start
# El servidor debe reiniciarse
```

### 3️⃣ Login con Usuario Administrativo

```bash
POST http://localhost:5000/login
{
  "email": "admin@school.com",
  "password": "password123"
}

# Response incluye:
{
  "token": "...",
  "user": {
    "id": 5,
    "email": "admin@school.com",
    "tipo": "administrativo",
    "permisos": ["ver_pagos", "editar_pagos", ...]
  }
}
```

### 4️⃣ Gestionar Permisos

1. Abrir: `http://localhost:5173/admin/usuarios`
2. Buscar usuario administrativo
3. Hacer clic en botón 🛡️
4. Marcar/desmarcar permisos
5. Hacer clic en "Guardar Cambios"

### 5️⃣ Verificar Permisos

```javascript
// En Console del navegador
const user = JSON.parse(localStorage.getItem('user'));
console.log('Permisos:', user.permisos);
```

## 🔒 Flujo de Seguridad

```
┌─────────────────────────────────────────────────────┐
│ USUARIO INTENTA ACCEDER A MÓDULO                    │
└────────────┬────────────────────────────────────────┘
             │
      ┌──────▼─────────┐
      │ Frontend       │
      │ usePermissions() │──▶ ¿Tiene permiso?
      └──────┬─────────┘
             │
    ┌────────┴────────┐
    │                 │
    ▼                 ▼
  ❌ NO            ✅ SÍ
  Muestra        Permite
  "Acceso        acceso
  Denegado"
    │                 │
    │           ┌─────▼────────┐
    │           │ Backend      │
    │           │ Middleware   │
    │           │ verifyToken()│
    │           │ ¿Permiso en  │
    │           │ token?       │
    │           └─────┬────────┘
    │                 │
    │        ┌────────┴────────┐
    │        │                 │
    │        ▼                 ▼
    │      ❌ NO            ✅ SÍ
    │      401/403        Retorna
    │      Error          datos
    │        │                 │
    └────────┴─────────────────┘
```

## 📊 Ejemplo Real: Setup Administrativo

### Usuario: María García (Administrativa de Pagos)

**Setup**:
```
Nombre: María García
Email: maria.garcia@school.com
Teléfono: 0412-1234567
Tipo: administrativo
Permisos asignados:
  ✓ ver_pagos
  ✓ editar_pagos
  ✓ ver_aranceles
  ✓ editar_aranceles
  ✓ descargar_reportes
  ✓ ver_configuracion
```

**Acceso**:
- ✅ Puede ver/editar pagos de estudiantes
- ✅ Puede ver/editar aranceles
- ✅ Puede descargar reportes de pagos
- ✅ Puede ver configuración general
- ❌ NO puede ver estudiantes
- ❌ NO puede ver empleados
- ❌ NO puede ver nómina
- ❌ NO puede editar período escolar

## 🐛 Troubleshooting

### Error: "Los permisos ya existen"
→ Los seeders ya fueron ejecutados. Si necesitas recrearlos:
```bash
# 1. Borrar tabla de permisos en BD
DELETE FROM Permisos;
DELETE FROM Rol_Permisos;
DELETE FROM Usuario_Permisos;

# 2. Ejecutar seeders de nuevo
node seeders/seed-permisos.js
```

### Error: "Acceso Denegado" sin motivo
→ Verifique:
1. Token válido: `localStorage.getItem('token')`
2. Permisos en user: `JSON.parse(localStorage.getItem('user')).permisos`
3. Hacer logout/login de nuevo

### Los permisos no se actualizan
→ Luego de actualizar permisos, el usuario debe hacer logout y login de nuevo para obtener nuevo token con permisos actualizados.

## 📞 Soporte

Para ver la documentación completa: `SISTEMA_PERMISOS_ROLES.md`

---

**Versión**: 1.0.0  
**Última actualización**: 2025
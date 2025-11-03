# Cambios Visuales en UsuariosManager

## Vista General

El componente `UsuariosManager` ha sido mejorado para mostrar y gestionar roles y permisos de usuarios.

## 🎨 Nuevas Características Visuales

### 1. Colores de Roles

Cada tipo de usuario ahora tiene un color distintivo:

```
🟣 owner          → Púrpura    (Propietario)
🔵 adminWeb       → Azul       (Administrador Web)
🟠 administrativo → Naranja    (Administrativo)
🟢 profesor       → Verde      (Profesor)
🟣 estudiante     → Índigo     (Estudiante)
🔷 representante  → Cian       (Representante)
```

### 2. Nueva Columna "Rol" en Tabla

#### ANTES:
```
┌──────────────┬──────────┬──────────┬────────┬──────────┐
│ Usuario      │ Email    │ Teléfono │ Estado │ Acciones │
├──────────────┼──────────┼──────────┼────────┼──────────┤
│ Juan P.      │ juan@... │ 0412...  │ ✓      │ ✓ 🔑 ❌ │
│ María G.     │ maria@...|0414...  │ ✓      │ ✓ 🔑 ❌ │
└──────────────┴──────────┴──────────┴────────┴──────────┘
```

#### DESPUÉS:
```
┌──────────────┬──────────┬─────────────────┬──────────┬────────┬──────────────────┐
│ Usuario      │ Email    │ **Rol**         │ Teléfono │ Estado │ Acciones         │
├──────────────┼──────────┼─────────────────┼──────────┼────────┼──────────────────┤
│ Juan P.      │ juan@... │🟠 Administrativo│ 0412...  │ ✓      │ ✓ 🛡️ 🔑 ❌       │
│ María G.     │ maria@...|🔵 Administrador │ 0414...  │ ✓      │ ✓ 🛡️ 🔑 ❌       │
│ Carlos L.    │ carlos...│🟢 Profesor      │ 0416...  │ ⚠️     │ ✓ 🛡️ 🔑 ❌       │
└──────────────┴──────────┴─────────────────┴──────────┴────────┴──────────────────┘
```

### 3. Nuevo Botón "Gestionar Permisos" (🛡️)

En cada fila aparece un nuevo botón con icono de escudo:

```
Acciones:
  ✓ = Verificar usuario (solo si no verificado)
  🛡️ = Gestionar Permisos ← NUEVO
  🔑 = Restablecer Contraseña
  ❌ = Eliminar Usuario
```

### 4. Vista de Tarjetas - Rol Visible

#### ANTES:
```
┌─────────────────────┐
│ 👤 Juan P.          │
│                     │
│ C.I: 12345678       │
│ 📧 juan@school.com  │
│ 📞 0412-1234567     │
│ 🕐 2025-01-15 10:30 │
├─────────────────────┤
│ [Verificar][🔑][❌] │
└─────────────────────┘
```

#### DESPUÉS:
```
┌─────────────────────────────────┐
│ 👤 Juan P.                      │
│ 🟠 Administrativo               │
│                                 │
│ C.I: 12345678                   │
│ 📧 juan@school.com              │
│ 📞 0412-1234567                 │
│ 🕐 2025-01-15 10:30             │
├─────────────────────────────────┤
│ [Verificar] [🛡️ Permisos]       │
│ [🔑 Contraseña] [❌ Eliminar]   │
└─────────────────────────────────┘
```

## 🛡️ Modal de Gestionar Permisos

### Interfaz Completa

```
╔═══════════════════════════════════════════════════════════════════╗
║  🛡️  GESTIONAR PERMISOS                                           ║
║      Juan Pablo Ruiz                                              ║
╟───────────────────────────────────────────────────────────────────╢
║                                                                   ║
║  Tipo de usuario: 🟠 Administrativo                               ║
║                                                                   ║
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
║  │ ☑ ver_horarios        Visualizar horarios                  │ ║
║  │ ☐ editar_horarios     Editar horarios                      │ ║
║  │ ☑ ver_cupos           Visualizar cupos de secciones        │ ║
║  │ ☐ editar_cupos        Editar cupos de secciones            │ ║
║  └─────────────────────────────────────────────────────────────┘ ║
║                                                                   ║
║  👥 ESTUDIANTES                                                   ║
║  ┌─────────────────────────────────────────────────────────────┐ ║
║  │ ☑ ver_estudiantes     Visualizar listado de estudiantes    │ ║
║  │ ☐ editar_estudiantes  Editar información de estudiantes    │ ║
║  │ ☑ ver_inscripciones   Visualizar inscripciones             │ ║
║  │ ☐ editar_inscripciones Editar inscripciones                │ ║
║  └─────────────────────────────────────────────────────────────┘ ║
║                                                                   ║
║  💰 PAGOS                                                         ║
║  ┌─────────────────────────────────────────────────────────────┐ ║
║  │ ☑ ver_pagos           Visualizar pagos                     │ ║
║  │ ☑ editar_pagos        Editar pagos                         │ ║
║  │ ☑ ver_aranceles       Visualizar aranceles                 │ ║
║  │ ☐ editar_aranceles    Editar aranceles                     │ ║
║  └─────────────────────────────────────────────────────────────┘ ║
║                                                                   ║
║  ⚙️  CONFIGURACIÓN                                                ║
║  ┌─────────────────────────────────────────────────────────────┐ ║
║  │ ☑ ver_configuracion   Visualizar configuración del sistema │ ║
║  │ ☐ editar_configuracion Editar configuración                │ ║
║  │ ☑ ver_periodo_escolar Visualizar período escolar           │ ║
║  │ ☐ editar_periodo_escolar Editar período escolar            │ ║
║  └─────────────────────────────────────────────────────────────┘ ║
║                                                                   ║
║  [Cancelar]                [✓ Guardar Cambios]                  ║
╚═══════════════════════════════════════════════════════════════════╝
```

### Características del Modal

1. **Header**: Muestra rol del usuario seleccionado
2. **Secciones**: Permisos agrupados por categoría
3. **Checkboxes**: 
   - ☑ = Permiso asignado
   - ☐ = Permiso no asignado
4. **Descripciones**: Cada permiso tiene descripción legible
5. **Scroll**: Modal con scroll vertical para muchos permisos
6. **Botones**:
   - Cancelar: Cierra sin guardar
   - Guardar Cambios: Guarda y actualiza usuario

### Interacción

**Paso 1: Abrir Modal**
```
[Usuario] → Clic en 🛡️ Botón → Modal se abre
```

**Paso 2: Ver Permisos Actuales**
```
Modal muestra:
- Rol del usuario
- Checkboxes marcados = permisos actuales
- Checkboxes desmarcados = permisos no asignados
```

**Paso 3: Modificar**
```
Clic en checkbox → Se marca/desmarca
Puede marcar múltiples permisos
```

**Paso 4: Guardar**
```
Clic "Guardar Cambios" → 
Sistema actualiza base de datos →
Toast de éxito "Permisos actualizados correctamente"
```

## 📊 Estadísticas de Cambios

### Líneas de Código Modificadas en UsuariosManager

```
- Imports: +3 (FaShieldAlt, permisos.service)
- Constants: +2 (ROLE_COLORS, ROLE_LABELS)
- Estados: +4 (showModalPermisos, usuarioPermisosSeleccionado, etc.)
- Funciones: +4 (handleAbrirModalPermisos, handleCerrarModalPermisos, etc.)
- UI Tabla: +1 columna (Rol)
- UI Tarjetas: +1 badge (Rol)
- Botones: +1 por usuario (🛡️ Gestionar Permisos)
- Modales: +1 (Modal Gestionar Permisos)
- Total: ~200 líneas de código nuevo
```

## 🎯 Flujo de Usuario

### Flujo 1: Ver Roles

```
Admin abre UsuariosManager
        ↓
Ve listado de usuarios con ROLES visibles
        ↓
Puede identificar rápidamente tipo de cada usuario:
- 🔵 adminWeb = Admin
- 🟠 administrativo = Admin limitado
- 🟢 profesor = Profesor
- etc.
```

### Flujo 2: Gestionar Permisos (administrativo)

```
Admin selecciona usuario "administrativo"
        ↓
Hace clic en 🛡️ Permisos
        ↓
Modal abre mostrando permisos actuales marcados
        ↓
Admin marca más permisos (ej: editar_pagos, descargar_reportes)
        ↓
Admin desmarca permisos no necesarios
        ↓
Admin hace clic "Guardar Cambios"
        ↓
Sistema actualiza base de datos
        ↓
Toast: "Permisos actualizados correctamente"
        ↓
Modal cierra automáticamente
        ↓
Usuario ahora tiene nuevos permisos
```

### Flujo 3: Login con Nuevos Permisos

```
Usuario administrativo hace logout
        ↓
Usuario hace login con mismas credenciales
        ↓
Backend obtiene permisos nuevamente
        ↓
Token JWT incluye permisos actualizados
        ↓
Frontend almacena permisos en localStorage
        ↓
Usuario ahora puede acceder a módulos con permiso
```

## 🎨 Detalles de Diseño

### Colores de Badges de Rol

```css
owner        → bg-purple-100, text-purple-800
adminWeb     → bg-blue-100, text-blue-800
administrativo → bg-orange-100, text-orange-800
profesor     → bg-green-100, text-green-800
estudiante   → bg-indigo-100, text-indigo-800
representante → bg-cyan-100, text-cyan-800
```

### Estilos de Modal

```
- Background: rgba(0,0,0,0.5) - Oscuro semi-transparente
- Modal: bg-white, rounded-2xl, shadow-2xl
- Header: Icono + título
- Contenido: Secciones con grupos de checkboxes
- Cada checkbox: Hover effect, descripción pequeña
- Botones: Gradient purpura para guardar
```

### Responsividad

```
Mobile (xs/sm):
  - Tabla: Horizontal scroll
  - Tarjetas: 1 columna
  - Modal: Full width con padding

Tablet (md):
  - Tabla: Normal
  - Tarjetas: 2 columnas
  - Modal: max-width-md

Desktop (lg+):
  - Tabla: Normal
  - Tarjetas: 3 columnas
  - Modal: max-width-2xl
```

## 🔄 Animaciones

```javascript
// Transiciones suaves
- Botones: 200ms
- Modal apertura/cierre: 300ms
- Hover effects: 200ms
- Checkboxes: Instant
```

## 📱 Ejemplos de Uso

### Ejemplo 1: Admin Gestiona Permisos

**Escenario**: Un nuevo empleado administrativo necesita acceso a módulo de pagos.

```
1. Admin abre UsuariosManager
2. Busca al empleado (ej: "Carlos López")
3. Ve que es 🟠 Administrativo
4. Hace clic en 🛡️ Permisos
5. En modal, marca:
   - ✓ ver_pagos
   - ✓ editar_pagos
   - ✓ ver_aranceles
6. Hace clic "Guardar Cambios"
7. Carlos ahora puede acceder a módulo de pagos
```

### Ejemplo 2: Revocar Acceso

**Escenario**: Un administrativo no debe seguir teniendo acceso a nómina.

```
1. Admin abre UsuariosManager
2. Busca al administrativo
3. Hace clic en 🛡️ Permisos
4. Desmarcar: ☑️ ver_nomina → ☐ ver_nomina
5. Hacer clic "Guardar Cambios"
6. Administrativo pierde acceso inmediatamente
   (al hacer logout/login)
```

## 🧪 Testing Visual

### Checklist de Verificación

- [ ] Ver columna "Rol" en tabla
- [ ] Roles tienen colores correctos
- [ ] Botón 🛡️ aparece en cada fila
- [ ] Tarjetas muestran rol debajo del nombre
- [ ] Modal abre al hacer clic en 🛡️
- [ ] Modal muestra checkboxes correctos
- [ ] Marcar/desmarcar checkboxes funciona
- [ ] "Guardar Cambios" guarda en BD
- [ ] Toast de éxito aparece
- [ ] Modal cierra tras guardar

## 📝 Notas Técnicas

1. **Estado de Permisos**: Se cargan al abrir el modal, no en tiempo real
2. **Guardado**: Usa transacción para garantizar consistencia
3. **Permisos Editables**: Solo para usuarios "administrativo"
4. **Usuarios owner/adminWeb**: No pueden gestionar sus propios permisos
   (son ilimitados automáticamente)
5. **Actualización de Token**: Usuario debe hacer logout/login para nuevo token

---

**Versión**: 1.0.0  
**Última actualización**: 2025  
**Estado**: ✅ Implementado y funcional
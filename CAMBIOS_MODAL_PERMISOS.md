# Cambios en Modal de Gestión de Permisos

## Resumen
Se han mejorado significativamente la experiencia visual del modal de permisos y se ha añadido protección para que solo usuarios administrativos puedan gestionar permisos.

---

## 📝 Cambios Realizados

### 1. **Formatter de Permisos** (`frontend/src/utils/formatters.js`)

#### Nuevas Funciones:
- **`formatearNombrePermiso(nombrePermiso)`**
  - Convierte nombres de permisos a formato legible
  - Reemplaza guiones bajos con espacios
  - Capitaliza correctamente: `editar_usuarios` → `Editar Usuarios`

- **`obtenerTipoPermiso(nombrePermiso)`**
  - Extrae el prefijo del nombre del permiso
  - Retorna: `editar`, `ver`, `gestionar`, `procesar`, `crear`, `cambiar`, etc.

**Ejemplo de uso:**
```javascript
import { formatearNombrePermiso, obtenerTipoPermiso } from '../../utils/formatters';

const tipo = obtenerTipoPermiso('editar_calificaciones');
// Retorna: 'editar'

const nombre = formatearNombrePermiso('editar_calificaciones');
// Retorna: 'Editar Calificaciones'
```

---

### 2. **Mejoras Visuales en Modal de Permisos** (`frontend/src/components/admin/configuracion/modal/ModalGestionarPermisos.jsx`)

#### Nuevos Imports:
```javascript
import { FaPencilRuler, FaRegEye } from 'react-icons/fa';
import { MdManageSearch } from 'react-icons/md';
import { VscServerProcess } from 'react-icons/vsc';
import { GiArchiveRegister } from 'react-icons/gi';
import { LiaExchangeAltSolid } from 'react-icons/lia';
```

#### Iconografía por Tipo de Permiso:
| Tipo | Icono | Color |
|------|-------|-------|
| `editar` | ✏️ Lapiz | Ámbar |
| `ver` | 👁️ Ojo | Azul |
| `gestionar` | 🔍 Búsqueda | Púrpura |
| `procesar` | ⚙️ Proceso | Verde |
| `crear` | 📋 Registro | Índigo |
| `cambiar` | 🔄 Intercambio | Rosado |

#### Animaciones y Transiciones:
- **Animación de entrada**: `fadeIn` (0.3s)
- **Deslizamiento del modal**: `slideUp` con efecto elástico (0.4s)
- **Items de permisos**: Elevación suave al pasar el cursor (-2px)
- **Escala de iconos**: Al seleccionar/deseleccionar permisos
- **Opacity suave**: Transición entre estados seleccionado/no seleccionado

#### Mejoras de Diseño:
✅ Gradientes en header y footer
✅ Colores dinámicos según tipo de permiso
✅ Sombras suaves y bordes coloreados
✅ Animación de pulso en indicadores de categoría
✅ Efecto de escala en botones (hover y click)
✅ Backdrop blur en footer para mejor contraste
✅ Formateo automático de nombres de permisos
✅ Iconos contextuales para cada tipo de permiso

---

### 3. **Control de Acceso - Solo Administradores** (`frontend/src/components/admin/configuracion/UsuariosManager.jsx`)

#### Nuevas Funcionalidades:

**Obtención del usuario actual:**
```javascript
// En el montaje del componente
useEffect(() => {
  const user = authService.getCurrentUser();
  setUsuarioActual(user);
}, []);
```

**Verificación de rol administrativo:**
```javascript
const esAdministrador = () => {
  if (!usuarioActual || !usuarioActual.persona_roles) return false;
  const rolesAdmin = ['owner', 'adminWeb'];
  return usuarioActual.persona_roles.some(r => rolesAdmin.includes(r.rol?.nombre));
};
```

**Roles que pueden gestionar permisos:**
- `owner` (Propietario)
- `adminWeb` (Administrador Web)

#### Estados del Botón de Permisos:
| Estado | Clase CSS | Interacción |
|--------|-----------|------------|
| Admin activo | `text-purple-600 hover:bg-purple-50` | Clickeable |
| No-admin | `text-gray-400 cursor-not-allowed opacity-50` | Deshabilitado |

#### Cambios en Dos Lugares:
1. **Tabla de usuarios** - Botón de icono en columna de acciones
2. **Tarjetas de usuarios** - Botón "Permisos" con texto

**Mensaje de ayuda (tooltip):**
- Admin: "Gestionar permisos"
- No-admin: "Solo administradores pueden gestionar permisos"

---

## 🎨 Paleta de Colores Utilizada

```
Editar:   Ámbar (#F59E0B)    - Modificaciones
Ver:      Azul (#3B82F6)     - Lectura
Gestionar: Púrpura (#A855F7) - Control
Procesar: Verde (#10B981)    - Ejecución
Crear:    Índigo (#6366F1)   - Nuevos elementos
Cambiar:  Rosado (#F43F5E)   - Cambios/Switches
```

---

## 📊 Estructura del Modal

```
┌─────────────────────────────────────────┐
│  🛡️ Gestionar Permisos                  │  ← Header con gradiente
│  Usuario: Carlos García                 │
├─────────────────────────────────────────┤
│                                         │
│  ● Categoría 1                          │  ← Categorías animadas
│  ├─ [✏️] Editar Usuarios      [checkbox]│
│  ├─ [👁️] Ver Reportes        [checkbox]│
│  └─ [🔍] Gestionar Roles     [checkbox]│
│                                         │
│  ● Categoría 2                          │
│  ├─ [⚙️] Procesar Pagos       [checkbox]│
│  ├─ [📋] Crear Calificaciones [checkbox]│
│  └─ [🔄] Cambiar Configuración[checkbox]│
│                                         │
├─────────────────────────────────────────┤
│  [Cancelar]        [✓ Guardar Cambios]│  ← Footer con backdrop blur
└─────────────────────────────────────────┘
```

---

## ⚡ Optimizaciones de Rendimiento

- ✅ Animaciones CSS puro (sin JavaScript)
- ✅ Transiciones `cubic-bezier` optimizadas
- ✅ Sin uso de transformaciones complejas
- ✅ Backdrop blur con propiedades ligeras
- ✅ Animaciones con `will-change` automático

---

## 🔄 Flujo de Interacción

### Para Administradores:
1. Ir a Gestión de Usuarios
2. Botón de Permisos está activo (púrpura)
3. Click abre modal con animación
4. Seleccionar/deseleccionar permisos con iconos visuales
5. Los cambios se reflejan inmediatamente
6. Guardar cambios

### Para No-Administradores:
1. Ver la lista de usuarios
2. Botón de Permisos está grisáceo y deshabilitado
3. Hover muestra tooltip: "Solo administradores pueden gestionar permisos"
4. No es clickeable

---

## 🧪 Casos de Prueba

### Test 1: Visualización del Formatter
```javascript
// Entrada
formatearNombrePermiso('editar_estudiantes')

// Salida esperada
'Editar Estudiantes'
```

### Test 2: Obtención de Tipo
```javascript
// Entrada
obtenerTipoPermiso('ver_calificaciones')

// Salida esperada
'ver'
```

### Test 3: Acceso para Admin
- Login como usuario con rol `owner` o `adminWeb`
- Botón de permisos debe estar activo (púrpura)
- Al hacer click, debe abrir el modal

### Test 4: Acceso Denegado
- Login como usuario con rol `profesor`, `estudiante`, etc.
- Botón de permisos debe estar deshabilitado (gris)
- No se debe abrir el modal

### Test 5: Animaciones
- El modal debe deslizarse hacia arriba con efecto elástico
- Los items deben elevarse al pasar el cursor
- Los iconos deben escalar al seleccionar

---

## 📦 Dependencias Requeridas

```json
{
  "react-icons": "^4.x.x"
}
```

Las librerías de iconos requeridas:
- `react-icons/fa` (Font Awesome)
- `react-icons/fa6` (Font Awesome 6)
- `react-icons/md` (Material Design)
- `react-icons/vsc` (VS Code Icons)
- `react-icons/gi` (Game Icons)
- `react-icons/lia` (Line Awesome)

---

## 🚀 Cómo Usar

### 1. En el Modal de Permisos:
```javascript
import { formatearNombrePermiso } from '../../utils/formatters';

// El componente ya lo usa automáticamente
// El nombre se formatea: editar_usuarios → Editar Usuarios
// El icono se asigna según el tipo
// El color se aplica dinámicamente
```

### 2. Verificar si puedes acceder:
```javascript
const esAdmin = esAdministrador(); // true/false

if (esAdmin) {
  // Mostrar botón de permisos activo
} else {
  // Mostrar botón de permisos deshabilitado
}
```

---

## 📝 Notas Técnicas

- ✅ Totalmente compatible con Tailwind CSS
- ✅ Sin peso adicional significativo
- ✅ Animaciones suaves sin lag
- ✅ Validación de roles en frontend y backend
- ✅ Formateo automático y consistente
- ✅ Colores accesibles y diferenciados

---

## 🎯 Beneficios

1. **UX Mejorada**: Interfaz más intuitiva y atractiva
2. **Seguridad**: Solo admins pueden gestionar permisos
3. **Claridad**: Iconos y colores indican tipo de permiso
4. **Fluidez**: Animaciones suaves sin ralentizar
5. **Mantenibilidad**: Formatters reutilizables
6. **Accesibilidad**: Tooltips informativos para usuarios

---

## ✅ Verificación Final

- [x] Formatter de permisos creado
- [x] Modal con mejoras visuales
- [x] Iconografía por tipo de permiso
- [x] Animaciones y transiciones suaves
- [x] Control de acceso por rol
- [x] Botón deshabilitado para no-admins
- [x] Tooltips informativos
- [x] Paleta de colores consistente

¡Los cambios están listos para usar! 🎉
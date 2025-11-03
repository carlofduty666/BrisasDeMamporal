# Sistema de Permisos y Roles - Documentación Completa

## Descripción General

Se ha implementado un **sistema de permisos granulares y flexibles** que permite controlar qué módulos y funciones pueden acceder diferentes usuarios administrativos del sistema.

## Arquitectura del Sistema

### Estructura de Permisos

El sistema utiliza un modelo **jerárquico multinivel**:

1. **Permisos Base por Tipo de Usuario**
   - Cada tipo de usuario (`owner`, `adminWeb`, `administrativo`, etc.) tiene permisos base predefinidos
   - Los usuarios `owner` y `adminWeb` tienen acceso a TODOS los módulos

2. **Permisos Adicionales por Usuario**
   - Los usuarios `administrativo` pueden recibir permisos adicionales específicos
   - Permite una granularidad mayor para empleados administrativos que solo necesitan acceso a ciertos módulos

3. **Permisos por Categoría**
   - Académico
   - Estudiantes
   - Representantes
   - Profesores
   - Empleados
   - Pagos
   - Nómina
   - Reportes
   - Configuración
   - Usuarios

### Base de Datos

#### Tabla: `Permisos`
```sql
CREATE TABLE Permisos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(255) UNIQUE NOT NULL,
  descripcion VARCHAR(255),
  categoria ENUM('academico', 'estudiantes', 'representantes', 'profesores', 'empleados', 'pagos', 'nomina', 'reportes', 'configuracion', 'usuarios'),
  ruta VARCHAR(255),
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP
);
```

#### Tabla: `Rol_Permisos`
```sql
CREATE TABLE Rol_Permisos (
  rolID INT PRIMARY KEY,
  permisoID INT PRIMARY KEY,
  FOREIGN KEY (rolID) REFERENCES Rols(id),
  FOREIGN KEY (permisoID) REFERENCES Permisos(id)
);
```

#### Tabla: `Usuario_Permisos`
```sql
CREATE TABLE Usuario_Permisos (
  usuarioID INT PRIMARY KEY,
  permisoID INT PRIMARY KEY,
  FOREIGN KEY (usuarioID) REFERENCES Usuarios(id),
  FOREIGN KEY (permisoID) REFERENCES Permisos(id)
);
```

## Backend - Implementación

### Controllers: `permisos.controller.js`

Métodos disponibles:

#### 1. **getAllPermisos()**
- Obtiene todos los permisos disponibles en el sistema
- **Endpoint**: `GET /api/permisos`
- **Autenticación**: Pública

#### 2. **getPermisosByCategoria(categoria)**
- Obtiene permisos filtrados por categoría
- **Endpoint**: `GET /api/permisos/categoria/{categoria}`

#### 3. **getPermisosByRol(rolID)**
- Obtiene permisos asignados a un rol específico
- **Endpoint**: `GET /api/permisos/rol/{rolID}`

#### 4. **getPermisosByUsuario(usuarioID)** ⭐
- **MUY IMPORTANTE**: Combina permisos base (por tipo) + permisos adicionales (por usuario)
- Lógica:
  - Si es `owner` o `adminWeb`: retorna TODOS los permisos
  - Si es otro tipo: combina permisos del rol + permisos del usuario
- **Endpoint**: `GET /api/permisos/usuario/{usuarioID}`

#### 5. **asignarPermisoUsuario(usuarioID, permisoID)**
- Asigna un permiso individual a un usuario
- **Endpoint**: `POST /api/permisos/usuario/asignar`
- **Requerimientos**: Token JWT + rol Admin

#### 6. **asignarMultiplesPermisosUsuario(usuarioID, permisoIDs)** ⭐
- Reemplaza TODOS los permisos adicionales del usuario con los nuevos
- Usa transacciones para garantizar consistencia
- **Endpoint**: `POST /api/permisos/usuario/asignar-multiples`
- **Body**:
  ```json
  {
    "usuarioID": 5,
    "permisoIDs": [1, 2, 3, 5]
  }
  ```

#### 7. **asignarPermisosRol(rolID, permisoIDs)**
- Asigna permisos base a un rol
- **Endpoint**: `POST /api/permisos/rol/asignar`

#### 8. **crearPermiso(nombre, descripcion, categoria, ruta)**
- Crea un nuevo permiso
- **Endpoint**: `POST /api/permisos`

### Middleware de Autenticación: `auth.middleware.js`

#### Extensiones añadidas:

1. **verifyToken()** - Actualizado
   ```javascript
   // Ahora incluye permisos en req.userPermissions
   req.userPermissions = decoded.permisos || [];
   ```

2. **requirePermission(requiredPermissions)** - NUEVO
   ```javascript
   exports.requirePermission = (requiredPermissions) => {
     // Verifica si el usuario tiene permisos específicos
     // Si es owner o adminWeb: siempre permite
   }
   ```

### Auth Controller: `auth.controller.js`

#### Cambios en Login:

```javascript
// Función helper: obtenerPermisosUsuario()
const permisos = await obtenerPermisosUsuario(usuario.id, persona.tipo);

// Token JWT ahora incluye permisos
const token = jwt.sign({
  id: usuario.id,
  personaID: persona.id,
  tipo: persona.tipo,
  permisos: permisos  // NUEVO
}, process.env.JWT_SECRET, { expiresIn: '24h' });

// Response incluye permisos
res.status(200).json({
  token,
  user: {
    ...userData,
    permisos: permisos  // NUEVO
  }
});
```

## Frontend - Implementación

### Service: `permisos.service.js`

Proporciona acceso a la API de permisos desde el frontend:

```javascript
// Obtener todos los permisos
await permisosService.getAllPermisos()

// Obtener permisos de un usuario
await permisosService.getPermisosByUsuario(usuarioID)

// Asignar múltiples permisos
await permisosService.asignarMultiplesPermisosUsuario(usuarioID, permisoIDs)
```

### Hook: `usePermissions.js` ⭐

Hook personalizado para verificar permisos en componentes:

```javascript
const { 
  permissions,      // Array de permisos del usuario
  userType,         // Tipo de usuario
  hasPermission,    // Verifica un permiso
  hasAnyPermission, // Verifica si tiene ALGUNO de los permisos
  hasAllPermissions,// Verifica si tiene TODOS los permisos
  isAdmin,          // Verifica si es admin/owner
  isAdministrativo  // Verifica si es administrativo
} = usePermissions();

// Uso en componentes
if (hasPermission('ver_pagos')) {
  // Mostrar módulo de pagos
}
```

### Componente: `ProtectedRoute.jsx` ⭐

Componente wrapper para proteger rutas:

```jsx
<ProtectedRoute 
  permissions="ver_pagos"
  fallback={<AccesoDenegado />}
>
  <PagosPage />
</ProtectedRoute>
```

### Componente: `UsuariosManager.jsx`

Actualizado con:
- **Mostrar roles** de cada usuario en tabla y tarjetas
- **Modal de Permisos**: Gestionar permisos adicionales por usuario
- **Colores diferenciados** para cada tipo de rol
- **Checkboxes agrupados** por categoría de permisos

## Flujo de Permisos

### 1. Login
```
Usuario inicia sesión
    ↓
Sistema obtiene permisos del usuario
    ↓
Token JWT se crea CON permisos incluidos
    ↓
Frontend almacena token + permisos en localStorage
```

### 2. Acceso a Módulos
```
Usuario abre módulo
    ↓
ProtectedRoute/usePermissions verifica permisos locales
    ↓
Si no tiene permiso → Muestra "Acceso Denegado"
Si tiene permiso → Permite acceso
```

### 3. Cambio de Permisos (por Admin)
```
Admin abre UsuariosManager
    ↓
Selecciona usuario "administrativo"
    ↓
Abre modal de permisos
    ↓
Sistema muestra permisos actuales (marcados)
    ↓
Admin selecciona/deselecciona permisos
    ↓
Admin hace clic en "Guardar"
    ↓
Sistema actualiza permisos en base de datos
```

## Tipos de Usuarios y Permisos Base

### `owner` (Propietario)
- ✅ Acceso a TODO
- No necesita permisos específicos (verificación en middleware)

### `adminWeb` (Administrador Web)
- ✅ Acceso a TODO
- No necesita permisos específicos (verificación en middleware)

### `administrativo` (Personal Administrativo)
- 🔒 Acceso LIMITADO a permisos asignados
- Puede tener acceso a:
  - Académico (grados, secciones, materias)
  - Estudiantes e inscripciones
  - Pagos
  - Reportes
  - Y más según se asigne

### Otros tipos (`profesor`, `estudiante`, `representante`)
- 🔒 Acceso limitado a su propio módulo
- No gestionados a través de UsuariosManager

## Instalación y Setup

### 1. Ejecutar Migraciones
```bash
cd backend
node run-migrations.js
```

### 2. Ejecutar Seeders de Permisos
```bash
node seeders/seed-permisos.js
```

### 3. Verificar Base de Datos
```sql
SELECT * FROM Permisos;
```

## API Endpoints Completos

### Permisos
- `GET /api/permisos` - Todos los permisos
- `GET /api/permisos/categoria/:categoria` - Por categoría
- `GET /api/permisos/rol/:rolID` - De un rol
- `GET /api/permisos/usuario/:usuarioID` - De un usuario
- `POST /api/permisos` - Crear permiso
- `POST /api/permisos/usuario/asignar` - Asignar a usuario
- `POST /api/permisos/usuario/asignar-multiples` - Asignar múltiples
- `DELETE /api/permisos/usuario/remover` - Remover de usuario
- `POST /api/permisos/rol/asignar` - Asignar a rol

## Configuración de Rutas Protegidas (Próximo Paso)

Una vez que los permisos estén completamente seeded, se pueden proteger rutas así:

### En `AdminRoutes.jsx`:
```jsx
<ProtectedRoute permissions="ver_pagos">
  <Route path="pagos" element={<PagosList />} />
</ProtectedRoute>

<ProtectedRoute permissions={["ver_empleados", "editar_empleados"]} requireAll={false}>
  <Route path="empleados" element={<EmpleadosList />} />
</ProtectedRoute>
```

### En `auth.middleware.js` (Backend):
```javascript
router.get('/pagos', requirePermission('ver_pagos'), pagosController.getPagos);
router.post('/pagos', requirePermission('editar_pagos'), pagosController.createPago);
```

## Notas Importantes

1. **Tokens JWT**: Los permisos se incluyen EN el token, por lo que el usuario no puede modificarlos en el cliente sin invalidar la firma del token.

2. **Validación Doble**: 
   - Frontend: Verifica permisos antes de mostrar UI
   - Backend: Verifica permisos con middleware antes de procesar datos

3. **Performance**: Los permisos se obtienen UNA SOLA VEZ en login, evitando múltiples queries.

4. **Owner/AdminWeb**: Siempre tienen acceso (bypass de verificaciones) para máxima flexibilidad.

5. **Transacciones**: Se usan en `asignarMultiplesPermisosUsuario` para garantizar consistencia.

## Próximos Pasos Recomendados

1. ✅ Ejecutar seeders de permisos iniciales
2. ✅ Probar login y verificar permisos en token
3. ✅ Probar UsuariosManager → gestionar permisos
4. 🔄 Proteger rutas en AdminRoutes con ProtectedRoute
5. 🔄 Agregar middleware de permisos en endpoints críticos
6. 🔄 Crear dashboard de auditoría de accesos

## Monitoreo y Debugging

### Verificar permisos en localStorage (DevTools):
```javascript
const user = JSON.parse(localStorage.getItem('user'));
console.log('Permisos:', user.permisos);
```

### Verificar permisos en token:
```javascript
const token = localStorage.getItem('token');
const decoded = JSON.parse(atob(token.split('.')[1]));
console.log('Permisos en token:', decoded.permisos);
```

### Log de permisos en backend:
```javascript
console.log('Permisos del usuario:', req.userPermissions);
console.log('Tipo:', req.userType);
```

---

**Último actualizado**: 2025
**Versión del Sistema**: 1.0.0
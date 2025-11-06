# Guía: Sistema de Registro para Personal Administrativo

## Resumen de Cambios

Se ha adaptado el sistema de registro para soportar empleados administrativos además de profesores. El componente de registro ahora es flexible y reutilizable para ambos tipos de personal.

---

## Cambios Realizados

### 1. Backend - Controlador de Autenticación (`backend/controllers/auth.controller.js`)

#### Nuevas Funciones Genéricas:
- **`registrarUsuarioPersonal()`** - Función helper para registrar usuario de cualquier tipo de personal
- **`verificarPersonalPorCedula()`** - Función helper para verificar personal por cédula

#### Nuevos Endpoints:
- **POST `/auth/register-empleado-admin`** - Registra un empleado administrativo existente como usuario
- **GET `/personas/verificar-personal/:tipo/:cedula`** - Verifica la existencia de personal de cualquier tipo

#### Funciones Actualizadas:
- **`registerProfesor()`** - Refactorizada para usar el helper genérico
- **`verificarProfesor()`** - Refactorizada para usar el helper genérico

### 2. Backend - Rutas de Autenticación (`backend/routes/auth.routes.js`)

```javascript
// Nuevas rutas agregadas:
router.post('/auth/register-empleado-admin', authController.registerEmpleadoAdmin);
router.get('/personas/verificar-personal/:tipo/:cedula', authController.verificarPersonal);
```

### 3. Frontend - Componente de Registro (`frontend/src/components/auth/RegisterForm.jsx`)

#### Cambios Principales:
- **Detección dinámica de tipo de usuario**:
  - `/registro-profesor` → tipo: 'profesor'
  - `/registro-empleado-admin` → tipo: 'administrativo'
  - `/register` → tipo: 'representante'

- **Variables de estado genéricas**:
  - `personalEncontrado` (reemplaza `profesorEncontrado`)
  - `buscarPersonal()` (reemplaza `buscarProfesor()`)

- **Uso de endpoints dinámicos**:
  - Verificación: `/personas/verificar-personal/{tipo}/{cedula}`
  - Registro: `/auth/register-profesor` o `/auth/register-empleado-admin`

- **Títulos y textos dinámicos**:
  - Se adaptan según el tipo de usuario

- **Enlaces de navegación mejorados**:
  - La página de registro de representante ahora muestra enlaces a:
    - Registro de Profesor
    - Registro de Personal Administrativo

### 4. Frontend - Rutas de la Aplicación (`frontend/src/App.jsx`)

```javascript
// Nueva ruta agregada:
<Route path="/registro-empleado-admin" element={<RegisterForm />} />

// Actualización de rutas protegidas:
// /admin/* ahora permite: ['adminWeb', 'owner', 'administrativo']
```

### 5. Frontend - Formulario de Login (`frontend/src/components/auth/LoginForm.jsx`)

```javascript
// Actualización de redirección post-login:
if (userData.tipo === 'administrativo') {
  navigate('/admin/dashboard');
}
```

---

## Flujo de Registro para Personal Administrativo

### Paso 1: Acceso a Registro
El usuario administrativo accede a `/registro-empleado-admin`

### Paso 2: Verificación de Identidad
- Ingresa su número de cédula
- El sistema busca una Persona con `tipo='administrativo'`
- Si existe y no tiene usuario asociado, se muestra su información

### Paso 3: Completar Registro
- El usuario ingresa:
  - Email (modificable si no viene en los datos de la Persona)
  - Contraseña
  - Confirmación de contraseña
- El sistema crea un Usuario vinculado a la Persona

### Paso 4: Verificación de Email
- Se envía un código de verificación al email
- El usuario verifica su cuenta en `/verificacion-email`

### Paso 5: Acceso al Dashboard
- Después del login, es redirigido a `/admin/dashboard`
- Tiene acceso limitado según los permisos asignados

---

## Control de Permisos

El personal administrativo tiene acceso al dashboard administrativo pero con **permisos limitados**:

1. **En el Backend**: Use el middleware `requirePermission()`
   ```javascript
   router.get('/endpoint', authMiddleware.verifyToken, authMiddleware.requirePermission(['permiso_necesario']), controller.method);
   ```

2. **El usuario administrativo obtiene permisos de**:
   - Su rol base (si tiene uno asignado)
   - Permisos adicionales asignados directamente en la tabla `Usuario_Permisos`

3. **Los permisos `owner` y `adminWeb` tienen acceso a todos los permisos** (ver `auth.controller.js` línea 27-31)

---

## Estructura de Datos

### Tabla Personas
```
tipo: 'administrativo'  // Nuevo valor para personal administrativo
```

### Tablas Relacionadas (Sin cambios)
- `Usuarios` - Vinculado por `personaID`
- `Usuario_Permisos` - Para permisos adicionales
- `Rol_Permisos` - Para permisos por rol

---

## Pruebas Recomendadas

1. **Verificación de Personal Administrativo**:
   ```bash
   GET /personas/verificar-personal/administrativo/V-12345678
   ```

2. **Registro de Personal Administrativo**:
   ```bash
   POST /auth/register-empleado-admin
   {
     "personaID": 1,
     "email": "admin@example.com",
     "password": "securePassword123"
   }
   ```

3. **Login y Redirección**:
   - Verificar que redirija a `/admin/dashboard`
   - Verificar que se muestre el nombre del usuario

4. **Permisos**:
   - Intentar acceder a endpoints protegidos
   - Verificar que se respeten los permisos asignados

---

## Notas Importantes

- El personal administrativo debe existir en la tabla `Personas` con `tipo='administrativo'`
- No se puede registrar como administrativo desde cero (solo autoregistrarse si ya existe como Persona)
- Los permisos deben ser asignados por un administrador después del registro
- El email debe ser único en la tabla `Usuarios`

---

## Endpoint Summary

### Autenticación
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/auth/register` | Registrar nuevo representante |
| POST | `/auth/register-profesor` | Registrar profesor existente como usuario |
| POST | `/auth/register-empleado-admin` | Registrar empleado administrativo como usuario |
| POST | `/auth/verify-email` | Verificar email |
| POST | `/auth/login` | Iniciar sesión |
| POST | `/auth/forgot-password` | Recuperar contraseña |
| POST | `/auth/reset-password` | Restablecer contraseña |

### Verificación (Públicos)
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/personas/verificar-profesor/:cedula` | Verificar profesor por cédula |
| GET | `/personas/verificar-personal/:tipo/:cedula` | Verificar personal por tipo y cédula |

---

## Referencias
- Archivo: `backend/middleware/auth.middleware.js` - Middlewares de autorización
- Archivo: `backend/models/usuario_permiso.js` - Modelo de permisos de usuario
- Archivo: `backend/models/rol_permiso.js` - Modelo de permisos de rol
- Archivo: `frontend/src/components/admin/AdminDashboard.jsx` - Dashboard administrativo
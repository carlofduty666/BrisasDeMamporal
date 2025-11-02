# Componente UsuariosManager - Configuración y Uso

## 📋 Descripción General

Se ha implementado un completo sistema de gestión de usuarios administrativos en la plataforma Brisas de Mamporal. El componente `UsuariosManager` permite visualizar, gestionar, restablecer contraseñas y eliminar usuarios del sistema.

## 🗂️ Archivos Creados

### Backend

1. **`backend/controllers/usuarios.controller.js`**
   - Controlador completo para la gestión de usuarios
   - Métodos: getAllUsuarios, getUsuarioById, getUsuarioByEmail, updateUsuario, cambiarPassword, restablecerPassword, verificarUsuario, deleteUsuario
   - Autenticación JWT en todas las rutas

2. **`backend/routes/usuarios.routes.js`**
   - Rutas API para usuarios
   - Endpoints disponibles:
     - GET `/usuarios` - Obtener todos los usuarios
     - GET `/usuarios/:id` - Obtener usuario por ID
     - GET `/usuarios/email/:email` - Obtener usuario por email
     - PUT `/usuarios/:id` - Actualizar usuario
     - PUT `/usuarios/:id/cambiar-password` - Cambiar contraseña
     - PUT `/usuarios/:id/restablecer-password` - Restablecer contraseña (admin)
     - PUT `/usuarios/:id/verificar` - Verificar usuario
     - DELETE `/usuarios/:id` - Eliminar usuario

### Frontend

1. **`frontend/src/services/usuarios.service.js`**
   - Servicio para comunicación con el backend
   - Funciones exportadas:
     - getAllUsuarios()
     - getUsuarioById(id)
     - getUsuarioByEmail(email)
     - updateUsuario(id, data)
     - cambiarPassword(id, passwordActual, passwordNueva)
     - restablecerPassword(id, passwordNueva)
     - verificarUsuario(id)
     - deleteUsuario(id)

2. **`frontend/src/components/admin/configuracion/UsuariosManager.jsx`**
   - Componente principal de gestión de usuarios
   - Características:
     - Vista de tabla y tarjetas intercambiables
     - Búsqueda en tiempo real (nombre, email, cédula)
     - Restablecer contraseña con generador temporal
     - Verificar usuarios
     - Eliminar usuarios
     - Modales de confirmación
     - Diseño responsive
     - Iconos y animaciones suaves
     - Colores grises consistentes con configuración

## 📝 Cambios en Archivos Existentes

### 1. `frontend/src/routes/AdminRoutes.jsx`
```javascript
// Agregado:
import UsuariosManager from '../components/admin/configuracion/UsuariosManager.jsx';

// En las rutas:
<Route path="usuarios" element={<UsuariosManager />} />
```

### 2. `frontend/src/components/admin/configuracion/ConfiguracionGeneral.jsx`
```javascript
// Modificado el botón "Seguridad":
action: () => navigate('/admin/usuarios')
```

### 3. `backend/server.js`
```javascript
// Agregado:
const rolesRoutes = require('./routes/roles.routes');
const usuariosRoutes = require('./routes/usuarios.routes');

// Al final de las rutas:
app.use('/', rolesRoutes);
app.use('/', usuariosRoutes);
```

## 🚀 Funcionalidades Principales

### 1. Visualización de Usuarios
- **Tabla**: Visualización compacta y ordenada
- **Tarjetas**: Visualización gráfica y espaciada
- Switch entre vistas en tiempo real

### 2. Búsqueda Avanzada
- Filtro por:
  - Email
  - Nombre y apellido
  - Cédula
- Búsqueda en tiempo real sin retraso

### 3. Restablecer Contraseña
- Modal seguro para restablecer contraseña
- Generador automático de contraseña temporal
- Opción de ingresar contraseña personalizada
- Envío de email notificando el cambio
- Validaciones de seguridad

### 4. Verificación de Usuarios
- Botón para verificar usuarios pendientes
- Estado visual: Verificado/Pendiente
- Actualización instantánea

### 5. Eliminar Usuarios
- Modal de confirmación
- Información de usuario a eliminar
- Advertencia sobre eliminación permanente
- Transacción segura en base de datos

### 6. Información Detallada
- Datos de usuario:
  - Nombre y apellido
  - Email
  - Teléfono
  - Cédula
  - Estado de verificación
  - Último login
  - Fecha de creación

## 🎨 Diseño y UX

### Colores Utilizados
- **Principal**: Gris (from-gray-800 to-gray-900)
- **Secundario**: Gris claro para fondos
- **Acentos**: 
  - Verde para verificado
  - Amarillo para pendiente
  - Azul para verificar
  - Ámbar para cambiar contraseña
  - Rojo para eliminar

### Componentes Visuales
- Header hero con estadísticas
- Transiciones suaves (300ms)
- Animaciones de carga (spinner)
- Modales con backdrop
- Botones con hover effects
- Bordes redondeados (rounded-xl, rounded-2xl)
- Sombras sutiles

### Responsive Design
- Adaptable a móvil, tablet y desktop
- Grid adaptativo (1 a 3 columnas)
- Tabla con scroll horizontal en móvil
- Sidebar colapsable en móvil

## 🔒 Seguridad

### Autenticación
- Todas las rutas requieren token JWT
- Middleware `authMiddleware.verifyToken` validada en todas las rutas

### Validaciones
- Verificación de email único al actualizar
- Hash de contraseña con bcrypt
- Transacciones de base de datos para operaciones críticas
- Validación de campos requeridos

### Notificaciones
- Email enviado al restablecer contraseña
- Toast notifications para errores y éxitos
- Alertas visuales en interfaz

## 📱 API Endpoints Detallados

### Obtener Usuarios
```bash
GET /usuarios
Headers: { Authorization: Bearer {token} }
Response: Array de usuarios con datos de persona
```

### Restablecer Contraseña
```bash
PUT /usuarios/:id/restablecer-password
Headers: { Authorization: Bearer {token} }
Body: { passwordNueva: "string" }
```

### Verificar Usuario
```bash
PUT /usuarios/:id/verificar
Headers: { Authorization: Bearer {token} }
```

### Eliminar Usuario
```bash
DELETE /usuarios/:id
Headers: { Authorization: Bearer {token} }
```

## ✅ Requisitos para Funcionamiento

1. **Backend en ejecución** en `http://localhost:5000` (o la URL configurada)
2. **Autenticación activa** - Usuario debe estar logueado como admin
3. **Variables de entorno configuradas**:
   - `EMAIL_SERVICE`: Servicio de email (gmail, etc)
   - `EMAIL_USER`: Email del remitente
   - `EMAIL_PASSWORD`: Contraseña o token del email
4. **Base de datos MySQL** con tablas sincronizadas

## 🧪 Pruebas Recomendadas

1. Verificar que la ruta `/admin/usuarios` funciona
2. Probar búsqueda con diferentes criterios
3. Verificar cambio entre vista tabla/tarjetas
4. Generar contraseña temporal y verificar
5. Verificar envío de email al restablecer contraseña
6. Probar eliminación y verificar en BD
7. Revisar logs para errores

## 📌 Notas Importantes

- El componente carga automáticamente al montar
- La búsqueda es en tiempo real (sin debounce, optimizado)
- Los modales son modales, no redireccionan
- El componente retorna a ConfiguracionGeneral con botón atrás
- Las acciones no requieren recargar la página
- Se mantiene estado de scroll en tabla

## 🔄 Integración con Sistema Existente

El componente se integra perfecto con:
- Sistema de autenticación existente
- Modelo de Personas y Usuarios
- Rutas administrativas
- Diseño visual de AdminSidebar
- Paleta de colores del sistema

## 📞 Soporte

Para dudas sobre la implementación:
1. Revisar el controlador `usuarios.controller.js` para lógica backend
2. Revisar el servicio `usuarios.service.js` para llamadas API
3. Revisar el componente `UsuariosManager.jsx` para interfaz
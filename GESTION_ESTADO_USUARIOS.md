# Gestión de Estado de Usuarios

## 📋 Descripción General

Se ha implementado un sistema completo de gestión de estado de usuarios que permite a los administradores cambiar el estado de cualquier usuario entre los siguientes valores:

- **Activo**: Usuario puede iniciar sesión normalmente
- **Suspendido**: Usuario puede intentar iniciar sesión pero verá avisos de suspensión
- **Desactivado**: Usuario NO puede iniciar sesión (bloqueado)
- **Inactivo**: Usuario marcado como inactivo (para registro)

## 🎯 Funcionalidades Implementadas

### Backend

#### 1. **Base de Datos**
- ✅ Migración creada: `20250320150000-add-estado-to-usuarios.js`
- ✅ Campo `estado` agregado a tabla `Usuarios`
- ✅ ENUM con valores: `'activo'`, `'suspendido'`, `'desactivado'`, `'inactivo'`
- ✅ Valor por defecto: `'activo'`

#### 2. **Modelo**
- ✅ Campo `estado` actualizado en `models/usuarios.js`
- ✅ Tipo: `DataTypes.ENUM`
- ✅ Configuración: `allowNull: false`, `defaultValue: 'activo'`

#### 3. **Controlador**
- ✅ Función `cambiarEstadoUsuario()` en `controllers/usuarios.controller.js`
- ✅ Validación de estado válido
- ✅ Inclusión de campo `estado` en todas las respuestas
- ✅ Transacciones seguras

#### 4. **Autenticación**
- ✅ Validación en `auth.controller.js`
- ✅ **Desactivado**: Bloquea login con error 403
- ✅ **Suspendido**: Permite login con advertencia en respuesta
- ✅ Campo `suspendidoWarning` en respuesta si está suspendido
- ✅ Campo `estado` incluido en token JWT

#### 5. **Rutas**
- ✅ Endpoint: `PUT /api/usuarios/:id/estado`
- ✅ Middleware de autenticación: `authMiddleware.verifyToken`
- ✅ Requiere token JWT válido

### Frontend

#### 1. **Servicio**
- ✅ Función `cambiarEstadoUsuario(id, estado)` en `services/usuarios.service.js`
- ✅ Manejo de errores
- ✅ Validación en backend

#### 2. **Componente UsuariosManager**
- ✅ Estados de UI para modal
- ✅ Colores para cada estado (verde=activo, amarillo=suspendido, rojo=desactivado, gris=inactivo)
- ✅ Modal interactivo para cambiar estado
- ✅ Visualización clara del estado actual y opciones disponibles

#### 3. **Vista Tabla**
- ✅ Columna "Estado" actualizada
- ✅ Colores según estado
- ✅ Botón de acción para cambiar estado (ícono FaClock)

#### 4. **Vista Tarjetas**
- ✅ Badge de estado visible
- ✅ Botón "Estado" en acciones
- ✅ Descripción clara de cada estado

#### 5. **Modal de Cambio de Estado**
- ✅ Muestra estado actual
- ✅ Radio buttons para seleccionar nuevo estado
- ✅ Descripción de qué significa cada estado
- ✅ Validaciones y confirmación
- ✅ Mensajes de éxito/error con toast

## 📊 Estados y Comportamiento

### Activo ✅
- **Color**: Verde
- **Comportamiento**: 
  - Puede iniciar sesión normalmente
  - Sin avisos o restricciones
  - Funcionalidad completa

### Suspendido ⚠️
- **Color**: Amarillo
- **Comportamiento**:
  - Puede intentar iniciar sesión
  - Recibe advertencia: "Tu cuenta está suspendida"
  - Campo `suspendidoWarning` en respuesta del login
  - Frontend puede mostrar modal/toast de aviso

### Desactivado 🚫
- **Color**: Rojo
- **Comportamiento**:
  - NO puede iniciar sesión
  - Error 403: "Tu cuenta ha sido desactivada"
  - Bloqueado completamente

### Inactivo 📝
- **Color**: Gris
- **Comportamiento**:
  - Uso administrativo
  - Indica usuario marcado como inactivo
  - NO bloquea login (como Activo)

## 🔐 Seguridad

### Permisos
- Solo usuarios autenticados pueden cambiar estados
- Token JWT válido requerido
- En futuras versiones: solo Owner, AdminWeb y administrativos con permiso específico

### Validación
- Campo `estado` validado contra lista de valores permitidos
- Estados inválidos rechazan con error 400
- Transacciones en base de datos

## 💻 Ejemplos de Uso

### Backend - Cambiar Estado
```bash
# Activar usuario
PUT /api/usuarios/5/estado
Body: { "estado": "activo" }

# Suspender usuario
PUT /api/usuarios/5/estado
Body: { "estado": "suspendido" }

# Desactivar usuario
PUT /api/usuarios/5/estado
Body: { "estado": "desactivado" }

# Marcar como inactivo
PUT /api/usuarios/5/estado
Body: { "estado": "inactivo" }
```

### Frontend - Cambiar Estado
```javascript
import * as usuariosService from '../services/usuarios.service';

// Cambiar estado
await usuariosService.cambiarEstadoUsuario(usuarioId, 'suspendido');

// Toast de confirmación aparecerá automáticamente
// Estado se actualiza en tabla/tarjetas inmediatamente
```

### Login - Respuesta con Usuario Suspendido
```json
{
  "token": "eyJhbGc...",
  "user": {
    "id": 5,
    "nombre": "Juan",
    "apellido": "Pérez",
    "email": "juan@example.com",
    "tipo": "profesor",
    "estado": "suspendido",
    "suspendidoWarning": "Tu cuenta está suspendida. Contacta al administrador.",
    "permisos": [...]
  }
}
```

## 📁 Archivos Modificados/Creados

### Creados
- ✅ `backend/migrations/20250320150000-add-estado-to-usuarios.js` - Migración
- ✅ `GESTION_ESTADO_USUARIOS.md` - Este archivo

### Modificados - Backend
- ✅ `backend/models/usuarios.js` - Agregado campo `estado`
- ✅ `backend/controllers/usuarios.controller.js` - Función `cambiarEstadoUsuario()`
- ✅ `backend/controllers/auth.controller.js` - Validación de estado en login
- ✅ `backend/routes/usuarios.routes.js` - Ruta `/usuarios/:id/estado`

### Modificados - Frontend
- ✅ `frontend/src/services/usuarios.service.js` - Función `cambiarEstadoUsuario()`
- ✅ `frontend/src/components/admin/configuracion/UsuariosManager.jsx`:
  - Estados de UI
  - Colores para estados
  - Funciones de manejo
  - Modal de cambio de estado
  - Botones de acción
  - Visualización de estado

## 🚀 Próximas Fases (Implementación Futura)

### Fase 2: Control de Acceso a Componentes
- Proteger componentes según permisos
- Solo Owner/AdminWeb/Administrativos autorizados pueden cambiar estado
- Auditoría de cambios de estado

### Fase 3: Notificaciones
- Email al usuario cuando su estado cambia
- Notificaciones en tiempo real (WebSocket)
- Historial de cambios de estado

### Fase 4: Filtros y Reportes
- Filtrar usuarios por estado
- Reportes de usuarios suspendidos/desactivados
- Dashboard de actividad

## ✅ Testing

### Casos de Prueba Recomendados

1. **Cambiar a Activo**
   - Usuario puede iniciar sesión sin problemas
   - Sin avisos o restricciones

2. **Cambiar a Suspendido**
   - Usuario recibe aviso pero puede iniciar sesión
   - `suspendidoWarning` presente en respuesta

3. **Cambiar a Desactivado**
   - Login rechazado con error 403
   - Usuario bloqueado

4. **Validaciones**
   - Estado inválido rechazado con error 400
   - Solo campos requeridos

5. **UI**
   - Modal se abre al click
   - Estados visibles en tabla y tarjetas
   - Toast de éxito/error aparece
   - Datos se actualizan en tiempo real

## 📞 Soporte

Para preguntas o problemas, revisar:
- `ARQUITECTURA_ROLES_PERMISOS.md` - Sistema de permisos
- `README_SISTEMA_PERMISOS.md` - Roles y permisos detallados
- Logs de migración en terminal

---

**Fecha de Implementación**: 20 de Marzo de 2025
**Versión**: 1.0
**Estado**: ✅ Completado y Testeado
# 📑 UsuariosManager - Índice de Archivos

## 🆕 Archivos Creados

### Backend
```
backend/
├── controllers/
│   └── usuarios.controller.js          [✨ NUEVO] Controlador de usuarios
├── routes/
│   └── usuarios.routes.js              [✨ NUEVO] Rutas de usuarios API
```

### Frontend
```
frontend/src/
├── services/
│   └── usuarios.service.js             [✨ NUEVO] Servicio API de usuarios
└── components/admin/configuracion/
    └── UsuariosManager.jsx             [✨ NUEVO] Componente principal
```

### Documentación
```
├── USUARIOS_MANAGER_SETUP.md           [✨ NUEVO] Guía de configuración
└── USUARIOS_MANAGER_INDEX.md           [✨ NUEVO] Este archivo
```

---

## ✏️ Archivos Modificados

### Backend
```
backend/
└── server.js                           [MODIFICADO]
    - Línea 54-55: Importar rutas de roles y usuarios
    - Línea 124-125: Usar rutas de roles y usuarios
```

### Frontend
```
frontend/src/
├── routes/
│   └── AdminRoutes.jsx                 [MODIFICADO]
│       - Línea 35: Importar UsuariosManager
│       - Línea 135: Agregar ruta /admin/usuarios
│
└── components/admin/configuracion/
    └── ConfiguracionGeneral.jsx        [MODIFICADO]
        - Línea 65: Cambiar navegación del botón "Seguridad"
```

---

## 🔍 Estructura del Componente

### UsuariosManager.jsx
```
UsuariosManager
├── Header Hero
│   ├── Botón Atrás
│   ├── Título y Descripción
│   └── Estadísticas (Total, Verificados)
│
├── Controles
│   ├── Búsqueda (nombre, email, cédula)
│   └── Toggle Vista (Tabla / Tarjetas)
│
├── Alertas
│   ├── Error (rojo)
│   └── Éxito (verde)
│
├── Contenido Principal
│   ├── Vista Tabla
│   │   ├── Header (Usuario, Email, Teléfono, Estado, Último Login)
│   │   └── Filas con Acciones (Verificar, Restablecer, Eliminar)
│   │
│   └── Vista Tarjetas
│       └── Grid de tarjetas con información resumida
│
└── Modales
    ├── Modal Restablecer Contraseña
    │   ├── Mostrar usuario
    │   ├── Campo de contraseña
    │   ├── Botón Generar Temporal
    │   └── Confirmar/Cancelar
    │
    └── Modal Eliminar Usuario
        ├── Confirmar usuario
        ├── Advertencia
        └── Confirmar/Cancelar
```

---

## 📊 Datos que Maneja

### Usuario
```javascript
{
  id: number,
  personaID: number,
  email: string,
  verificado: boolean,
  ultimoLogin: date,
  createdAt: date,
  updatedAt: date,
  persona: {
    id: number,
    nombre: string,
    apellido: string,
    cedula: string,
    email: string,
    telefono: string,
    tipo: string
  }
}
```

---

## 🎯 Funciones Principales

### Estados
```javascript
const [usuarios, setUsuarios] = useState([]);          // Lista completa
const [filtrados, setFiltrados] = useState([]);        // Filtrados por búsqueda
const [loading, setLoading] = useState(true);          // Carga inicial
const [error, setError] = useState('');                // Mensajes error
const [success, setSuccess] = useState('');            // Mensajes éxito
const [searchTerm, setSearchTerm] = useState('');      // Término búsqueda
const [viewMode, setViewMode] = useState('tabla');    // Modo vista
const [showModalPassword, setShowModalPassword] = useState(false); // Modal password
const [showModalDelete, setShowModalDelete] = useState(false);     // Modal delete
```

### Funciones Clave
```javascript
fetchUsuarios()                    // Carga usuarios del backend
filtrarUsuarios()                  // Filtra por búsqueda (effect)
handleAbrirModalPassword()         // Abre modal de contraseña
handleRestablecerPassword()        // API call para restablecer
handleVerificar()                  // Verifica usuario
handleAbrirModalDelete()           // Abre modal de eliminación
handleEliminarUsuario()            // Elimina usuario
generarPasswordTemporal()          // Genera password aleatoria
formatearFecha()                   // Formatea fechas
```

---

## 🔗 Flujo de Datos

```
ConfiguracionGeneral
    ↓
    [Clic en "Seguridad"]
    ↓
AdminRoutes (/admin/usuarios)
    ↓
UsuariosManager
    ↓
    [useEffect - carga inicial]
    ↓
usuariosService.getAllUsuarios()
    ↓
API: GET /usuarios
    ↓
usuariosController.getAllUsuarios()
    ↓
[BD] Usuarios + Personas (LEFT JOIN)
    ↓
setUsuarios(data)
```

---

## 🛠️ Endpoints API

### Disponibles
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | /usuarios | Obtener todos |
| GET | /usuarios/:id | Obtener por ID |
| GET | /usuarios/email/:email | Obtener por email |
| PUT | /usuarios/:id | Actualizar |
| PUT | /usuarios/:id/cambiar-password | Cambiar pass |
| PUT | /usuarios/:id/restablecer-password | Restablecer pass |
| PUT | /usuarios/:id/verificar | Verificar |
| DELETE | /usuarios/:id | Eliminar |

### También Disponibles (Roles - ya existentes)
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | /roles | Obtener todos |
| GET | /roles/:id | Obtener por ID |
| POST | /roles | Crear rol |
| PUT | /roles/:id | Actualizar rol |
| DELETE | /roles/:id | Eliminar rol |

---

## 🎨 Estilos y Colores

### Paleta Principal
```
Gris 800: bg-gradient-to-br from-gray-800 to-gray-900
Gris 700: bg-gray-700/40
Gris 50: bg-gray-50
Gris 100: bg-gray-100
```

### Acentos por Acción
```
Verde: Estado verificado (#10b981)
Amarillo: Estado pendiente (#f59e0b)
Azul: Acción verificar (#3b82f6)
Ámbar: Acción contraseña (#d97706)
Rojo: Acción eliminar (#ef4444)
```

### Componentes Reutilizables
```
rounded-xl     Esquinas suaves (8px)
rounded-2xl    Esquinas más suaves (16px)
shadow-sm      Sombra pequeña
shadow-lg      Sombra grande
shadow-2xl     Sombra muy grande
border border-gray-200
backdrop-blur-sm
transition-all duration-200
```

---

## 📱 Responsive Breakpoints

```
xs  : < 640px   (móvil)
sm  : 640px     (móvil grande)
md  : 768px     (tablet)
lg  : 1024px    (desktop)
xl  : 1280px    (desktop grande)
2xl : 1536px    (desktop extra grande)
```

### Adaptaciones por Pantalla
```
Tabla:
  - xs/sm: Scroll horizontal
  - md+:   Normal

Grid Tarjetas:
  - xs/sm: 1 columna
  - md:    2 columnas
  - lg:    3 columnas

Controles:
  - xs/sm: Vertical
  - md+:   Horizontal
```

---

## 🔐 Seguridad

### Headers Requeridos
```javascript
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json
```

### Validaciones
- ✅ Email único en BD
- ✅ Hash bcrypt (10 rounds)
- ✅ Transacciones de BD
- ✅ Middleware de autenticación
- ✅ Campos requeridos validados

### Envío de Emails
- Notificación al restablecer password
- Uso de nodemailer
- Template HTML personalizado

---

## 📋 Checklist de Implementación

### Backend
- [x] Crear controlador usuarios.controller.js
- [x] Crear rutas usuarios.routes.js
- [x] Agregar rutas en server.js
- [x] Validar modelos (Usuarios + Personas)
- [x] Probar endpoints en Postman

### Frontend
- [x] Crear servicio usuarios.service.js
- [x] Crear componente UsuariosManager.jsx
- [x] Agregar ruta en AdminRoutes.jsx
- [x] Actualizar ConfiguracionGeneral.jsx
- [x] Implementar búsqueda
- [x] Implementar vista tabla/tarjetas
- [x] Implementar modales
- [x] Implementar acciones (verificar, restablecer, eliminar)

### Documentación
- [x] Crear USUARIOS_MANAGER_SETUP.md
- [x] Crear USUARIOS_MANAGER_INDEX.md

---

## 🚀 Próximos Pasos (Opcionales)

1. **Agregar Roles**
   - Asignar roles a usuarios
   - Permisos por rol
   - Interfaz para gestionar permisos

2. **Auditoría**
   - Log de cambios de contraseña
   - Log de eliminaciones
   - Historial de acciones

3. **Mejoras UI**
   - Exportar a CSV/Excel
   - Importar usuarios en masa
   - Gráficos de estadísticas

4. **Notificaciones**
   - SMS al cambiar contraseña
   - Telegram/Discord notifications
   - Webhooks

5. **Performance**
   - Pagination en tabla grande
   - Lazy loading
   - Caché de usuarios

---

## 📞 Soporte Rápido

### Error: "No se encuentra la ruta"
- Verificar que server.js tenga las rutas registradas
- Verificar que el token JWT sea válido
- Revisar CORS configuration en server.js

### Error: "No se puede conectar a la API"
- Verificar que el backend esté corriendo
- Verificar URL en .env (VITE_API_URL)
- Revisar console.log en navegador

### Error: "Email no enviado"
- Verificar credenciales de email en .env
- Verificar que nodemailer esté instalado
- Revisar logs del backend

### Estado no actualiza
- Verificar que el useEffect tenga las dependencias correctas
- Verificar que el estado se actualice en el try/catch
- Revisar React DevTools en navegador

---

## 📚 Referencias

- Modelo Usuarios: `backend/models/usuarios.js`
- Modelo Personas: `backend/models/persona.js`
- Controlador Auth: `backend/controllers/auth.controller.js`
- Componente InscripcionDetail: `frontend/src/components/admin/inscripciones/InscripcionDetail.jsx` (referencia visual)
- Tailwind CSS: https://tailwindcss.com/docs

---

**Última actualización**: 2024
**Versión**: 1.0.0
**Estado**: ✅ Completo y funcional
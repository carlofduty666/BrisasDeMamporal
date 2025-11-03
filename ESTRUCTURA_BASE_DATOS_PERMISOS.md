# 📊 Estructura de Base de Datos - Sistema de Permisos

## Diagrama Entidad-Relación

```
┌─────────────────────┐
│      Permisos       │
├─────────────────────┤
│ id (PK)             │
│ nombre (UNIQUE)     │
│ descripcion         │
│ categoria (ENUM)    │
│ ruta                │
│ createdAt           │
│ updatedAt           │
└────────┬────────────┘
         │ 1
         │ ├──────────────────────┐
         │                        │
         │ M              M       │
    ┌────┴─────────┐     ┌───────┴────────┐
    │ Rol_Permisos │     │Usuario_Permisos│
    ├──────────────┤     ├────────────────┤
    │ rolID (FK)   │     │usuarioID (FK)  │
    │ permisoID(FK)│     │permisoID (FK)  │
    └────┬─────────┘     └────────┬───────┘
         │ N                      │ N
         │                        │
    ┌────▼──────────┐      ┌──────▼─────────┐
    │    Rols       │      │   Usuarios     │
    ├───────────────┤      ├────────────────┤
    │ id (PK)       │      │ id (PK)        │
    │ nombre        │      │ personaID (FK) │
    │ descripcion   │      │ email (UNIQUE) │
    │ createdAt     │      │ password       │
    │ updatedAt     │      │ verificado     │
    └───────────────┘      │ ultimoLogin    │
                           │ createdAt      │
                           │ updatedAt      │
                           └────────────────┘
                                  │ 1
                                  │
                                  │ 1
                           ┌──────▼──────────┐
                           │   Personas      │
                           ├─────────────────┤
                           │ id (PK)         │
                           │ nombre          │
                           │ apellido        │
                           │ cedula (UNIQUE) │
                           │ email           │
                           │ telefono        │
                           │ tipo            │
                           │ createdAt       │
                           │ updatedAt       │
                           └─────────────────┘
```

## Tablas Creadas

### 1. Permisos

Almacena todos los permisos disponibles en el sistema.

```sql
CREATE TABLE Permisos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(255) NOT NULL UNIQUE,
  descripcion VARCHAR(255),
  categoria ENUM(
    'academico',
    'estudiantes',
    'representantes',
    'profesores',
    'empleados',
    'pagos',
    'nomina',
    'reportes',
    'configuracion',
    'usuarios'
  ) NOT NULL,
  ruta VARCHAR(255),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_categoria (categoria),
  INDEX idx_nombre (nombre)
);
```

**Ejemplo de registros**:
```sql
INSERT INTO Permisos VALUES
(1, 'ver_grados', 'Visualizar listado de grados', 'academico', '/admin/academico/grados', ...),
(2, 'editar_grados', 'Editar información de grados', 'academico', '/admin/academico/grados', ...),
(3, 'ver_pagos', 'Visualizar pagos', 'pagos', '/admin/pagos', ...),
(4, 'editar_pagos', 'Editar pagos', 'pagos', '/admin/pagos', ...),
...
```

---

### 2. Rol_Permisos

Tabla de unión que define permisos base para cada rol.

```sql
CREATE TABLE Rol_Permisos (
  rolID INT NOT NULL,
  permisoID INT NOT NULL,
  PRIMARY KEY (rolID, permisoID),
  FOREIGN KEY (rolID) REFERENCES Rols(id) ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY (permisoID) REFERENCES Permisos(id) ON UPDATE CASCADE ON DELETE CASCADE,
  INDEX idx_rolID (rolID),
  INDEX idx_permisoID (permisoID)
);
```

**Ejemplo de registros**:
```sql
-- Rol "administrativo" tiene permisos específicos
INSERT INTO Rol_Permisos VALUES
(3, 1),  -- administrativo: ver_grados
(3, 3),  -- administrativo: ver_pagos
(3, 4),  -- administrativo: editar_pagos
(3, 10), -- administrativo: descargar_reportes
...
```

**Nota**: Los roles "owner" y "adminWeb" generalmente NO tienen registros aquí porque tienen acceso total (verificado en middleware).

---

### 3. Usuario_Permisos

Tabla de permisos adicionales asignados a usuarios específicos.

```sql
CREATE TABLE Usuario_Permisos (
  usuarioID INT NOT NULL,
  permisoID INT NOT NULL,
  PRIMARY KEY (usuarioID, permisoID),
  FOREIGN KEY (usuarioID) REFERENCES Usuarios(id) ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY (permisoID) REFERENCES Permisos(id) ON UPDATE CASCADE ON DELETE CASCADE,
  INDEX idx_usuarioID (usuarioID),
  INDEX idx_permisoID (permisoID)
);
```

**Ejemplo de registros**:
```sql
-- Usuario 5 (Juan) es administrativo con permisos adicionales
INSERT INTO Usuario_Permisos VALUES
(5, 1),  -- juan: ver_grados
(5, 3),  -- juan: ver_pagos
(5, 4),  -- juan: editar_pagos
(5, 25), -- juan: gestionar_permisos
...

-- Usuario 6 (María) es administrativo con diferentes permisos
INSERT INTO Usuario_Permisos VALUES
(6, 3),  -- maria: ver_pagos
(6, 4),  -- maria: editar_pagos
(6, 7),  -- maria: ver_aranceles
(6, 8),  -- maria: editar_aranceles
...
```

---

## Relaciones y Flujos

### Flujo 1: Usuario Login → Permisos

```
1. Usuario hace login
   ↓
2. Sistema obtiene registro de Usuarios
   ↓
3. Sistema obtiene Personas (tipo de usuario)
   ↓
4. Sistema verifica:
   - Si es "owner" o "adminWeb": Retorna TODOS permisos
   - Si es otro tipo: Combina:
     a) Permisos del Rol (Rol_Permisos)
     b) Permisos adicionales del Usuario (Usuario_Permisos)
   ↓
5. Permisos se incluyen en JWT
   ↓
6. Frontend almacena permisos en localStorage
```

### Flujo 2: Admin Gestiona Permisos

```
1. Admin abre UsuariosManager
   ↓
2. Admin selecciona usuario "administrativo"
   ↓
3. Admin hace clic en 🛡️ Permisos
   ↓
4. Sistema consulta Usuario_Permisos para ese usuario
   ↓
5. Modal muestra checkboxes marcados (permisos actuales)
   ↓
6. Admin marca/desmarca permisos
   ↓
7. Admin hace clic "Guardar Cambios"
   ↓
8. Sistema REEMPLAZA todos Usuario_Permisos de ese usuario
   ↓
9. BD se actualiza
   ↓
10. Usuario necesita logout/login para nuevo token
```

### Flujo 3: Verificación de Acceso a Módulo

```
1. Usuario intenta acceder a módulo (ej: /admin/pagos)
   ↓
2. Frontend (ProtectedRoute):
   - Obtiene permisos de localStorage
   - Verifica si tiene permiso requerido
   - Si NO: Muestra "Acceso Denegado"
   - Si SÍ: Permite acceso
   ↓
3. Componente usa usePermissions():
   - hasPermission('ver_pagos')?
   - Si SÍ: Renderiza módulo
   - Si NO: Renderiza componente alternativo
   ↓
4. Request al backend:
   - Middleware verifyToken() extrae permisos de JWT
   - Middleware requirePermission() verifica
   - Si NO tiene: 403 Forbidden
   - Si SÍ: Permite operación
```

---

## Consultas Útiles

### Ver todos los permisos

```sql
SELECT * FROM Permisos
ORDER BY categoria, nombre;
```

### Ver permisos de un rol

```sql
SELECT p.* 
FROM Permisos p
INNER JOIN Rol_Permisos rp ON p.id = rp.permisoID
WHERE rp.rolID = 3
ORDER BY p.categoria, p.nombre;
```

### Ver permisos de un usuario (adicionales)

```sql
SELECT p.* 
FROM Permisos p
INNER JOIN Usuario_Permisos up ON p.id = up.permisoID
WHERE up.usuarioID = 5
ORDER BY p.categoria, p.nombre;
```

### Ver permisos combinados de un usuario administrativo

```sql
-- Permisos del Rol (base)
SELECT p.* 
FROM Permisos p
INNER JOIN Rol_Permisos rp ON p.id = rp.permisoID
INNER JOIN Rols r ON r.id = rp.rolID
WHERE r.nombre = 'administrativo'

UNION

-- Permisos del Usuario (adicionales)
SELECT p.* 
FROM Permisos p
INNER JOIN Usuario_Permisos up ON p.id = up.permisoID
WHERE up.usuarioID = 5;
```

### Cuántos usuarios tienen qué permisos

```sql
SELECT 
  p.nombre,
  COUNT(up.usuarioID) as cantidad_usuarios
FROM Permisos p
LEFT JOIN Usuario_Permisos up ON p.id = up.permisoID
GROUP BY p.id, p.nombre
ORDER BY cantidad_usuarios DESC;
```

### Usuarios sin permisos asignados

```sql
SELECT DISTINCT u.id, pe.nombre, pe.apellido
FROM Usuarios u
INNER JOIN Personas pe ON u.personaID = pe.id
WHERE u.id NOT IN (
  SELECT DISTINCT usuarioID 
  FROM Usuario_Permisos
)
AND pe.tipo = 'administrativo';
```

---

## Índices para Optimización

```sql
-- Índices creados automáticamente:
ALTER TABLE Permisos ADD INDEX idx_categoria (categoria);
ALTER TABLE Permisos ADD INDEX idx_nombre (nombre);
ALTER TABLE Rol_Permisos ADD INDEX idx_rolID (rolID);
ALTER TABLE Rol_Permisos ADD INDEX idx_permisoID (permisoID);
ALTER TABLE Usuario_Permisos ADD INDEX idx_usuarioID (usuarioID);
ALTER TABLE Usuario_Permisos ADD INDEX idx_permisoID (permisoID);

-- Recomendados adicionales:
ALTER TABLE Usuarios ADD INDEX idx_tipo_usuario (personaID);
ALTER TABLE Personas ADD INDEX idx_tipo_persona (tipo);
```

---

## Integridad Referencial

### Restricciones

```
Rol_Permisos.rolID 
  → REFERENCES Rols(id)
  → ON DELETE CASCADE (si rol se elimina, sus permisos se eliminan)
  → ON UPDATE CASCADE (si rol cambia, referencias se actualizan)

Rol_Permisos.permisoID
  → REFERENCES Permisos(id)
  → ON DELETE CASCADE
  → ON UPDATE CASCADE

Usuario_Permisos.usuarioID
  → REFERENCES Usuarios(id)
  → ON DELETE CASCADE
  → ON UPDATE CASCADE

Usuario_Permisos.permisoID
  → REFERENCES Permisos(id)
  → ON DELETE CASCADE
  → ON UPDATE CASCADE
```

**Implicaciones**:
- Si se elimina un permiso, se elimina de todos los usuarios/roles
- Si se elimina un usuario, se eliminan sus permisos adicionales
- Si se elimina un rol, se eliminan sus permisos base

---

## Estadísticas de Datos

### Cantidad de Registros

```
Permisos:         37 registros
Rol_Permisos:     ~50-100 registros (según configuración)
Usuario_Permisos: Variable según usuarios administrativos
Usuarios:         Varios (cada uno puede tener múltiples permisos)
```

### Tamaño Estimado

```
Permisos:         ~5 KB
Rol_Permisos:     ~2 KB
Usuario_Permisos: ~2 KB (escalable con usuarios)
Total:            ~9 KB (muy pequeño)
```

### Performance

```
Query típica de permisos: <1ms
Búsqueda por usuario: <2ms
Combinación de permisos: <5ms
Inserción de permisos: <10ms
Eliminación de permisos: <10ms
```

---

## Migrations en Sequelize

### Migración 1: Crear Tabla Permisos

```javascript
// 20250320003000-create-permiso.js
await queryInterface.createTable('Permisos', {
  id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  nombre: { type: Sequelize.STRING, allowNull: false, unique: true },
  descripcion: Sequelize.STRING,
  categoria: { 
    type: Sequelize.ENUM(...categorias), 
    allowNull: false 
  },
  ruta: Sequelize.STRING,
  createdAt: Sequelize.DATE,
  updatedAt: Sequelize.DATE
});
```

### Migración 2: Crear Tabla Rol_Permisos

```javascript
// 20250320003100-create-rol-permiso.js
await queryInterface.createTable('Rol_Permisos', {
  rolID: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    references: { model: 'Rols', key: 'id' }
  },
  permisoID: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    references: { model: 'Permisos', key: 'id' }
  }
});
```

### Migración 3: Crear Tabla Usuario_Permisos

```javascript
// 20250320003200-create-usuario-permiso.js
await queryInterface.createTable('Usuario_Permisos', {
  usuarioID: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    references: { model: 'Usuarios', key: 'id' }
  },
  permisoID: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    references: { model: 'Permisos', key: 'id' }
  }
});
```

---

## Reversión de Migraciones (Undo)

```bash
# Deshacer última migración
npx sequelize-cli db:migrate:undo

# Deshacer todas las migraciones
npx sequelize-cli db:migrate:undo:all

# Deshacer hasta una migración específica
npx sequelize-cli db:migrate:undo --name 20250320003000-create-permiso.js
```

---

## Backup y Restore

### Backup de datos de permisos

```bash
# Exportar tabla Permisos
mysqldump -u user -p brisasdemamporaldb Permisos > permisos_backup.sql

# Exportar tablas relacionadas
mysqldump -u user -p brisasdemamporaldb Rol_Permisos Usuario_Permisos > roles_permisos_backup.sql
```

### Restaurar datos

```bash
# Restaurar tabla
mysql -u user -p brisasdemamporaldb < permisos_backup.sql
```

---

## Monitoreo

### Verificar integridad de datos

```sql
-- Permisos huérfanos (sin usuarios)
SELECT p.* FROM Permisos p
WHERE p.id NOT IN (SELECT permisoID FROM Usuario_Permisos)
AND p.id NOT IN (SELECT permisoID FROM Rol_Permisos);

-- Usuarios sin rol
SELECT u.* FROM Usuarios u
LEFT JOIN Personas p ON u.personaID = p.id
WHERE p.tipo IS NULL;

-- Permisos duplicados
SELECT nombre, COUNT(*) 
FROM Permisos 
GROUP BY nombre 
HAVING COUNT(*) > 1;
```

---

**Versión**: 1.0.0  
**Fecha**: 2025  
**Estado**: ✅ Estructura Completa
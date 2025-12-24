-- ===========================================
-- DIAGNOSTICO TABLA Usuario_Permisos
-- ===========================================

-- 1. Ver la estructura de la tabla
DESCRIBE Usuario_Permisos;

-- 2. Ver si la tabla existe
SHOW TABLES LIKE 'Usuario_Permisos';

-- 3. Ver todos los registros en Usuario_Permisos
SELECT * FROM Usuario_Permisos;

-- 4. Ver permisos asignados con detalles
SELECT 
  up.id,
  up.usuarioID,
  u.email,
  p.nombre AS permiso,
  p.categoria
FROM Usuario_Permisos up
JOIN Usuarios u ON up.usuarioID = u.id
JOIN Permisos p ON up.permisoID = p.id
ORDER BY u.email, p.nombre;

-- 5. Contar permisos por usuario
SELECT 
  u.id,
  u.email,
  COUNT(up.id) AS cantidad_permisos
FROM Usuarios u
LEFT JOIN Usuario_Permisos up ON u.id = up.usuarioID
GROUP BY u.id, u.email;

-- 6. Ver usuarios administrativos
SELECT 
  u.id,
  u.email,
  p.tipo,
  p.nombre,
  p.apellido
FROM Usuarios u
JOIN Personas p ON u.personaID = p.id
WHERE p.tipo = 'administrativo';

-- 7. Ver si existen tablas viejas (que deberían estar vacías)
SHOW TABLES LIKE 'Rol_Permisos';
SHOW TABLES LIKE 'Persona_Roles';

@echo off
setlocal enabledelayedexpansion

echo ========================================
echo DIAGNOSTICO DE BASE DE DATOS
echo ========================================
echo.

echo [1] USUARIOS ADMINISTRATIVOS
mysql -u root -h 127.0.0.1 brisasdemamporaldb -e "SELECT u.id, u.email, p.tipo, p.nombre, p.apellido FROM Usuarios u JOIN Personas p ON u.personaID = p.id WHERE p.tipo='administrativo';"
echo.

echo [2] PERMISOS EN BASE DE DATOS
mysql -u root -h 127.0.0.1 brisasdemamporaldb -e "SELECT id, nombre, categoria FROM Permisos LIMIT 10;"
echo.

echo [3] TABLA USUARIO_PERMISO (Primeros 20 registros)
mysql -u root -h 127.0.0.1 brisasdemamporaldb -e "SELECT * FROM Usuario_Permisos LIMIT 20;"
echo.

echo [4] PERMISOS DE USUARIO ADMINISTRATIVO (por usuario)
mysql -u root -h 127.0.0.1 brisasdemamporaldb -e "SELECT up.usuarioID, p.nombre as permiso FROM Usuario_Permisos up JOIN Permisos p ON up.permisoID = p.id WHERE up.usuarioID IN (SELECT u.id FROM Usuarios u JOIN Personas p ON u.personaID = p.id WHERE p.tipo='administrativo');"
echo.

echo [5] VERIFICAR ESTRUCTURA DE USUARIO_PERMISOS
mysql -u root -h 127.0.0.1 brisasdemamporaldb -e "DESCRIBE Usuario_Permisos;"
echo.

echo [6] VERIFICAR SI EXISTEN TABLAS VIEJAS
mysql -u root -h 127.0.0.1 brisasdemamporaldb -e "SHOW TABLES LIKE 'Rol_%' OR LIKE 'Persona_Roles';"
echo.

pause

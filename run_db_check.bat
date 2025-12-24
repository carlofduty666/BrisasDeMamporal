@echo off
REM Ejecutar queries de diagnóstico de la BD
REM Asegúrate de que MySQL está en el PATH o proporciona la ruta completa

setlocal
set DB_HOST=127.0.0.1
set DB_USER=root
set DB_PASSWORD=
set DB_NAME=brisasdemamporaldb

echo ========================================
echo EJECUTANDO DIAGNOSTICO DE BD
echo ========================================
echo.
echo Conectando a: %DB_HOST% | Usuario: %DB_USER% | BD: %DB_NAME%
echo.

REM Intenta ejecutar con mysql
mysql -h %DB_HOST% -u %DB_USER% %DB_NAME% < query_permisos.sql

if errorlevel 1 (
    echo.
    echo ERROR: No se pudo conectar a MySQL
    echo.
    echo Asegúrate de que:
    echo 1. MySQL está corriendo
    echo 2. MySQL está en el PATH de Windows
    echo 3. Las credenciales son correctas
    echo.
    echo Alternativa: Abre MySQL Workbench o un cliente MySQL y ejecuta:
    echo   source query_permisos.sql
    echo.
)

pause

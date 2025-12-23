export const routePermissionsMap = {
  '/admin/dashboard': 'ver_dashboard',
  '/admin/estudiantes': 'ver_estudiantes',
  '/admin/profesores': 'ver_profesores',
  '/admin/representantes': 'ver_representantes',
  '/admin/empleados': 'ver_empleados',
  '/admin/pagos': 'ver_pagos',
  '/admin/inscripciones': 'ver_inscripciones',
  '/admin/cupos': 'gestionar_cupos',
  '/admin/academico/grados': 'ver_grados',
  '/admin/academico/materias': 'ver_materias',
  '/admin/academico/secciones': 'ver_secciones',
  '/admin/academico/horarios': 'ver_horarios',
  '/admin/configuracion': 'ver_configuracion'
};

export const tienePermiso = (permisos, ruta) => {
  const permisoRequerido = routePermissionsMap[ruta];
  
  if (!permisoRequerido) {
    return true;
  }
  
  if (!permisos || permisos.length === 0) {
    return false;
  }
  
  return permisos.includes(permisoRequerido);
};

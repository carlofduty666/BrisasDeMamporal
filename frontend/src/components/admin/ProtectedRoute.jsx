import React from 'react';
import { Navigate } from 'react-router-dom';
import { usePermissions } from '../../hooks/usePermissions';

/**
 * Componente para proteger rutas según permisos
 * @param {Object} props - Props del componente
 * @param {React.ReactNode} props.children - Componente a renderizar si tiene permiso
 * @param {string | string[]} props.permissions - Permiso(s) requerido(s)
 * @param {boolean} props.requireAll - Si true, requiere TODOS los permisos. Si false, requiere AL MENOS UNO
 * @param {React.ReactNode} props.fallback - Componente a mostrar si no tiene permiso
 * @returns {React.ReactNode}
 */
const ProtectedRoute = ({ 
  children, 
  permissions, 
  requireAll = false,
  fallback = null 
}) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions, isAdmin, loading } = usePermissions();

  if (loading) {
    return <div>Cargando...</div>;
  }

  // Si es admin, tiene acceso total
  if (isAdmin()) {
    return children;
  }

  // Si no se requieren permisos específicos
  if (!permissions) {
    return children;
  }

  // Verificar permisos
  let hasAccess = false;

  if (Array.isArray(permissions)) {
    if (requireAll) {
      hasAccess = hasAllPermissions(permissions);
    } else {
      hasAccess = hasAnyPermission(permissions);
    }
  } else {
    hasAccess = hasPermission(permissions);
  }

  if (!hasAccess) {
    return fallback || (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Acceso Denegado</h1>
          <p className="text-gray-600 mb-4">No tienes permisos para acceder a este recurso</p>
          <a 
            href="/admin/dashboard" 
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Volver al Dashboard
          </a>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
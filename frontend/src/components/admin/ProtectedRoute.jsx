import React, { useState, useEffect } from 'react';
import { routePermissionsMap } from '../../utils/permisosMapping';
import { getCurrentUser, loadPermissions } from '../../services/auth.service';
import api from '../../services/api';

const ProtectedRoute = ({ 
  children, 
  permissions, 
  route,
  requireAll = false,
  fallback = null 
}) => {
  const [userType, setUserType] = useState(null);
  const [userPermissions, setUserPermissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const currentUser = getCurrentUser();
        
        if (currentUser) {
          setUserType(currentUser.tipo);
          
          let permisos = currentUser.permisos || [];
          
          if (permisos.length === 0 && currentUser.id) {
            try {
              const response = await api.get(`/permisos/usuario/${currentUser.id}`);
              permisos = response.data.map(p => p.nombre);
              
              currentUser.permisos = permisos;
              localStorage.setItem('user', JSON.stringify(currentUser));
            } catch (error) {
              console.error('Error al cargar permisos:', error);
            }
          }
          
          const normalizedPermisos = permisos.map(p => typeof p === 'string' ? p : p?.nombre).filter(Boolean);
          setUserPermissions(normalizedPermisos);
        }
      } catch (error) {
        console.error('Error al cargar datos del usuario:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();

    const handleStorageChange = () => {
      loadUserData();
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Cargando...</p>
      </div>
    </div>;
  }

  const isAdmin = userType === 'owner' || userType === 'adminWeb';
  if (isAdmin) {
    return children;
  }

  let requiredPermission = permissions;
  if (route && !permissions) {
    requiredPermission = routePermissionsMap[route];
  }

  if (!requiredPermission) {
    return children;
  }

  let hasAccess = false;

  if (Array.isArray(requiredPermission)) {
    if (requireAll) {
      hasAccess = requiredPermission.every(p => userPermissions.includes(p));
    } else {
      hasAccess = requiredPermission.some(p => userPermissions.includes(p));
    }
  } else {
    hasAccess = userPermissions.includes(requiredPermission);
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

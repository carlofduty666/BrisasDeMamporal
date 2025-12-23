import React, { useState, useEffect } from 'react';
import { routePermissionsMap } from '../../utils/permisosMapping';
import { getCurrentUser } from '../../services/auth.service';

const ViewProtectedRoute = ({ 
  children, 
  route 
}) => {
  // NUEVO (reactivo a cambios en localStorage)
  const [userType, setUserType] = useState(null);
  const [userPermissions, setUserPermissions] = useState([]);

  useEffect(() => {
    const loadUserData = () => {
      const currentUser = getCurrentUser();
      if (currentUser) {
        setUserType(currentUser.tipo);
        setUserPermissions(currentUser.permisos || []);
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


  const isAdminUser = userType === 'owner' || userType === 'adminWeb' || userType === 'administrativo';

  if (isAdminUser) {
    return children;
  }

  const requiredPermission = routePermissionsMap[route];
  
  if (!requiredPermission) {
    return children;
  }

  const hasAccess = userPermissions.includes(requiredPermission);

  if (!hasAccess) {
    return (
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

export default ViewProtectedRoute;

import { useState, useEffect } from 'react';
import { getCurrentUser } from '../services/auth.service';

/**
 * Hook para verificar permisos del usuario actual
 * @returns {Object} Objeto con métodos para verificar permisos
 */
export const usePermissions = () => {
  const [permissions, setPermissions] = useState([]);
  const [userType, setUserType] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setPermissions(currentUser.permisos || []);
      setUserType(currentUser.tipo);
    }
    setLoading(false);
  }, []);

  /**
   * Verifica si el usuario tiene un permiso específico
   * @param {string} permissionName - Nombre del permiso a verificar
   * @returns {boolean}
   */
  const hasPermission = (permissionName) => {
    if (!permissionName) return false;
    
    // Si es owner o adminWeb, tiene todos los permisos
    if (userType === 'owner' || userType === 'adminWeb') {
      return true;
    }

    return permissions.includes(permissionName);
  };

  /**
   * Verifica si el usuario tiene alguno de los permisos especificados
   * @param {string[]} permissionNames - Array de nombres de permisos
   * @returns {boolean}
   */
  const hasAnyPermission = (permissionNames) => {
    if (!Array.isArray(permissionNames) || permissionNames.length === 0) {
      return false;
    }

    if (userType === 'owner' || userType === 'adminWeb') {
      return true;
    }

    return permissionNames.some(permission => permissions.includes(permission));
  };

  /**
   * Verifica si el usuario tiene todos los permisos especificados
   * @param {string[]} permissionNames - Array de nombres de permisos
   * @returns {boolean}
   */
  const hasAllPermissions = (permissionNames) => {
    if (!Array.isArray(permissionNames) || permissionNames.length === 0) {
      return false;
    }

    if (userType === 'owner' || userType === 'adminWeb') {
      return true;
    }

    return permissionNames.every(permission => permissions.includes(permission));
  };

  /**
   * Verifica si el usuario es administrador (owner o adminWeb)
   * @returns {boolean}
   */
  const isAdmin = () => {
    return userType === 'owner' || userType === 'adminWeb';
  };

  /**
   * Verifica si el usuario es administrativo
   * @returns {boolean}
   */
  const isAdministrativo = () => {
    return userType === 'administrativo';
  };

  /**
   * Obtiene los permisos del usuario
   * @returns {string[]}
   */
  const getPermissions = () => {
    return permissions;
  };

  /**
   * Obtiene el tipo de usuario
   * @returns {string}
   */
  const getUserType = () => {
    return userType;
  };

  return {
    permissions,
    userType,
    loading,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isAdmin,
    isAdministrativo,
    getPermissions,
    getUserType
  };
};
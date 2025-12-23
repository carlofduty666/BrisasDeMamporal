import api from './api';

// Obtener todos los permisos
export const getAllPermisos = async () => {
  try {
    const response = await api.get('/permisos');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: error.message };
  }
};

// Obtener permisos por categoría
export const getPermisosByCategoria = async (categoria) => {
  try {
    const response = await api.get(`/permisos/categoria/${categoria}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: error.message };
  }
};

// Obtener permisos de un rol
export const getPermisosByRol = async (rolID) => {
  try {
    const response = await api.get(`/permisos/rol/${rolID}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: error.message };
  }
};

// Obtener permisos de un usuario (combinados: rol + usuario)
export const getPermisosByUsuario = async (usuarioID) => {
  try {
    const response = await api.get(`/permisos/usuario/${usuarioID}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: error.message };
  }
};

// Obtener SOLO permisos específicos del usuario (sin permisos del rol)
export const getPermisosEspecificosUsuario = async (usuarioID) => {
  try {
    const response = await api.get(`/permisos/usuario/${usuarioID}/especificos`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: error.message };
  }
};

// Crear permiso
export const crearPermiso = async (permisoData) => {
  try {
    const response = await api.post('/permisos', permisoData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: error.message };
  }
};

// Asignar permiso a un usuario
export const asignarPermisoUsuario = async (usuarioID, permisoID) => {
  try {
    const response = await api.post('/permisos/usuario/asignar', {
      usuarioID,
      permisoID
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: error.message };
  }
};

// Remover permiso de un usuario
export const removerPermisoUsuario = async (usuarioID, permisoID) => {
  try {
    const response = await api.delete('/permisos/usuario/remover', {
      data: { usuarioID, permisoID }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: error.message };
  }
};

// Asignar múltiples permisos a un usuario
export const asignarMultiplesPermisosUsuario = async (usuarioID, permisoIDs) => {
  try {
    const response = await api.post('/permisos/usuario/asignar-multiples', {
      usuarioID,
      permisoIDs
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: error.message };
  }
};

// Asignar permisos a un rol
export const asignarPermisosRol = async (rolID, permisoIDs) => {
  try {
    const response = await api.post('/permisos/rol/asignar', {
      rolID,
      permisoIDs
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: error.message };
  }
};
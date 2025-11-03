import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Obtener todos los permisos
export const getAllPermisos = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/permisos`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: error.message };
  }
};

// Obtener permisos por categoría
export const getPermisosByCategoria = async (categoria) => {
  try {
    const response = await axios.get(`${API_URL}/api/permisos/categoria/${categoria}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: error.message };
  }
};

// Obtener permisos de un rol
export const getPermisosByRol = async (rolID) => {
  try {
    const response = await axios.get(`${API_URL}/api/permisos/rol/${rolID}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: error.message };
  }
};

// Obtener permisos de un usuario (combinados)
export const getPermisosByUsuario = async (usuarioID) => {
  try {
    const response = await axios.get(`${API_URL}/api/permisos/usuario/${usuarioID}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: error.message };
  }
};

// Crear permiso
export const crearPermiso = async (permisoData) => {
  try {
    const response = await axios.post(`${API_URL}/api/permisos`, permisoData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: error.message };
  }
};

// Asignar permiso a un usuario
export const asignarPermisoUsuario = async (usuarioID, permisoID) => {
  try {
    const response = await axios.post(`${API_URL}/api/permisos/usuario/asignar`, {
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
    const response = await axios.delete(`${API_URL}/api/permisos/usuario/remover`, {
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
    const response = await axios.post(`${API_URL}/api/permisos/usuario/asignar-multiples`, {
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
    const response = await axios.post(`${API_URL}/api/permisos/rol/asignar`, {
      rolID,
      permisoIDs
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: error.message };
  }
};
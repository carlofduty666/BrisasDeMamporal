import api from './api';

export const getAllUsuarios = async () => {
  try {
    const response = await api.get('/usuarios');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error al obtener usuarios' };
  }
};

export const getUsuarioById = async (id) => {
  try {
    const response = await api.get(`/usuarios/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error al obtener usuario' };
  }
};

export const getUsuarioByEmail = async (email) => {
  try {
    const response = await api.get(`/usuarios/email/${email}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error al obtener usuario' };
  }
};

export const updateUsuario = async (id, data) => {
  try {
    const response = await api.put(`/usuarios/${id}`, data);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error al actualizar usuario' };
  }
};

export const cambiarPassword = async (id, passwordActual, passwordNueva) => {
  try {
    const response = await api.put(`/usuarios/${id}/cambiar-password`, {
      passwordActual,
      passwordNueva
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error al cambiar contraseña' };
  }
};

export const restablecerPassword = async (id, passwordNueva) => {
  try {
    const response = await api.put(`/usuarios/${id}/restablecer-password`, {
      passwordNueva
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error al restablecer contraseña' };
  }
};

export const verificarUsuario = async (id) => {
  try {
    const response = await api.put(`/usuarios/${id}/verificar`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error al verificar usuario' };
  }
};

export const cambiarEstadoUsuario = async (id, estado) => {
  try {
    const response = await api.put(`/usuarios/${id}/estado`, { estado });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error al cambiar estado del usuario' };
  }
};

export const deleteUsuario = async (id) => {
  try {
    const response = await api.delete(`/usuarios/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error al eliminar usuario' };
  }
};
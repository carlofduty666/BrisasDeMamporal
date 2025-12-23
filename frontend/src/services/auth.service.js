import api from './api';

export const registerUser = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error de conexión' };
  }
};

export const verifyEmail = async (email, verificationCode) => {
  try {
    const response = await api.post('/auth/verify-email', { email, verificationCode });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error de conexión' };
  }
};

export const resendVerification = async (email) => {
  try {
    const response = await api.post('/auth/resend-verification', { email });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error de conexión' };
  }
};

export const loginUser = async (credentials) => {
  try {
    const response = await api.post('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      await loadPermissions(response.data.user.id);
    }
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error de conexión' };
  }
};

export const loadPermissions = async (usuarioID) => {
  try {
    const response = await api.get(`/permisos/usuario/${usuarioID}`);
    const user = getCurrentUser();
    if (user) {
      user.permisos = response.data.map(p => p.nombre);
      localStorage.setItem('user', JSON.stringify(user));
    }
    return response.data;
  } catch (error) {
    console.error('Error cargando permisos:', error);
    return [];
  }
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('permissions');
};

export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    return JSON.parse(userStr);
  }
  return null;
};

export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

export const forgotPassword = async (email) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error de conexión' };
    }
  };
  
  export const resetPassword = async (email, code, newPassword) => {
    try {
      const response = await api.post('/auth/reset-password', { 
        email, 
        code, 
        newPassword 
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error de conexión' };
    }
  };

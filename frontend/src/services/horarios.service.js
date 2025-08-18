import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Configurar interceptor para incluir el token automáticamente
const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const horariosService = {
  // Obtener todos los horarios
  async getHorarios() {
    try {
      const response = await api.get('/horarios');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Obtener horario por ID
  async getHorarioById(id) {
    try {
      const response = await api.get(`/horarios/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Crear nuevo horario
  async createHorario(horarioData) {
    try {
      const response = await api.post('/horarios', horarioData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Actualizar horario
  async updateHorario(id, horarioData) {
    try {
      const response = await api.put(`/horarios/${id}`, horarioData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Eliminar horario
  async deleteHorario(id) {
    try {
      const response = await api.delete(`/horarios/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Obtener horarios por grado y sección
  async getHorariosByGradoSeccion(gradoId, seccionId) {
    try {
      const response = await api.get(`/horarios/grado/${gradoId}/seccion/${seccionId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Obtener clases actuales
  async getClasesActuales() {
    try {
      const response = await api.get('/horarios/clases-actuales');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Obtener próximas clases
  async getProximasClases(limit = 5) {
    try {
      const response = await api.get(`/horarios/proximas-clases?limit=${limit}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Generar PDF de horario
  async generarHorarioPDF(gradoId, seccionId) {
    try {
      const response = await api.get(`/pdf/horario/${gradoId}/${seccionId}`, {
        responseType: 'blob'
      });
      
      // Crear un blob URL para descargar el archivo
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      
      // Crear un enlace temporal para descargar
      const link = document.createElement('a');
      link.href = url;
      link.download = `horario_grado_${gradoId}_seccion_${seccionId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Limpiar el blob URL
      window.URL.revokeObjectURL(url);
      
      return { success: true, message: 'PDF generado exitosamente' };
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default horariosService;
// Servicio para configuración de pagos (precios/mora/vigencias). Ajusta rutas según backend.
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function authHeaders() {
  const token = localStorage.getItem('token');
  return { headers: { Authorization: `Bearer ${token}` } };
}

export const pagosConfigService = {
  async getConfig() {
    const { data } = await axios.get(`${API}/configuracion-pagos`, authHeaders());
    return data;
  },

  async updateConfig(payload) {
    const { data } = await axios.put(`${API}/configuracion-pagos`, payload, authHeaders());
    return data;
  },

  async actualizarPrecios(payload) {
    // Política B: aplicar precio retroactivo a mensualidades pendientes/reportadas
    const { data } = await axios.post(`${API}/configuracion-pagos/actualizar-precios`, payload, authHeaders());
    return data;
  },
};
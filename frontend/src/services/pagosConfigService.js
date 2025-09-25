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
    // Aplicar precio a mensualidades pendientes/reportadas del mes indicado
    const { data } = await axios.post(`${API}/configuracion-pagos/actualizar-precios`, payload, authHeaders());
    return data;
  },

  async congelarMes(payload) {
    // Congelar snapshot del mes (precios y parámetros de mora)
    const { data } = await axios.post(`${API}/configuracion-pagos/congelar-mes`, payload, authHeaders());
    return data;
  },

  async recalcularMoras(payload) {
    // Recalcular moras de mensualidades pendientes (opcionalmente por annoEscolarID)
    const { data } = await axios.post(`${API}/mensualidades/recalcular-moras`, payload, authHeaders());
    return data;
  },
};
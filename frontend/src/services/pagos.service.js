import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function authHeaders() {
  const token = localStorage.getItem('token');
  return { headers: { Authorization: `Bearer ${token}` } };
}

export const pagosService = {
  async list(params = {}) {
    const query = new URLSearchParams(params).toString();
    const url = `${API}/pagos${query ? `?${query}` : ''}`;
    const { data } = await axios.get(url, authHeaders());
    return data;
  },

  async listByEstudiante(estudianteID, params = {}) {
    const query = new URLSearchParams(params).toString();
    const url = `${API}/pagos/estudiante/${estudianteID}${query ? `?${query}` : ''}`;
    const { data } = await axios.get(url, authHeaders());
    return data;
  }
};
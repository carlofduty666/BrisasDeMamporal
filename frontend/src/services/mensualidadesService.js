// Servicio para endpoints de mensualidades (scaffold). Ajusta rutas cuando el backend esté listo.
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function authHeaders() {
  const token = localStorage.getItem('token');
  return { headers: { Authorization: `Bearer ${token}` } };
}

export const mensualidadesService = {
  async list(params = {}) {
    // params: { estado, estudianteID, representanteID, annoEscolarID, search }
    const query = new URLSearchParams(params).toString();
    const url = `${API}/mensualidades${query ? `?${query}` : ''}`;
    const { data } = await axios.get(url, authHeaders());
    return data;
  },

  async listByEstudiante(estudianteID, params = {}) {
    const query = new URLSearchParams(params).toString();
    const url = `${API}/mensualidades/estudiante/${estudianteID}${query ? `?${query}` : ''}`;
    const { data } = await axios.get(url, authHeaders());
    return data;
  },

  async generarPorInscripcion(inscripcionID, payload = {}) {
    const url = `${API}/mensualidades/inscripcion/${inscripcionID}/generar`;
    const { data } = await axios.post(url, payload, authHeaders());
    return data;
  },

  async aprobar(id) {
    const url = `${API}/mensualidades/${id}/aprobar`;
    const { data } = await axios.patch(url, {}, authHeaders());
    return data;
  },

  async rechazar(id, observacionAdmin = '') {
    const url = `${API}/mensualidades/${id}/rechazar`;
    const { data } = await axios.patch(url, { observacionAdmin }, authHeaders());
    return data;
  },

  async enviarRecordatorio(id) {
    const url = `${API}/mensualidades/${id}/recordatorio`;
    const { data } = await axios.post(url, {}, authHeaders());
    return data;
  },
};
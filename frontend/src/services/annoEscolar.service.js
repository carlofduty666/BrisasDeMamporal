import api from './api';

const base = '/anno-escolar';

export const annoEscolarService = {
  list: async () => {
    const { data } = await api.get(`${base}`);
    return data;
  },
  getActual: async () => {
    const { data } = await api.get(`${base}/actual`);
    return data;
  },
  getMeses: async (id) => {
    const { data } = await api.get(`${base}/${id}/meses`);
    return data;
  },
  create: async (payload) => {
    const { data } = await api.post(`${base}`, payload);
    return data;
  },
  update: async (id, payload) => {
    const { data } = await api.put(`${base}/${id}`, payload);
    return data;
  },
  activate: async (id) => {
    const { data } = await api.put(`${base}/${id}/activar`);
    return data;
  },
  remove: async (id) => {
    const { data } = await api.delete(`${base}/${id}`);
    return data;
  },
};
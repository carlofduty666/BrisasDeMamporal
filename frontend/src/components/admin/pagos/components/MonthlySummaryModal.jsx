import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

const meses = [
  { v: 1, n: 'Enero' }, { v: 2, n: 'Febrero' }, { v: 3, n: 'Marzo' }, { v: 4, n: 'Abril' },
  { v: 5, n: 'Mayo' }, { v: 6, n: 'Junio' }, { v: 7, n: 'Julio' }, { v: 8, n: 'Agosto' },
  { v: 9, n: 'Septiembre' }, { v: 10, n: 'Octubre' }, { v: 11, n: 'Noviembre' }, { v: 12, n: 'Diciembre' },
];

export default function MonthlySummaryModal({ open, onClose, mes, anio, annoEscolarID }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Selectors state (initialized from props)
  const [selMes, setSelMes] = useState(mes || new Date().getMonth()+1);
  const [selAnio, setSelAnio] = useState(anio || new Date().getFullYear());
  const [selAnnoEscolar, setSelAnnoEscolar] = useState(annoEscolarID || '');
  const [annosEscolares, setAnnosEscolares] = useState([]);

  // Local filters
  const [textFilter, setTextFilter] = useState('');
  const [estadoFilter, setEstadoFilter] = useState(''); // '', 'pendiente','reportado','pagado','anulado'

  useEffect(() => {
    if (!open) return;
    // Load years and annoEscolar options once
    const loadAnnos = async () => {
      try {
        const token = localStorage.getItem('token');
        const base = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const res = await axios.get(`${base}/anno-escolar`, { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: [] }));
        setAnnosEscolares(res.data || []);
      } catch {}
    };
    loadAnnos();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        const token = localStorage.getItem('token');
        const base = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const res = await axios.get(`${base}/mensualidades/resumen-mensual`, {
          params: { mes: selMes, anio: selAnio, annoEscolarID: selAnnoEscolar || undefined, detalle: true },
          headers: { Authorization: `Bearer ${token}` }
        });
        setData(res.data);
      } catch (e) {
        setError('No se pudo cargar el resumen');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [open, selMes, selAnio, selAnnoEscolar]);

  const filteredItems = useMemo(() => {
    if (!data?.items) return [];
    const term = textFilter.trim().toLowerCase();
    return data.items.filter((m) => {
      const estadoOk = !estadoFilter || m.estado === estadoFilter;
      if (!estadoOk) return false;
      if (!term) return true;
      const parts = [
        m.estudiante?.cedula,
        m.estudiante?.nombre, m.estudiante?.apellido,
        m.representante?.cedula,
        m.representante?.nombre, m.representante?.apellido,
        m.pago?.referencia,
        m.inscripcion?.grado?.nombre_grado,
        m.inscripcion?.Secciones?.nombre_seccion,
      ]
        .map(v => String(v || '').toLowerCase());
      return parts.some(p => p.includes(term));
    });
  }, [data, textFilter, estadoFilter]);

  const doExport = async (formato) => {
    if (!['excel','pdf'].includes(formato)) return;
    try {
      const token = localStorage.getItem('token');
      const base = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const resp = await axios.get(`${base}/mensualidades/export`, {
        params: { mes: selMes, anio: selAnio, annoEscolarID: selAnnoEscolar || undefined, formato },
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      const blob = new Blob([resp.data], { type: formato === 'excel' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' : 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `resumen-${selAnio}-${String(selMes).padStart(2,'0')}.${formato === 'excel' ? 'xlsx' : 'pdf'}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError('No se pudo exportar');
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <h3 className="text-lg font-semibold">Resumen mensual</h3>
          <div className="flex flex-wrap items-center gap-2">
            <select className="border rounded px-2 py-1 text-sm" value={selMes} onChange={e => setSelMes(Number(e.target.value))}>
              {meses.map(m => <option key={m.v} value={m.v}>{m.n}</option>)}
            </select>
            <input className="border rounded px-2 py-1 w-24 text-sm" type="number" min="2000" max="2100" value={selAnio} onChange={e => setSelAnio(Number(e.target.value))} />
            <select className="border rounded px-2 py-1 text-sm" value={selAnnoEscolar || ''} onChange={e => setSelAnnoEscolar(e.target.value || '')}>
              <option value="">Todos los periodos</option>
              {annosEscolares.map(a => (
                <option key={a.id} value={a.id}>{a.periodo}</option>
              ))}
            </select>
            <button onClick={onClose} className="text-slate-600 hover:text-slate-900 border rounded px-3 py-1">Cerrar</button>
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-slate-600">Cargando...</p>
        ) : error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : data ? (
          <div className="space-y-4">
            {/* Counters */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-sm">
              <div className="p-3 rounded-lg bg-slate-50 border">Total: <b>{data.total}</b></div>
              <div className="p-3 rounded-lg bg-green-50 border">Aprobadas: <b>{data.aprobadas}</b></div>
              <div className="p-3 rounded-lg bg-yellow-50 border">Reportadas: <b>{data.reportadas}</b></div>
              <div className="p-3 rounded-lg bg-orange-50 border">Pendientes: <b>{data.pendientes}</b></div>
              <div className="p-3 rounded-lg bg-red-50 border">Rechazadas: <b>{data.rechazadas}</b></div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <input value={textFilter} onChange={e => setTextFilter(e.target.value)} placeholder="Buscar por nombre, cédula, referencia, grado/sección" className="border rounded px-3 py-2 text-sm flex-1 min-w-[240px]" />
              <select value={estadoFilter} onChange={e => setEstadoFilter(e.target.value)} className="border rounded px-2 py-2 text-sm">
                <option value="">Todos</option>
                <option value="pendiente">Pendiente</option>
                <option value="reportado">Reportado</option>
                <option value="pagado">Aprobado</option>
                <option value="anulado">Rechazado</option>
              </select>
              <button onClick={() => doExport('excel')} className="px-3 py-2 text-sm rounded bg-emerald-600 text-white hover:bg-emerald-700">Exportar Excel</button>
              <button onClick={() => doExport('pdf')} className="px-3 py-2 text-sm rounded bg-rose-600 text-white hover:bg-rose-700">Exportar PDF</button>
            </div>

            {/* Detailed list */}
            <div className="overflow-auto border rounded-lg">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-3 py-2 text-left">Estado</th>
                    <th className="px-3 py-2 text-left">Estudiante</th>
                    <th className="px-3 py-2 text-left">Representante</th>
                    <th className="px-3 py-2 text-left">Grado/Sección</th>
                    <th className="px-3 py-2 text-left">Referencia</th>
                    <th className="px-3 py-2 text-left">Monto Base</th>
                    <th className="px-3 py-2 text-left">Mora</th>
                    <th className="px-3 py-2 text-left">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((m) => (
                    <tr key={m.id} className="border-t">
                      <td className="px-3 py-2 capitalize">{m.estado}</td>
                      <td className="px-3 py-2">{m.estudiante ? `${m.estudiante.nombre} ${m.estudiante.apellido} (${m.estudiante.cedula})` : ''}</td>
                      <td className="px-3 py-2">{m.representante ? `${m.representante.nombre} ${m.representante.apellido} (${m.representante.cedula})` : ''}</td>
                      <td className="px-3 py-2">{`${m.inscripcion?.grado?.nombre_grado || ''} ${m.inscripcion?.Secciones?.nombre_seccion || ''}`.trim()}</td>
                      <td className="px-3 py-2">{m.pago?.referencia || ''}</td>
                      <td className="px-3 py-2">{Number(m.montoBase || 0).toFixed(2)}</td>
                      <td className="px-3 py-2">{Number(m.moraAcumulada || 0).toFixed(2)}</td>
                      <td className="px-3 py-2">{Number((m.pago?.montoTotal) || (Number(m.montoBase||0)+Number(m.moraAcumulada||0))).toFixed(2)}</td>
                    </tr>
                  ))}
                  {filteredItems.length === 0 && (
                    <tr>
                      <td className="px-3 py-4 text-center text-slate-500" colSpan={8}>Sin resultados</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-600">Sin datos</p>
        )}
      </div>
    </div>
  );
}
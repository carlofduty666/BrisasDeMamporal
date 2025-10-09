import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { 
  FaCheck, 
  FaClock, 
  FaExclamationTriangle, 
  FaTimes, 
  FaFileExcel, 
  FaFilePdf, 
  FaSearch,
  FaCalendarAlt,
  FaChartLine,
  FaMoneyBillWave,
  FaUserGraduate,
  FaUser,
  FaHashtag,
  FaGraduationCap,
  FaDollarSign,
  FaInfoCircle
} from 'react-icons/fa';
import { formatearNombreGrado, formatearCedula } from '../../../../utils/formatters'

const meses = [
  { v: 1, n: 'Enero' }, { v: 2, n: 'Febrero' }, { v: 3, n: 'Marzo' }, { v: 4, n: 'Abril' },
  { v: 5, n: 'Mayo' }, { v: 6, n: 'Junio' }, { v: 7, n: 'Julio' }, { v: 8, n: 'Agosto' },
  { v: 9, n: 'Septiembre' }, { v: 10, n: 'Octubre' }, { v: 11, n: 'Noviembre' }, { v: 12, n: 'Diciembre' },
];

export default function MonthlySummaryModal({ open, onClose, mes, anio, annoEscolarID }) {
  const [data, setData] = useState(null);
  const [totales, setTotales] = useState(null); // totales aprobados por criterio obligacion
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Selectors state (initialized from props)
  const [selMes, setSelMes] = useState(mes || new Date().getMonth()+1);
  const [selAnio, setSelAnio] = useState(anio || new Date().getFullYear());
  const [selAnnoEscolar, setSelAnnoEscolar] = useState(annoEscolarID || '');
  const [annosEscolares, setAnnosEscolares] = useState([]);
  const [mesesAnnoEscolar, setMesesAnnoEscolar] = useState([]);

  // Local filters
  const [textFilter, setTextFilter] = useState('');
  const [estadoFilter, setEstadoFilter] = useState(''); // '', 'pendiente','reportado','pagado','anulado'

  useEffect(() => {
    if (!open) return;
    // Cargar años escolares disponibles y meses del seleccionado
    const loadAnnos = async () => {
      try {
        const token = localStorage.getItem('token');
        const base = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const res = await axios.get(`${base}/anno-escolar`, { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: [] }));
        const list = res.data || [];
        setAnnosEscolares(list);

        // Si no hay seleccionado, usar activo si existe
        if (!selAnnoEscolar) {
          const activo = await axios.get(`${base}/anno-escolar/actual`, { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: null }));
          const ae = activo.data;
          if (ae?.id) {
            setSelAnnoEscolar(ae.id);
          }
        }
      } catch {}
    };
    loadAnnos();
  }, [open]);

  useEffect(() => {
    if (!open || !selMes) return;
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        const token = localStorage.getItem('token');
        const base = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        
        // Obtener nombre del mes para mesPago
        const mesNombre = meses.find(m => m.v === selMes)?.n.toLowerCase() || '';
        
        // Cargar pagos del mes usando el endpoint /pagos
        const res = await axios.get(`${base}/pagos`, {
          params: { 
            mesPago: mesNombre,
            annoEscolarID: selAnnoEscolar || undefined
          },
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const pagos = res.data || [];
        
        // Calcular contadores por estado
        const total = pagos.length;
        const aprobadas = pagos.filter(p => p.estado === 'pagado').length;
        const reportadas = pagos.filter(p => p.estado === 'reportado').length;
        const pendientes = pagos.filter(p => p.estado === 'pendiente').length;
        const rechazadas = pagos.filter(p => p.estado === 'anulado').length;
        
        setData({
          mes: selMes,
          anio: selAnio,
          total,
          aprobadas,
          reportadas,
          pendientes,
          rechazadas,
          items: pagos
        });
        
        // Cargar totales aprobados por criterio obligacion
        if (selAnnoEscolar) {
          const tot = await axios.get(`${base}/contabilidad/totales-mes`, {
            params: { mes: selMes, annoEscolarID: selAnnoEscolar, criterio: 'obligacion' },
            headers: { Authorization: `Bearer ${token}` }
          });
          setTotales(tot.data);
        } else {
          setTotales(null);
        }
      } catch (e) {
        console.error('Error al cargar resumen:', e);
        setError('No se pudo cargar el resumen');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [open, selMes, selAnio, selAnnoEscolar]);

  // Cargar meses del año escolar seleccionado
  useEffect(() => {
    if (!open) return;
    const loadMeses = async () => {
      try {
        const token = localStorage.getItem('token');
        const base = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        if (selAnnoEscolar) {
          const r = await axios.get(`${base}/anno-escolar/${selAnnoEscolar}/meses`, { headers: { Authorization: `Bearer ${token}` } });
          setMesesAnnoEscolar(r.data || []);
          // si el mes actual no está en la lista, fijar el primero
          const candidates = r.data || [];
          if (candidates.length && !candidates.some(x => (x.mesNumero ?? x.v) === selMes)) {
            setSelMes(candidates[0].mesNumero);
            setSelAnio(candidates[0].anio);
          }
        } else {
          setMesesAnnoEscolar([]);
        }
      } catch {}
    };
    loadMeses();
  }, [open, selAnnoEscolar]);

  // Actualizar año cuando cambia el mes seleccionado
  useEffect(() => {
    if (!open || !selAnnoEscolar) return;
    const mesData = mesesAnnoEscolar.find(m => (m.mesNumero ?? m.v) === selMes);
    if (mesData?.anio) {
      setSelAnio(mesData.anio);
    }
  }, [selMes, mesesAnnoEscolar, open, selAnnoEscolar]);

  const filteredItems = useMemo(() => {
    if (!data?.items) return [];
    const term = textFilter.trim().toLowerCase();
    return data.items.filter((pago) => {
      // Filtrar por estado
      const estadoOk = estadoFilter ? (pago.estado === estadoFilter) : true;
      if (!estadoOk) return false;
      if (!term) return true;
      
      // Buscar en múltiples campos
      const parts = [
        pago.estudiantes?.cedula,
        pago.estudiantes?.nombre, 
        pago.estudiantes?.apellido,
        pago.representantes?.cedula,
        pago.representantes?.nombre, 
        pago.representantes?.apellido,
        pago.referencia,
        pago.grado?.nombre_grado,
        pago.seccion?.nombre_seccion,
      ]
        .map(v => String(v || '').toLowerCase());
      return parts.some(p => p.includes(term));
    });
  }, [data, textFilter, estadoFilter]);

  // Calcular total en VES de pagos aprobados
  const totalVES = useMemo(() => {
    if (!data?.items) return 0;
    return data.items
      .filter(p => p.estado === 'pagado')
      .reduce((acc, pago) => {
        const snapshot = pago.mensualidadSnapshot;
        const montoVES = snapshot?.precioAplicadoVES != null ? Number(snapshot.precioAplicadoVES) : 0;
        const moraVES = snapshot?.moraAplicadaVES != null ? Number(snapshot.moraAplicadaVES) : 0;
        return acc + montoVES + moraVES;
      }, 0);
  }, [data]);

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

  // Close modal with Escape key
  useEffect(() => {
    if (!open) return;
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl p-6 m-4 max-h-[90vh] overflow-y-auto animate-slideUp" onClick={(e) => e.stopPropagation()}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-pink-700 to-pink-800 rounded-lg">
              <FaCalendarAlt className="text-white text-xl" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800">Resumen Mensual</h3>
              <p className="text-sm text-slate-500">Detalle de pagos del período</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select 
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200" 
              value={selAnnoEscolar || ''} 
              onChange={e => setSelAnnoEscolar(e.target.value || '')}
            >
              <option value="">Seleccione periodo</option>
              {annosEscolares.map(a => (
                <option key={a.id} value={a.id}>{a.periodo}{a.activo ? ' (activo)' : ''}</option>
              ))}
            </select>
            <select 
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200" 
              value={selMes} 
              onChange={e => setSelMes(Number(e.target.value))}
            >
              {(mesesAnnoEscolar.length ? mesesAnnoEscolar : meses).map(m => (
                <option key={m.mesNumero ?? m.v} value={m.mesNumero ?? m.v}>
                  {m.nombre ?? m.n}
                </option>
              ))}
            </select>
            <button 
              onClick={onClose} 
              className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-300 rounded-lg px-4 py-2 transition-all duration-200 flex items-center gap-2"
            >
              <FaTimes /> Cerrar
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
            <FaExclamationTriangle className="text-red-500 text-xl" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        ) : data ? (
          <div className="space-y-5">
            {/* Counters */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="p-4 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 hover:shadow-md transition-all duration-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-slate-600 uppercase">Total</span>
                  <FaChartLine className="text-slate-400" />
                </div>
                <p className="text-2xl font-bold text-slate-800">{data.total}</p>
              </div>
              
              <div className="p-4 rounded-xl bg-gradient-to-br from-green-50 to-green-100 border border-green-200 hover:shadow-md transition-all duration-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-green-700 uppercase">Aprobadas</span>
                  <FaCheck className="text-green-500" />
                </div>
                <p className="text-2xl font-bold text-green-700">{data.aprobadas}</p>
              </div>
              
              <div className="p-4 rounded-xl bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 hover:shadow-md transition-all duration-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-yellow-700 uppercase">Reportadas</span>
                  <FaClock className="text-yellow-500" />
                </div>
                <p className="text-2xl font-bold text-yellow-700">{data.reportadas}</p>
              </div>
              
              <div className="p-4 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 hover:shadow-md transition-all duration-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-orange-700 uppercase">Pendientes</span>
                  <FaExclamationTriangle className="text-orange-500" />
                </div>
                <p className="text-2xl font-bold text-orange-700">{data.pendientes}</p>
              </div>
              
              <div className="p-4 rounded-xl bg-gradient-to-br from-red-50 to-red-100 border border-red-200 hover:shadow-md transition-all duration-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-red-700 uppercase">Anuladas</span>
                  <FaTimes className="text-red-500" />
                </div>
                <p className="text-2xl font-bold text-red-700">{data.rechazadas}</p>
              </div>
              
              <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 hover:shadow-md transition-all duration-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-emerald-700 uppercase">Total</span>
                  <FaMoneyBillWave className="text-emerald-500" />
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-lg font-bold text-emerald-700">
                    {(totales?.totalUSD ?? 0).toLocaleString('es-VE', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 })}
                  </p>
                  {totalVES > 0 && (
                    <p className="text-sm font-semibold text-emerald-600">
                      Bs. {totalVES.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3 bg-red-50 p-4 rounded-xl border border-pink-200">
              <div className="relative flex-1 min-w-[240px]">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <input 
                  value={textFilter} 
                  onChange={e => setTextFilter(e.target.value)} 
                  placeholder="Buscar por nombre, cédula, referencia, grado/sección" 
                  className="w-full border border-slate-300 rounded-lg pl-10 pr-3 py-2.5 text-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200" 
                />
              </div>
              <select 
                value={estadoFilter} 
                onChange={e => setEstadoFilter(e.target.value)} 
                className="border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200"
              >
                <option value="">Todos los estados</option>
                <option value="pendiente">Pendiente</option>
                <option value="reportado">Reportado</option>
                <option value="pagado">Pagado</option>
                <option value="anulado">Anulado</option>
              </select>
              <button 
                onClick={() => doExport('excel')} 
                className="px-4 py-2.5 text-sm rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md"
              >
                <FaFileExcel /> Excel
              </button>
              <button 
                onClick={() => doExport('pdf')} 
                className="px-4 py-2.5 text-sm rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md"
              >
                <FaFilePdf /> PDF
              </button>
            </div>

            {/* Detailed list */}
            <div className="overflow-auto border bg-pink-50 border-pink-200 rounded-xl shadow-sm">
              <table className="min-w-full text-sm">
                <thead className="bg-red-70">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-pink-700 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <FaInfoCircle />
                        Estado
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-pink-700 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <FaUserGraduate />
                        Estudiante
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-pink-700 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <FaUser />
                        Representante
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-pink-700 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <FaGraduationCap />
                        Grado/Sección
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-pink-700 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <FaHashtag />
                        Referencia
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-pink-700 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <FaMoneyBillWave />
                        Monto
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-pink-700 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <FaExclamationTriangle />
                        Mora
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-pink-700 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <FaDollarSign />
                        Total
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {filteredItems.map((pago) => {
                    // Obtener montos del mensualidadSnapshot si existe
                    const snapshot = pago.mensualidadSnapshot;
                    const montoUSD = snapshot?.precioAplicadoUSD != null ? Number(snapshot.precioAplicadoUSD) : Number(pago.monto || 0);
                    const montoVES = snapshot?.precioAplicadoVES != null ? Number(snapshot.precioAplicadoVES) : null;
                    const moraUSD = snapshot?.moraAplicadaUSD != null ? Number(snapshot.moraAplicadaUSD) : Number(pago.montoMora || 0);
                    const moraVES = snapshot?.moraAplicadaVES != null ? Number(snapshot.moraAplicadaVES) : null;
                    const totalUSD = Number(pago.montoTotal || 0);
                    
                    // Determinar si el pago está anulado para aplicar estilo
                    const isAnulado = pago.estado === 'anulado';
                    const rowClass = isAnulado 
                      ? 'bg-red-50/50 hover:bg-red-100/50 transition-colors duration-150' 
                      : 'hover:bg-slate-50 transition-colors duration-150';

                    // Función para obtener el badge de estado
                    const getEstadoBadge = (estado) => {
                      const badges = {
                        'pagado': <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                          <FaCheck className="text-xs" /> Pagado
                        </span>,
                        'pendiente': <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">
                          <FaExclamationTriangle className="text-xs" /> Pendiente
                        </span>,
                        'reportado': <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                          <FaClock className="text-xs" /> Reportado
                        </span>,
                        'anulado': <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                          <FaTimes className="text-xs" /> Anulado
                        </span>
                      };
                      return badges[estado] || <span className="capitalize">{estado}</span>;
                    };

                    return (
                      <tr key={pago.id} className={rowClass}>
                        <td className="px-4 py-3">
                          {getEstadoBadge(pago.estado)}
                        </td>
                        <td className="px-4 py-3">
                          {pago.estudiantes ? (
                            <div className="flex flex-col">
                              <span className="font-medium text-slate-900">{pago.estudiantes.nombre} {pago.estudiantes.apellido}</span>
                              <span className="text-xs text-slate-500">V-{formatearCedula(pago.estudiantes.cedula)}</span>
                            </div>
                          ) : <span className="text-slate-400">-</span>}
                        </td>
                        <td className="px-4 py-3">
                          {pago.representantes ? (
                            <div className="flex flex-col">
                              <span className="font-medium text-slate-900">{pago.representantes.nombre} {pago.representantes.apellido}</span>
                              <span className="text-xs text-slate-500">V-{formatearCedula(pago.representantes.cedula)}</span>
                            </div>
                          ) : <span className="text-slate-400">-</span>}
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                            {`${formatearNombreGrado(pago.grado?.nombre_grado || '')} ${pago.seccion?.nombre_seccion || ''}`.trim() || 'N/A'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-mono text-xs text-slate-600">{pago.referencia || '-'}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col">
                            <span className={`font-semibold text-slate-900 ${isAnulado ? 'line-through opacity-60' : ''}`}>${montoUSD.toFixed(2)}</span>
                            {montoVES != null && (
                              <span className={`text-xs text-slate-500 ${isAnulado ? 'line-through opacity-60' : ''}`}>Bs. {montoVES.toLocaleString('es-VE', { minimumFractionDigits: 2 })}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {moraUSD > 0 ? (
                            <div className="flex flex-col">
                              <span className={`font-semibold text-orange-600 ${isAnulado ? 'line-through opacity-60' : ''}`}>${moraUSD.toFixed(2)}</span>
                              {moraVES != null && moraVES > 0 && (
                                <span className={`text-xs text-orange-500 ${isAnulado ? 'line-through opacity-60' : ''}`}>Bs. {moraVES.toLocaleString('es-VE', { minimumFractionDigits: 2 })}</span>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`font-bold text-slate-900 ${isAnulado ? 'line-through opacity-60' : ''}`}>${totalUSD.toFixed(2)}</span>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredItems.length === 0 && (
                    <tr>
                      <td className="px-4 py-8 text-center text-slate-500" colSpan={8}>
                        <div className="flex flex-col items-center gap-2">
                          <FaSearch className="text-3xl text-slate-300" />
                          <p className="text-sm font-medium">No se encontraron resultados</p>
                          <p className="text-xs text-slate-400">Intenta ajustar los filtros de búsqueda</p>
                        </div>
                      </td>
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
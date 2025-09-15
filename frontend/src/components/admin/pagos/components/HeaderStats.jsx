import React, { useEffect, useMemo, useState } from 'react';
import { FaMoneyBillWave, FaCheckCircle, FaClock, FaChartLine, FaCalendarAlt } from 'react-icons/fa';

function formatCurrency(value) {
  const n = parseFloat(value || 0);
  return n.toLocaleString('es-VE', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });
}

function calcPagoTotal(p) {
  const monto = parseFloat(p.monto || 0) || 0;
  const mora = parseFloat(p.montoMora || 0) || 0;
  const desc = parseFloat(p.descuento || 0) || 0;
  return monto + mora - desc;
}

const meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

export default function HeaderStats({
  filteredPagos = [],
  pagosPendientes = [],
  pagosAprobados = [],
  pagosReportados = [],
  annoEscolar,
  mensualidadesAprobadas = 0,
  totalMensualidades = 0,
  onOpenMonthlySummary,
  // Opcionales para afectar solo el modal
  selectedMes,
  selectedAnio,
  onChangeMes,
  onChangeAnio,
}) {
  const now = new Date();
  const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const pagosMes = useMemo(() => {
    return filteredPagos.filter(p => {
      const d = p.fechaPago ? new Date(p.fechaPago) : null;
      if (!d || isNaN(d)) return false;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      return key === ym;
    });
  }, [filteredPagos, ym]);

  const totalMes = useMemo(() => pagosMes.reduce((acc, p) => acc + calcPagoTotal(p), 0), [pagosMes]);
  const countMes = pagosMes.length;

  // Totales por estado del mes vigente
  const pendientesMes = useMemo(() => pagosMes.filter(p => p.estado === 'pendiente' && !p.urlComprobante).length, [pagosMes]);
  const reportadosMes = useMemo(() => pagosMes.filter(p => p.estado === 'pendiente' && p.urlComprobante).length, [pagosMes]);
  const aprobadosMes = useMemo(() => pagosMes.filter(p => p.estado === 'pagado').length, [pagosMes]);

  // Reloj en vivo
  const [nowTick, setNowTick] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNowTick(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const fechaFormateada = new Intl.DateTimeFormat('es-VE', { day: 'numeric', month: 'long', year: 'numeric' }).format(nowTick);
  const horaFormateada = nowTick.toLocaleTimeString('es-VE', { hour12: false });

  // Valores por defecto para los selectores (solo informativos para el modal)
  const mesVal = selectedMes ?? (now.getMonth() + 1);
  const anioVal = selectedAnio ?? now.getFullYear();

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-pink-800 to-pink-900 shadow-2xl rounded-2xl mb-8">
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-pink-700/30 to-transparent"></div>

      <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-pink-400/20 rounded-full blur-xl"></div>
      <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-32 h-32 bg-pink-300/10 rounded-full blur-2xl"></div>

      <div className="relative px-6 py-12">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20">
                  <FaMoneyBillWave className="w-8 h-8 text-pink-100" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-white mb-2">Gestión de Pagos</h1>
                  <p className="text-pink-100/80 text-lg">Administra y revisa pagos de estudiantes</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-white text-lg font-semibold">{fechaFormateada}</div>
                <div className="text-pink-100/90 flex items-center justify-end gap-2"><FaClock /> {horaFormateada}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-pink-100 text-sm font-medium">Pagos Pendientes</p>
                    <p className="text-2xl font-bold text-white">{Math.max(0, (pagosPendientes?.length || 0) - (pagosReportados?.length || 0))}</p>
                  </div>
                  <FaClock className="w-8 h-8 text-pink-200" />
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-pink-100 text-sm font-medium">Pagos Aprobados</p>
                    <p className="text-2xl font-bold text-white">{pagosAprobados?.length || 0}</p>
                  </div>
                  <FaCheckCircle className="w-8 h-8 text-pink-200" />
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-pink-100 text-sm font-medium">Total del Mes</p>
                    <p className="text-2xl font-bold text-white">{formatCurrency(totalMes)} <span className="text-sm">({countMes})</span></p>
                    <div className="flex items-center gap-2 mt-2">
                      <select
                        className="text-xs bg-white/10 border border-white/30 text-white rounded px-2 py-1"
                        value={mesVal}
                        onChange={(e) => onChangeMes && onChangeMes(Number(e.target.value))}
                        title="Mes para el resumen"
                      >
                        {meses.map((m, idx) => (
                          <option key={idx} value={idx+1}>{m}</option>
                        ))}
                      </select>
                      <input
                        type="number"
                        className="w-20 text-xs bg-white/10 border border-white/30 text-white rounded px-2 py-1"
                        value={anioVal}
                        onChange={(e) => onChangeAnio && onChangeAnio(Number(e.target.value))}
                        title="Año para el resumen"
                      />
                      {onOpenMonthlySummary && (
                        <button onClick={onOpenMonthlySummary} className="text-xs px-2 py-1 rounded bg-white/20 border border-white/30 text-white hover:bg-white/30">Ver resumen</button>
                      )}
                    </div>
                  </div>
                  <FaChartLine className="w-8 h-8 text-pink-200" />
                </div>
                <div className="flex items-center text-pink-100/80 text-sm mt-2">
                  <FaCalendarAlt className="mr-2" />
                  <span>{annoEscolar?.periodo || 'Año escolar'}</span>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-pink-100 text-sm font-medium">Mensualidades aprobadas</p>
                    <p className="text-2xl font-bold text-white">{mensualidadesAprobadas} <span className="text-sm">de {totalMensualidades}</span></p>
                  </div>
                  {/* Botón Configuración (esquina inferior derecha del grid) */}
                  <button
                    onClick={() => window.dispatchEvent(new CustomEvent('open-config-pagos'))}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white text-black hover:text-red-600 border border-slate-200"
                    title="Configuración de pagos"
                  >
                    Configuración
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
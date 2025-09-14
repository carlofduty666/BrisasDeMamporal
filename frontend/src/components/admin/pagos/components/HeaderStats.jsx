import React, { useMemo } from 'react';
import { FaMoneyBillWave, FaCheckCircle, FaClock, FaPlus, FaChartLine, FaCalendarAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';

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

export default function HeaderStats({ filteredPagos = [], pagosPendientes = [], pagosAprobados = [], pagosReportados = [], annoEscolar, mensualidadesAprobadas = 0, totalMensualidades = 0, onOpenMonthlySummary }) {
  const now = new Date();
  const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const { totalMes, countMes } = useMemo(() => {
    const pagosMes = filteredPagos.filter(p => {
      const d = p.fechaPago ? new Date(p.fechaPago) : null;
      if (!d || isNaN(d)) return false;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      return key === ym;
    });
    const t = pagosMes.reduce((acc, p) => acc + calcPagoTotal(p), 0);
    return { totalMes: t, countMes: pagosMes.length };
  }, [filteredPagos, ym]);

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-pink-800 to-pink-900 shadow-2xl rounded-2xl mb-8">
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-pink-700/30 to-transparent"></div>

      <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-pink-400/20 rounded-full blur-xl"></div>
      <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-32 h-32 bg-pink-300/10 rounded-full blur-2xl"></div>

      <div className="relative px-6 py-12">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20">
                <FaMoneyBillWave className="w-8 h-8 text-pink-100" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">Gestión de Pagos</h1>
                <p className="text-pink-100/80 text-lg">Administra y revisa pagos de estudiantes</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-pink-100 text-sm font-medium">Pagos Pendientes</p>
                    <p className="text-2xl font-bold text-white">{pagosPendientes.length - pagosReportados.length}</p>
                  </div>
                  <FaClock className="w-8 h-8 text-pink-200" />
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-pink-100 text-sm font-medium">Pagos Aprobados</p>
                    <p className="text-2xl font-bold text-white">{pagosAprobados.length}</p>
                  </div>
                  <FaCheckCircle className="w-8 h-8 text-pink-200" />
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-pink-100 text-sm font-medium">Total del Mes</p>
                    <p className="text-2xl font-bold text-white">{formatCurrency(totalMes)} <span className="text-sm">({countMes})</span></p>
                    {onOpenMonthlySummary && (
                      <button onClick={onOpenMonthlySummary} className="mt-2 text-xs px-2 py-1 rounded bg-white/20 border border-white/30 text-white hover:bg-white/30">Ver resumen</button>
                    )}
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
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 lg:mt-0 lg:ml-8">
            <Link
              to="/admin/pagos/nuevo"
              className="inline-flex items-center px-8 py-4 bg-white/20 backdrop-blur-md text-white font-semibold rounded-2xl border border-white/30 hover:bg-white/30 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <FaPlus className="w-5 h-5 mr-3" />
              Nuevo Pago
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
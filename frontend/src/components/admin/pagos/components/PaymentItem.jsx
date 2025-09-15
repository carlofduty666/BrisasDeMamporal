import React from 'react';
import { FaUserGraduate, FaTag, FaMoneyCheckAlt, FaFileInvoiceDollar, FaEye, FaCalendarAlt } from 'react-icons/fa';

function classEstado(estado) {
  if (estado === 'pagado') return 'bg-green-100 text-green-800';
  if (estado === 'pendiente') return 'bg-yellow-100 text-yellow-800';
  return 'bg-red-100 text-red-800';
}

function formatCurrency(value) {
  const n = parseFloat(value || 0);
  return n.toLocaleString('es-VE', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });
}

export default function PaymentItem({ pago, onClick }) {
  const estudiante = pago.estudiante || pago.estudiantes;
  const representante = pago.representante || pago.representantes;
  const metodo = pago.metodoPago || pago.metodoPagos;
  const arancel = pago.arancel || pago.aranceles;

  const montoTotal = (parseFloat(pago.monto || 0) + parseFloat(pago.montoMora || 0) - parseFloat(pago.descuento || 0)).toFixed(2);

  return (
    <div className="group relative bg-white rounded-xl border border-slate-200 hover:border-pink-300 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-pink-50 text-pink-700 rounded-lg">
              <FaUserGraduate />
            </div>
            <div>
              <p className="font-semibold text-slate-800">
                {estudiante ? `${estudiante.nombre} ${estudiante.apellido}` : 'Estudiante'}
              </p>
              <p className="text-sm text-slate-500">{representante ? `Rep.: ${representante.nombre} ${representante.apellido}` : '—'}</p>
            </div>
          </div>
          <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${classEstado(pago.estado)}`}>
            {pago.estado?.charAt(0).toUpperCase() + pago.estado?.slice(1)}
          </span>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center text-xs px-2 py-1 rounded-md bg-slate-100 text-slate-700">
            <FaTag className="mr-1" /> {arancel?.nombre || 'Concepto'}
          </span>
          <span className="inline-flex items-center text-xs px-2 py-1 rounded-md bg-slate-100 text-slate-700">
            <FaMoneyCheckAlt className="mr-1" /> {metodo?.nombre || 'Método'}
          </span>
          {pago.mesPago && (
            <span className="inline-flex items-center text-xs px-2 py-1 rounded-md bg-slate-100 text-slate-700">
              <FaCalendarAlt className="mr-1" /> {pago.mesPago}
            </span>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500">Monto total</p>
            <p className="text-lg font-bold text-slate-800">{formatCurrency(montoTotal)}</p>
          </div>
          <button
            onClick={onClick}
            className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-lg bg-pink-600 text-white hover:bg-pink-700 transition-colors"
            title="Ver detalles"
          >
            <FaEye className="mr-2" /> Ver
          </button>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-pink-700 to-pink-800 opacity-0 group-hover:opacity-100 transition-opacity rounded-b-xl" />
    </div>
  );
}
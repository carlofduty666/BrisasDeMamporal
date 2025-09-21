import React from 'react';
import { FaClock, FaCheckCircle, FaTimesCircle, FaPaperPlane } from 'react-icons/fa';
import { formatearNombreGrado, formatearFecha, formatearMetodoPago } from '../../../../utils/formatters'

function badge(estado) {
  switch (estado) {
    case 'pagado': return 'bg-green-100 text-green-800';
    case 'reportado': return 'bg-blue-100 text-blue-800';
    case 'pendiente': return 'bg-yellow-100 text-yellow-800';
    default: return 'bg-red-100 text-red-800';
  }
}

export default function MensualidadRow({ m, onAprobar, onRechazar, onRecordatorio, loadingId }) {
  const total = (Number(m.montoBase || m.monto || 0) + Number(m.moraAcumulada || 0)).toFixed(2);

  const fmt = (d) => {
    if (!d) return '';
    const dt = new Date(d);
    const dd = String(dt.getDate()).padStart(2,'0');
    const mm = String(dt.getMonth()+1).padStart(2,'0');
    const yy = dt.getFullYear();
    return `${dd}/${mm}/${yy}`;
  };

  return (
    <tr className="border-b">
      <td className="px-3 py-2 text-sm text-slate-700">{m.periodo ?? '-'}</td>
      <td className="px-3 py-2 text-sm text-slate-700">{m.mesNombre || m.mes}</td>
      <td className="px-3 py-2 text-sm text-slate-700">{m.anio ?? '-'}</td>
      <td className="px-3 py-2 text-sm text-slate-700">{fmt(m.fechaVencimiento)}</td>
      <td className="px-3 py-2 text-sm text-slate-700">
        <div>${Number(m.montoBase ?? m.monto ?? 0).toFixed(2)}</div>
        <div className="text-xs text-slate-500">Bs. {(Number(m.montoBase ?? m.monto ?? 0) * 35).toFixed(2)}</div>
      </td>
      <td className="px-3 py-2 text-sm text-slate-700">
        <div>${Number(m.moraAcumulada ?? 0).toFixed(2)}</div>
        <div className="text-xs text-slate-500">Bs. {(Number(m.moraAcumulada ?? 0) * 35).toFixed(2)}</div>
      </td>
      <td className="px-3 py-2">
        <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${badge(m.estado)}`}>{m.estado}</span>
      </td>
      <td className="px-3 py-2 text-sm font-semibold text-slate-800">
        <div>${total}</div>
        <div className="text-xs text-slate-500">Bs. {(Number(total) * 35).toFixed(2)}</div>
      </td>
      <td className="px-3 py-2 text-right">
        <div className="inline-flex gap-2">
          {m.estado === 'reportado' && (
            <>
              <button
                disabled={loadingId === m.id}
                onClick={() => onRechazar?.(m)}
                className="inline-flex items-center px-2 py-1 text-xs rounded bg-red-600 text-white hover:bg-red-700"
                title="Rechazar"
              >
                <FaTimesCircle className="mr-1"/> Rechazar
              </button>
              <button
                disabled={loadingId === m.id}
                onClick={() => onAprobar?.(m)}
                className="inline-flex items-center px-2 py-1 text-xs rounded bg-green-600 text-white hover:bg-green-700"
                title="Aprobar"
              >
                <FaCheckCircle className="mr-1"/> Aprobar
              </button>
            </>
          )}
          {m.estado !== 'pagado' && (
            <button
              disabled={loadingId === m.id}
              onClick={() => onRecordatorio?.(m)}
              className="inline-flex items-center px-2 py-1 text-xs rounded bg-slate-700 text-white hover:bg-slate-800"
              title="Enviar recordatorio"
            >
              <FaPaperPlane className="mr-1"/> Recordar
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}
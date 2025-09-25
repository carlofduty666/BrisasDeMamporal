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
  // Usar precios congelados/actuales provenientes del backend (ConfiguracionPagos)
  const precioUSD = Number(m.precioUSD ?? 0);
  const precioVES = Number(m.precioVES ?? 0);
  const moraUSD = Number(m.moraAcumulada ?? 0);
  // Tasa implícita del backend a partir de precios USD/VES
  const tasa = precioUSD > 0 ? (precioVES / precioUSD) : null;
  const moraVES = (tasa && isFinite(tasa)) ? moraUSD * tasa : undefined;
  const totalUSD = (precioUSD + moraUSD).toFixed(2);
  const totalVES = (tasa && isFinite(tasa)) ? (precioVES + (moraVES || 0)) : undefined;

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
        <div>${Number(precioUSD).toFixed(2)}</div>
        {Number.isFinite(precioVES) ? (
          <div className="text-xs text-slate-500">Bs. {Number(precioVES).toFixed(2)}</div>
        ) : null}
      </td>
      <td className="px-3 py-2 text-sm text-slate-700">
        <div>${Number(m.moraAcumulada ?? 0).toFixed(2)}</div>
        {typeof m.moraAcumuladaVES === 'number' ? (
          <div className="text-xs text-slate-500">Bs. {Number(m.moraAcumuladaVES).toFixed(2)}</div>
        ) : null}
      </td>
      <td className="px-3 py-2">
        <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${badge(m.estado)}`}>{m.estado}</span>
      </td>
      <td className="px-3 py-2 text-sm font-semibold text-slate-800">
        <div>${totalUSD}</div>
        {Number.isFinite(totalVES) ? (
          <div className="text-xs text-slate-500">Bs. {Number(totalVES).toFixed(2)}</div>
        ) : null}
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
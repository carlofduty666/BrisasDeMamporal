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
  // Montos congelados (snapshot) del backend
  const precioUSD = Number(m.precioUSD ?? 0);
  const precioVES = Number(m.precioVES ?? 0);
  const moraUSD = Number(m.moraAcumulada ?? 0);
  const moraVESsnap = typeof m.moraAcumuladaVES === 'number' ? Number(m.moraAcumuladaVES) : null;
  
  // Totales "congelados"
  const totalUSD = Number(precioUSD + moraUSD);
  const totalVES = (typeof precioVES === 'number' && typeof moraVESsnap === 'number') ? Number(precioVES + moraVESsnap) : null;

  // Montos "actualizados al día" del backend
  const hasUpdated = Boolean(m.hasUpdatedPrice);
  const updatedBaseUSD = Number(m.updatedBaseUSD ?? precioUSD ?? 0);
  const updatedBaseVES = Number(m.updatedBaseVES ?? precioVES ?? 0);
  const updatedTotalUSD = Number(m.updatedTotalUSD ?? updatedBaseUSD);
  const updatedTotalVES = Number(m.updatedTotalVES ?? updatedBaseVES);

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
        {/* Base congelada vs actualizada */}
        <div>
          {hasUpdated ? (
            <>
              <div className="line-through text-slate-400">${Number(precioUSD).toFixed(2)}</div>
              <div>${Number(updatedBaseUSD).toFixed(2)}</div>
            </>
          ) : (
            <div>${Number(precioUSD).toFixed(2)}</div>
          )}
        </div>
        {Number.isFinite(precioVES) ? (
          <div className="text-xs text-slate-500">
            {hasUpdated ? (
              <>
                <span className="line-through text-slate-400">Bs. {Number(precioVES).toFixed(2)}</span>
                <span className="ml-2">Bs. {Number(updatedBaseVES).toFixed(2)}</span>
              </>
            ) : (
              <span>Bs. {Number(precioVES).toFixed(2)}</span>
            )}
          </div>
        ) : null}
      </td>
      <td className="px-3 py-2 text-sm text-slate-700">
        {/* Mora congelada (UI simple). Para mora actualizada mostrar en detalle si se requiere */}
        <div>${Number(m.moraAcumulada ?? 0).toFixed(2)}</div>
        {typeof m.moraAcumuladaVES === 'number' ? (
          <div className="text-xs text-slate-500">Bs. {Number(m.moraAcumuladaVES).toFixed(2)}</div>
        ) : null}
      </td>
      <td className="px-3 py-2">
        <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${badge(m.estado)}`}>{m.estado}</span>
      </td>
      <td className="px-3 py-2 text-sm font-semibold text-slate-800">
        {/* Totales congelados vs actualizados */}
        <div>
          {hasUpdated ? (
            <>
              <div className="line-through text-slate-400">${totalUSD.toFixed(2)}</div>
              <div>${Number(updatedTotalUSD).toFixed(2)}</div>
            </>
          ) : (
            <div>${totalUSD.toFixed(2)}</div>
          )}
        </div>
        {Number.isFinite(totalVES) ? (
          <div className="text-xs text-slate-500">
            {hasUpdated ? (
              <>
                <span className="line-through text-slate-400">Bs. {Number(totalVES).toFixed(2)}</span>
                <span className="ml-2">Bs. {Number(updatedTotalVES).toFixed(2)}</span>
              </>
            ) : (
              <span>Bs. {Number(totalVES).toFixed(2)}</span>
            )}
          </div>
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
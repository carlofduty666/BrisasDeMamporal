import React, { useEffect, useState } from 'react';
import { mensualidadesService } from '../../../../services/mensualidadesService';
import MensualidadRow from './MensualidadRow';

export default function MensualidadesTable({ filtro = {}, titulo = 'Mensualidades' }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      const data = filtro.estudianteID
        ? await mensualidadesService.listByEstudiante(filtro.estudianteID, filtro)
        : await mensualidadesService.list(filtro);
      setItems(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (e) {
      console.error(e);
      setError('Error al cargar mensualidades');
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [JSON.stringify(filtro)]);

  const aprobar = async (m) => {
    try {
      setActionLoadingId(m.id);
      await mensualidadesService.aprobar(m.id);
      await load();
    } finally {
      setActionLoadingId(null);
    }
  };

  const rechazar = async (m) => {
    try {
      const motivo = prompt('Motivo del rechazo (opcional):') || '';
      setActionLoadingId(m.id);
      await mensualidadesService.rechazar(m.id, motivo);
      await load();
    } finally {
      setActionLoadingId(null);
    }
  };

  const recordar = async (m) => {
    try {
      setActionLoadingId(m.id);
      await mensualidadesService.enviarRecordatorio(m.id);
      alert('Recordatorio enviado');
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl">
      <div className="px-4 py-3 border-b flex items-center justify-between gap-3">
        <h3 className="font-semibold text-slate-800">{titulo}</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={async ()=>{ await mensualidadesService.recalcularMoras(); await load(); }}
            className="px-3 py-1.5 text-xs rounded bg-slate-700 text-white hover:bg-slate-800"
          >Recalcular moras</button>
          <button
            onClick={async ()=>{ await mensualidadesService.enviarRecordatorioMasivo({}); alert('Recordatorios encolados'); }}
            className="px-3 py-1.5 text-xs rounded bg-pink-600 text-white hover:bg-pink-700"
          >Recordar a todos</button>
        </div>
      </div>
      {loading ? (
        <div className="p-6 text-center text-slate-500">Cargando...</div>
      ) : error ? (
        <div className="p-6 text-center text-red-600">{error}</div>
      ) : items.length === 0 ? (
        <div className="p-6 text-center text-slate-500">No hay mensualidades</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-left">
                <th className="px-3 py-2">Periodo</th>
                <th className="px-3 py-2">Mes</th>
                <th className="px-3 py-2">Año</th>
                <th className="px-3 py-2">Vencimiento</th>
                <th className="px-3 py-2">Monto</th>
                <th className="px-3 py-2">Mora</th>
                <th className="px-3 py-2">Estado</th>
                <th className="px-3 py-2">Total</th>
                <th className="px-3 py-2 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.map((m) => (
                <MensualidadRow
                  key={m.id}
                  m={m}
                  onAprobar={aprobar}
                  onRechazar={rechazar}
                  onRecordatorio={recordar}
                  loadingId={actionLoadingId}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
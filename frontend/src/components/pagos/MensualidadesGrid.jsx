import React, { useEffect, useState } from 'react';
import { mensualidadesService } from '../../services/mensualidadesService';
import ReportarPagoModal from './ReportarPagoModal';

// Reutilizable para Representante y futuro Estudiante
export default function MensualidadesGrid({ estudianteID }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      const data = await mensualidadesService.listByEstudiante(estudianteID);
      setItems(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (e) {
      console.error(e);
      setError('Error al cargar mensualidades');
      setLoading(false);
    }
  };
  useEffect(() => { if (estudianteID) load(); }, [estudianteID]);

  const [openModal, setOpenModal] = useState(false);
  const [selected, setSelected] = useState(null);

  const reportar = (m) => {
    setSelected(m);
    setOpenModal(true);
  };

  const chip = (estado) => {
    switch (estado) {
      case 'pagado': return 'bg-green-100 text-green-800';
      case 'reportado': return 'bg-blue-100 text-blue-800';
      case 'pendiente': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-red-100 text-red-800';
    }
  };

  if (loading) return <div className="p-4 text-slate-500">Cargando mensualidades...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((m) => (
          <div key={m.id} className="border rounded-xl bg-white p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-slate-800 font-semibold">{m.mesNombre || `Mes ${m.mes}`} {m.anio}</div>
                <div className="text-sm text-slate-500">Monto: ${Number(m.montoBase ?? m.monto ?? 0).toFixed(2)}</div>
                {m.moraAcumulada > 0 && (
                  <div className="text-sm text-slate-500">Mora: ${Number(m.moraAcumulada).toFixed(2)}</div>
                )}
              </div>
              <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${chip(m.estado)}`}>{m.estado}</span>
            </div>

            {m.estado !== 'pagado' && (
              <button
                onClick={() => reportar(m)}
                className="mt-4 w-full px-3 py-2 rounded bg-pink-600 text-white hover:bg-pink-700"
              >
                Reportar pago
              </button>
            )}
          </div>
        ))}
      </div>

      {openModal && selected && (
        <ReportarPagoModal
          mensualidad={selected}
          open={openModal}
          onClose={() => setOpenModal(false)}
          onReported={() => load()}
        />
      )}
    </>
  );
}
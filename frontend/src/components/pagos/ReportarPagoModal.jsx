import React, { useEffect, useState } from 'react';
import api from '../../services/api';

export default function ReportarPagoModal({ mensualidad, open, onClose, onReported }) {
  const [metodos, setMetodos] = useState([]);
  const [metodoPagoID, setMetodoPagoID] = useState('');
  const [referencia, setReferencia] = useState('');
  const [archivo, setArchivo] = useState(null);
  const [observaciones, setObservaciones] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    (async () => {
      const { data } = await api.get('/metodos-pago/activos');
      setMetodos(data || []);
    })();
  }, [open]);

  const enviar = async () => {
    if (!metodoPagoID) return alert('Selecciona un método de pago');
    const form = new FormData();
    form.append('metodoPagoID', metodoPagoID);
    form.append('referencia', referencia);
    form.append('observaciones', observaciones);
    if (archivo) form.append('comprobante', archivo);
    try {
      setLoading(true);
      await api.patch(`/mensualidades/${mensualidad.id}/reportar`, form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      onReported?.();
      onClose?.();
    } catch (e) {
      console.error(e);
      alert('Error al reportar el pago');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  const total = (Number(mensualidad.montoBase || 0) + Number(mensualidad.moraAcumulada || 0)).toFixed(2);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-slate-800">Reportar pago</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700">✕</button>
        </div>
        <div className="space-y-3">
          <div className="text-sm text-slate-700">
            Mensualidad: <b>{mensualidad.mesNombre || `Mes ${mensualidad.mes}`} {mensualidad.anio || ''}</b> · Total: <b>${total}</b>
          </div>
          <div>
            <label className="block text-sm text-slate-600">Método de pago</label>
            <select className="mt-1 w-full border rounded px-3 py-2" value={metodoPagoID} onChange={(e)=>setMetodoPagoID(e.target.value)}>
              <option value="">Selecciona</option>
              {metodos.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm text-slate-600">Referencia</label>
            <input className="mt-1 w-full border rounded px-3 py-2" value={referencia} onChange={(e)=>setReferencia(e.target.value)} placeholder="Últimos 4 o ID" />
          </div>
          <div>
            <label className="block text-sm text-slate-600">Comprobante (opcional)</label>
            <input type="file" className="mt-1 w-full" onChange={(e)=>setArchivo(e.target.files?.[0] || null)} />
          </div>
          <div>
            <label className="block text-sm text-slate-600">Observaciones</label>
            <textarea className="mt-1 w-full border rounded px-3 py-2" rows={3} value={observaciones} onChange={(e)=>setObservaciones(e.target.value)} />
          </div>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded border">Cancelar</button>
          <button disabled={loading} onClick={enviar} className="px-4 py-2 rounded bg-pink-600 text-white hover:bg-pink-700">{loading ? 'Enviando...' : 'Reportar'}</button>
        </div>
      </div>
    </div>
  );
}
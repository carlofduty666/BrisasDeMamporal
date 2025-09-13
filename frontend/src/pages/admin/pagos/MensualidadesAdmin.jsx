import React from 'react';
import MensualidadesTable from '../../../components/admin/pagos/components/MensualidadesTable';

export default function MensualidadesAdmin() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-slate-800">Mensualidades</h1>
      <MensualidadesTable titulo="Mensualidades" />
    </div>
  );
}
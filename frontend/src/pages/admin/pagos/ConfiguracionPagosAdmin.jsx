import React from 'react';
import PagosConfigPanel from '../../../components/admin/pagos/components/PagosConfigPanel';

export default function ConfiguracionPagosAdmin() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-slate-800">Configuración de Pagos</h1>
      <PagosConfigPanel />
    </div>
  );
}
import React from 'react';
import { FaCalendarAlt, FaUserGraduate, FaUserTie, FaHashtag, FaMoneyBill, FaMoneyCheckAlt } from 'react-icons/fa';
import { formatearNombreGrado, formatearMetodoPago } from '../../../../utils/formatters'

function chipEstado(estado) {
  if (estado === 'pagado') return 'bg-green-100 text-green-800 border-green-200';
  if (estado === 'pendiente') return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  return 'bg-red-100 text-red-800 border-red-200';
}



// Lista moderna acorde al tema, con columnas solicitadas
export default function PaymentsList({ items = [], onOpenDetail }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
      <div className="hidden md:grid grid-cols-12 gap-2 px-4 py-3 bg-slate-50 text-xs font-semibold text-slate-600 border-b">
        <div className="col-span-3">Estudiante</div>
        <div className="col-span-2">Grado / Sección</div>
        <div className="col-span-1">Estado</div>
        <div className="col-span-1">Mes</div>
        <div className="col-span-1">F. Reporte</div>
        <div className="col-span-1">F. Vence</div>
        <div className="col-span-1">Monto</div>
        <div className="col-span-1">Mora</div>
        <div className="col-span-1">Referencia</div>
      </div>
      <ul className="divide-y">
        {items.map(p => {
          const est = p.estudiantes || p.estudiante || {};
          const rep = p.representantes || p.representante || {};
          const insc = p.inscripciones || p.inscripcion || {};
          const grado = insc.grado?.nombre_grado || '—';
          const seccion = insc.Secciones?.nombre_seccion || '—';
          const metodo = p.metodoPagos || p.metodoPago || {};
          const mes = p.mesPago || '—';
          const fechaRep = p.fechaPago ? new Date(p.fechaPago) : null;
          const fechaVenc = p.fechaVencimiento ? new Date(p.fechaVencimiento) : (p.fechaVencimiento || null);
          const monto = parseFloat(p.monto || 0) || 0;
          const mora = parseFloat(p.montoMora || 0) || 0;
          const desc = parseFloat(p.descuento || 0) || 0;
          const montoReportado = monto + mora - desc;
          const m = p.mensualidadSnapshot || {};
          const precioAplicadoUSD = m.precioAplicadoUSD || '0.00';
          const precioAplicadoVES = m.precioAplicadoVES || '0.00';
          const moraAplicadaUSD = m.moraAplicadaUSD || '0.00';
          const moraAplicadaVES = m.moraAplicadaVES || '0.00';
          const porcentajeMora = m.porcentajeMoraAplicado || '0.00';
          const fechaCorte = m.fechaCorteAplicada || '—';
          const mesSnapshot = m.mes || '—';
          const anioSnapshot = m.anio || '—';
          const estadoMensualidad = m.estadoMensualidad || '—';


          return (
            <li key={p.id} className="px-4 py-3 hover:bg-slate-50 transition-colors">
              {/* Desktop */}
              <div className="hidden md:grid grid-cols-12 items-center gap-2">
                <div className="col-span-3 flex items-center gap-2">
                  <div className="p-2 bg-pink-50 text-pink-700 rounded"><FaUserGraduate /></div>
                  <div>
                    <div className="font-semibold text-slate-800">{est.nombre} {est.apellido}</div>
                    <div className="text-xs text-slate-500">Rep.: {rep.nombre} {rep.apellido}</div>
                    <div className="text-xs text-slate-500">Método: {formatearMetodoPago(metodo)}</div>
                  </div>
                </div>
                <div className="col-span-2 text-slate-700">{formatearNombreGrado(grado)} / {seccion}</div>
                <div className="col-span-1"><span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${chipEstado(p.estado)}`}>{p.estado}</span></div>
                <div className="col-span-1 text-slate-700">{mes}</div>
                <div className="col-span-1 text-slate-700">{fechaRep ? fechaRep.toLocaleDateString('es-VE') : '—'}</div>
                <div className="col-span-1 text-slate-700">{fechaVenc ? new Date(fechaVenc).toLocaleDateString('es-VE') : '—'}</div>
                <div className="col-span-1 font-semibold text-slate-800">
                  <div>Bs. {Number((precioAplicadoVES ?? 0)).toFixed(2)}</div>
                  <div className="text-xs text-slate-500">$ {Number((precioAplicadoUSD ?? 0)).toFixed(2)}</div>
                  {/* ✅ MOSTRAR DATOS DEL SNAPSHOT */}
                  {/* {snapshot.precioAplicadoUSD && (
                    <div className="text-xs text-blue-600 mt-1" title="Precio aplicado según configuración">
                      Config: ${precioAplicadoUSD}
                    </div>
                  )} */}
                </div>
                <div className="col-span-1 text-slate-700">
                  {mora ? (
                    <>
                      <div>${mora.toFixed(2)}</div>
                      {typeof p.montoMoraVES === 'number' ? (
                        <div className="text-xs text-slate-500">Bs. {Number(p.montoMoraVES).toFixed(2)}</div>
                      ) : null}
                      {/* ✅ MOSTRAR MORA DEL SNAPSHOT */}
                      {snapshot.moraAplicadaUSD && (
                        <div className="text-xs text-orange-600" title={`Mora aplicada: ${porcentajeMora}%`}>
                          Mora config: ${moraAplicadaUSD}
                        </div>
                      )}
                    </>
                  ) : '—'}
                </div>
                <div className="col-span-1 text-slate-700">{p.referencia || '—'}</div>
                <div className="col-span-1 text-slate-700">{formatearMetodoPago(metodo.nombre)}</div>
                <div className="col-span-0.5 justify-self-end">
                  <button className="text-pink-700 hover:text-pink-800 text-sm" onClick={() => onOpenDetail(p.id)}>Ver</button>
                </div>
              </div>
              {/* Mobile card */}
              <div className="md:hidden">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-pink-50 text-pink-700 rounded"><FaUserGraduate /></div>
                    <div>
                      <div className="font-semibold text-slate-800">{est.nombre} {est.apellido}</div>
                      <div className="text-xs text-slate-500">{formatearNombreGrado(grado)} / {seccion}</div>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${chipEstado(p.estado)}`}>{p.estado}</span>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-slate-600">
                  <div className="flex items-center gap-1"><FaCalendarAlt /> <span>Reporte:</span> <span className="text-slate-800">{fechaRep ? fechaRep.toLocaleDateString('es-VE') : '—'}</span></div>
                  <div className="flex items-center gap-1"><FaCalendarAlt /> <span>Vence:</span> <span className="text-slate-800">{fechaVenc ? new Date(fechaVenc).toLocaleDateString('es-VE') : '—'}</span></div>
                  <div className="flex items-center gap-1"><FaMoneyBill /> <span>Monto:</span> 
                    <span className="text-slate-800">
                      <div>${montoReportado.toFixed(2)}</div>
                      <div className="text-xs text-slate-500">Bs. {Number((precioAplicadoVES ?? 0)).toFixed(2)}</div>
                    </span>
                  </div>
                  <div className="flex items-center gap-1"><FaMoneyCheckAlt /> <span>Mora:</span> 
                    <span className="text-slate-800">
                      {mora ? (
                        <>
                          <div>${mora.toFixed(2)}</div>
                          <div className="text-xs text-slate-500">Bs. {Number(p.montoMoraVES ?? 0).toFixed(2)}</div>
                        </>
                      ) : '—'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1"><FaHashtag /> <span>Ref.:</span> <span className="text-slate-800">{p.referencia || '—'}</span></div>
                  <div className="flex items-center gap-1"><FaMoneyCheckAlt /> <span>Método:</span> <span className="text-slate-800">{formatearMetodoPago(metodo.nombre)}</span></div>
                </div>
                <div className="mt-2 text-right">
                  <button className="text-pink-700 hover:text-pink-800 text-sm" onClick={() => onOpenDetail(p.id)}>Ver</button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
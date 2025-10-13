import React, { useEffect } from 'react';
import { FaTimes, FaCheck, FaUserGraduate, FaUserTie, FaMoneyBill, FaPercentage, FaExclamationCircle, FaCalendarAlt, FaCreditCard, FaFileAlt, FaImage, FaTag, FaHashtag, FaReceipt } from 'react-icons/fa';
import { formatearFecha, formatearFechaHoraLocal } from '../../../../utils/formatters';

function formatCurrency(value) {
  const n = parseFloat(value || 0);
  return n.toLocaleString('es-VE', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });
}

function badgeEstado(estado) {
  if (estado === 'pagado') return 'bg-green-100 text-green-800';
  if (estado === 'pendiente') return 'bg-yellow-100 text-yellow-800';
  return 'bg-red-100 text-red-800';
}

export default function PaymentDetailModalThemed({ pago, onClose, onPreview, onApprove, onReject, theme = 'pink' }) {
  const estudiante = pago.estudiante || pago.estudiantes;
  const representante = pago.representante || pago.representantes;
  const metodo = pago.metodoPago || pago.metodoPagos;
  const arancel = pago.arancel || pago.aranceles;

  // Usar valores de mensualidadSnapshot si están disponibles
  const snapshot = pago.mensualidadSnapshot || {};
  const monto = snapshot.precioAplicadoUSD != null ? parseFloat(snapshot.precioAplicadoUSD) : parseFloat(pago.monto || 0);
  const montoVES = parseFloat(snapshot.precioAplicadoVES || pago.montoVES || 0) || 0;
  const mora = snapshot.moraAplicadaUSD != null ? parseFloat(snapshot.moraAplicadaUSD) : parseFloat(pago.montoMora || 0);
  const moraVES = parseFloat(snapshot.moraAplicadaVES || pago.montoMoraVES || 0) || 0;
  const desc = parseFloat(pago.descuento || 0) || 0;
  const tasaCambio = parseFloat(snapshot.tasaAplicadaMes || 0) || 0;
  const descVES = tasaCambio > 0 ? desc * tasaCambio : parseFloat(pago.descuentoVES || 0) || 0;
  const total = monto + mora - desc;
  const totalVES = montoVES + moraVES - descVES;

  const isImage = pago.urlComprobante && (pago.urlComprobante.toLowerCase().endsWith('.jpg') || pago.urlComprobante.toLowerCase().endsWith('.jpeg') || pago.urlComprobante.toLowerCase().endsWith('.png'));

  // Theme colors mapping
  const themeColors = {
    pink: {
      gradient: 'from-pink-700 to-pink-800',
      bg: 'bg-pink-700',
      bgLight: 'bg-pink-50',
      border: 'border-pink-200',
      text: 'text-pink-700',
      textDark: 'text-pink-800',
      textLight: 'text-pink-600',
      textLighter: 'text-pink-700',
      hover: 'hover:bg-pink-700',
      bgHover: 'bg-pink-600 hover:bg-pink-700'
    },
    violet: {
      gradient: 'from-violet-700 to-violet-800',
      bg: 'bg-violet-700',
      bgLight: 'bg-violet-50',
      border: 'border-violet-200',
      text: 'text-violet-700',
      textDark: 'text-violet-800',
      textLight: 'text-violet-600',
      textLighter: 'text-violet-700',
      hover: 'hover:bg-violet-700',
      bgHover: 'bg-violet-600 hover:bg-violet-700'
    }
  };

  const colors = themeColors[theme] || themeColors.pink;

  // Close with Escape key
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 overflow-y-auto animate-fadeIn" onClick={onClose}>
      <div className="min-h-full flex items-center justify-center p-4">
        <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[85vh] animate-slideUp" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className={`bg-gradient-to-r ${colors.gradient} text-white px-6 py-4 flex items-center justify-between rounded-t-2xl`}>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <FaMoneyBill className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Pago #{pago.id}</h3>
                <span className={`mt-1 inline-flex text-xs font-semibold px-2 py-0.5 rounded-full ${badgeEstado(pago.estado)}`}>
                  <span className="text-slate-800">{pago.estado?.charAt(0).toUpperCase() + pago.estado?.slice(1)}</span>
                </span>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors duration-200">
              <FaTimes />
            </button>
          </div>

          {/* Body (scrollable) */}
          <div className="px-6 py-5 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto flex-1" style={{ willChange: 'scroll-position' }}>
          <div className="bg-slate-50 rounded-xl p-4">
            <h4 className={`font-semibold text-slate-800 mb-3 flex items-center`}><FaUserGraduate className={`mr-2 ${colors.text}`} /> Estudiante</h4>
            <p className="text-sm text-slate-700"><span className="font-medium">Nombre:</span> {estudiante ? `${estudiante.nombre} ${estudiante.apellido}` : '-'}</p>
            <p className="text-sm text-slate-700"><span className="font-medium">Cédula:</span> {estudiante?.cedula || '-'}</p>
          </div>

          <div className="bg-slate-50 rounded-xl p-4">
            <h4 className={`font-semibold text-slate-800 mb-3 flex items-center`}><FaUserTie className={`mr-2 ${colors.text}`} /> Representante</h4>
            <p className="text-sm text-slate-700"><span className="font-medium">Nombre:</span> {representante ? `${representante.nombre} ${representante.apellido}` : '-'}</p>
            <p className="text-sm text-slate-700"><span className="font-medium">Cédula:</span> {representante?.cedula || '-'}</p>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 md:col-span-2">
            <h4 className={`font-semibold text-slate-800 mb-3 flex items-center`}><FaFileAlt className={`mr-2 ${colors.text}`} /> Detalles</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 rounded-lg bg-white border">
                <p className={`text-xs text-slate-500 flex items-center`}><FaTag className={`mr-1 ${colors.text}`} /> Concepto</p>
                <p className="font-semibold text-slate-800">{arancel?.nombre || pago.concepto || '-'}</p>
              </div>
              <div className="p-3 rounded-lg bg-white border">
                <p className={`text-xs text-slate-500 flex items-center`}><FaCreditCard className={`mr-1 ${colors.text}`} /> Método de pago</p>
                <p className="font-semibold text-slate-800">{metodo?.nombre || '-'}</p>
              </div>
              <div className="p-3 rounded-lg bg-white border">
                <p className={`text-xs text-slate-500 flex items-center`}><FaHashtag className={`mr-1 ${colors.text}`} /> Referencia</p>
                <p className="font-semibold text-slate-800">{pago.referencia || '-'}</p>
              </div>

              <div className="p-3 rounded-lg bg-white border">
                <p className={`text-xs text-slate-500 flex items-center`}><FaMoneyBill className={`mr-1 ${colors.text}`} /> Monto</p>
                <p className="font-semibold text-slate-800">{formatCurrency(monto)}</p>
                <p className="text-xs text-slate-500">Bs. {montoVES.toFixed(2)}</p>
              </div>
              <div className="p-3 rounded-lg bg-white border">
                <p className={`text-xs text-slate-500 flex items-center`}><FaExclamationCircle className={`mr-1 ${colors.text}`} /> Mora</p>
                <p className="font-semibold text-slate-800">{formatCurrency(mora)}</p>
                <p className="text-xs text-slate-500">Bs. {moraVES.toFixed(2)}</p>
              </div>
              <div className="p-3 rounded-lg bg-white border">
                <p className={`text-xs text-slate-500 flex items-center`}><FaPercentage className={`mr-1 ${colors.text}`} /> Descuento</p>
                <p className="font-semibold text-slate-800">{formatCurrency(desc)}</p>
                <p className="text-xs text-slate-500">Bs. {descVES.toFixed(2)}</p>
              </div>

              <div className={`p-3 rounded-lg ${colors.bgLight} border ${colors.border} md:col-span-3`}>
                <p className={`text-xs ${colors.textLight} flex items-center`}><FaMoneyBill className="mr-1" /> Total</p>
                <p className={`text-xl font-extrabold ${colors.textDark}`}>{formatCurrency(total)}</p>
                <p className={`text-xs ${colors.textLighter}`}>Bs. {totalVES.toFixed(2)}</p>
              </div>

              <div className="p-3 rounded-lg bg-white border">
                <p className={`text-xs text-slate-500 flex items-center`}><FaCalendarAlt className={`mr-1 ${colors.text}`} /> Fecha de Pago</p>
                <p className="font-semibold text-slate-800">{pago.fechaPago ? formatearFecha(pago.fechaPago) : '-'}</p>
              </div>
              <div className="p-3 rounded-lg bg-white border">
                <p className="text-xs text-slate-500"><FaCalendarAlt className={`inline mr-1 ${colors.text}`} /> Registrado</p>
                <p className="font-semibold text-slate-800">{pago.createdAt ? formatearFechaHoraLocal(pago.createdAt) : '-'}</p>
              </div>
              {pago.updatedAt && pago.updatedAt !== pago.createdAt && (
                <div className="p-3 rounded-lg bg-white border">
                  <p className="text-xs text-slate-500">Actualizado</p>
                  <p className="font-semibold text-slate-800">{formatearFechaHoraLocal(pago.updatedAt)}</p>
                </div>
              )}
            </div>

            {pago.observaciones && (
              <div className="mt-4 p-4 rounded-xl bg-slate-50 border">
                <p className="text-sm text-slate-700">{pago.observaciones}</p>
              </div>
            )}

            {pago.urlComprobante && (
              <div className="mt-4">
                <h5 className={`text-sm font-semibold text-slate-800 mb-2 flex items-center`}><FaReceipt className={`mr-2 ${colors.text}`} /> Comprobante</h5>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-600 truncate">{pago.nombreArchivo || pago.urlComprobante.split('/').pop()}</p>
                  <button
                    onClick={() => onPreview?.(pago)}
                    className={`inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md ${colors.bgHover} text-white transition-all duration-200`}
                  >
                    <FaImage className="mr-2" /> Ver
                  </button>
                </div>
                {isImage && (
                  <div className="mt-4 flex justify-center">
                    <img
                      src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${pago.urlComprobante}`}
                      alt="Comprobante"
                      className="max-h-64 object-contain border rounded"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
          </div>
          {/* Footer actions */}
          <div className="px-6 py-4 border-t bg-white flex items-center justify-end gap-2 rounded-b-2xl">
            {pago.estado === 'pendiente' && onApprove && onReject && (
              <>
                <button
                  onClick={() => onReject?.(pago)}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg bg-red-600 text-white hover:bg-red-700 transition-all duration-200"
                >
                  <FaTimes className="mr-2" /> Rechazar
                </button>
                <button
                  onClick={() => onApprove?.(pago)}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg bg-green-600 text-white hover:bg-green-700 transition-all duration-200"
                >
                  <FaCheck className="mr-2" /> Aprobar
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all duration-200"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
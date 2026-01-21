import { 
  FaMoneyBillWave, 
  FaCheckCircle, 
  FaClock, 
  FaExclamationCircle,
  FaDollarSign,
  FaCalendarAlt,
  FaEye
} from 'react-icons/fa';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const PagosWidget = ({ mensualidades }) => {
  const navigate = useNavigate();
  const [estadoPagos, setEstadoPagos] = useState({
    pagados: 0,
    pendientes: 0,
    vencidos: 0,
    totalMensualidades: 0,
    porcentajePagado: 0
  });

  useEffect(() => {
    if (mensualidades && mensualidades.length > 0) {
      const hoy = new Date();
      
      let pagados = 0;
      let pendientes = 0;
      let vencidos = 0;

      mensualidades.forEach(mensualidad => {
        if (mensualidad.estado === 'pagado') {
          pagados++;
        } else if (mensualidad.estado === 'pendiente') {
          const fechaVenc = new Date(mensualidad.fechaVencimiento);
          if (fechaVenc < hoy) {
            vencidos++;
          } else {
            pendientes++;
          }
        }
      });

      const porcentajePagado = mensualidades.length > 0 
        ? ((pagados / mensualidades.length) * 100).toFixed(0)
        : 0;

      setEstadoPagos({
        pagados,
        pendientes,
        vencidos,
        totalMensualidades: mensualidades.length,
        porcentajePagado
      });
    }
  }, [mensualidades]);

  const getEstadoBadge = (mensualidad) => {
    if (mensualidad.estado === 'pagado') {
      return (
        <span className="px-2 py-1 bg-green-500/20 border border-green-500 text-green-400 text-xs rounded-full flex items-center gap-1">
          <FaCheckCircle className="text-xs" />
          Pagado
        </span>
      );
    }

    const hoy = new Date();
    const fechaVenc = new Date(mensualidad.fechaVencimiento);
    
    if (fechaVenc < hoy) {
      return (
        <span className="px-2 py-1 bg-red-500/20 border border-red-500 text-red-400 text-xs rounded-full flex items-center gap-1">
          <FaExclamationCircle className="text-xs" />
          Vencido
        </span>
      );
    }

    const diasRestantes = Math.ceil((fechaVenc - hoy) / (1000 * 60 * 60 * 24));
    const color = diasRestantes <= 5 ? 'yellow' : 'blue';
    
    return (
      <span className={`px-2 py-1 bg-${color}-500/20 border border-${color}-500 text-${color}-400 text-xs rounded-full flex items-center gap-1`}>
        <FaClock className="text-xs" />
        {diasRestantes} día{diasRestantes !== 1 ? 's' : ''}
      </span>
    );
  };

  const formatFecha = (fecha) => {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-VE', { 
      day: '2-digit', 
      month: 'short',
      year: 'numeric'
    });
  };

  const formatMonto = (monto) => {
    return parseFloat(monto || 0).toFixed(2);
  };

  const getMensualidadesRecientes = () => {
    if (!mensualidades || mensualidades.length === 0) return [];
    
    const ordenadas = [...mensualidades].sort((a, b) => {
      if (a.estado === 'pendiente' && b.estado === 'pagado') return -1;
      if (a.estado === 'pagado' && b.estado === 'pendiente') return 1;
      return new Date(b.fechaVencimiento) - new Date(a.fechaVencimiento);
    });

    return ordenadas.slice(0, 5);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
      {/* Header */}
      <div className="bg-slate-800 px-6 py-4 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <FaMoneyBillWave className="text-2xl text-white" />
          <h2 className="text-xl font-bold text-white">Estado de Pagos</h2>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Estadísticas de Pagos */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-slate-50 rounded-lg p-3 border border-green-200 text-center transition-all duration-300 hover:bg-white hover:border-green-500 hover:shadow-sm">
            <FaCheckCircle className="text-green-500 text-xl mx-auto mb-1" />
            <p className="text-2xl font-bold text-green-600">{estadoPagos.pagados}</p>
            <p className="text-slate-500 text-xs">Pagados</p>
          </div>

          <div className="bg-slate-50 rounded-lg p-3 border border-blue-200 text-center transition-all duration-300 hover:bg-white hover:border-blue-500 hover:shadow-sm">
            <FaClock className="text-blue-500 text-xl mx-auto mb-1" />
            <p className="text-2xl font-bold text-blue-600">{estadoPagos.pendientes}</p>
            <p className="text-slate-500 text-xs">Pendientes</p>
          </div>

          <div className="bg-slate-50 rounded-lg p-3 border border-red-200 text-center transition-all duration-300 hover:bg-white hover:border-red-500 hover:shadow-sm">
            <FaExclamationCircle className="text-red-500 text-xl mx-auto mb-1" />
            <p className="text-2xl font-bold text-red-600">{estadoPagos.vencidos}</p>
            <p className="text-slate-500 text-xs">Vencidos</p>
          </div>
        </div>

        {/* Barra de Progreso */}
        <div className="mb-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-slate-600 text-sm">Progreso de Pagos</p>
            <span className="text-slate-800 font-semibold text-sm">{estadoPagos.porcentajePagado}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ease-out ${
                estadoPagos.porcentajePagado >= 80 ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                estadoPagos.porcentajePagado >= 50 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
                'bg-gradient-to-r from-red-500 to-red-600'
              }`}
              style={{ width: `${estadoPagos.porcentajePagado}%` }}
            />
          </div>
        </div>

        {/* Alerta de Pagos Vencidos */}
        {estadoPagos.vencidos > 0 && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <FaExclamationCircle className="text-red-500 text-lg flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-700 text-sm font-semibold">
                Pagos Vencidos
              </p>
              <p className="text-red-600 text-xs mt-1">
                Tienes {estadoPagos.vencidos} pago{estadoPagos.vencidos !== 1 ? 's' : ''} vencido{estadoPagos.vencidos !== 1 ? 's' : ''}. Contacta a tu representante.
              </p>
            </div>
          </div>
        )}

        {/* Lista de Mensualidades Recientes */}
        {getMensualidadesRecientes().length > 0 ? (
          <div className="space-y-2 max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
            <p className="text-slate-500 text-xs font-semibold mb-2">Mensualidades Recientes:</p>
            {getMensualidadesRecientes().map((mensualidad, index) => (
              <div
                key={index}
                className={`bg-slate-50 rounded-lg p-3 border transition-all duration-300 hover:bg-white hover:scale-[1.01] hover:shadow-sm ${
                  mensualidad.estado === 'pagado' 
                    ? 'border-green-200 hover:border-green-500' 
                    : new Date(mensualidad.fechaVencimiento) < new Date()
                    ? 'border-red-200 hover:border-red-500'
                    : 'border-slate-200 hover:border-blue-500'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="text-slate-800 text-sm font-semibold">
                      {mensualidad.mesNombre || `Mes ${mensualidad.mes}`} {mensualidad.anio}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <FaCalendarAlt className="text-slate-400 text-xs" />
                      <p className="text-slate-500 text-xs">
                        Vence: {formatFecha(mensualidad.fechaVencimiento)}
                      </p>
                    </div>
                  </div>
                  {getEstadoBadge(mensualidad)}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                  <div className="flex items-center gap-1">
                    <FaDollarSign className="text-green-600 text-xs" />
                    <span className="text-slate-800 text-sm font-semibold">
                      ${formatMonto(mensualidad.updatedTotalUSD || mensualidad.precioUSD)}
                    </span>
                  </div>
                  {mensualidad.moraAcumuladaVES > 0 && (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded">
                      Con mora
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 bg-slate-50 rounded-lg border border-slate-200">
            <FaMoneyBillWave className="text-4xl text-slate-300 mx-auto mb-2" />
            <p className="text-slate-500 text-sm">No hay información de pagos disponible</p>
          </div>
        )}

        {/* Resumen Total */}
        {mensualidades && mensualidades.length > 0 && (
          <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between">
              <p className="text-slate-600 text-sm">Total Mensualidades:</p>
              <p className="text-slate-800 font-bold">{estadoPagos.totalMensualidades}</p>
            </div>
          </div>
        )}
      </div>

      {/* Botón Ir a Pagos */}
      <div className="mt-4 px-6 pb-6">
        <button
          onClick={() => navigate('/estudiante/pagos')}
          className="w-full bg-slate-800 hover:bg-slate-700 text-white py-3 px-4 rounded-lg font-semibold transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-2 border border-slate-600"
        >
          <FaEye className="text-lg" />
          Ir a Gestión de Pagos
        </button>
      </div>

      {/* Estilo para scrollbar */}
      <style jsx>{`
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: #1e293b;
          border-radius: 10px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: #475569;
          border-radius: 10px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: #64748b;
        }
      `}</style>
    </div>
  );
};

export default PagosWidget;

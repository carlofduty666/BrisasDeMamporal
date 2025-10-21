import React from 'react';
import { FaInfoCircle, FaArrowRight } from 'react-icons/fa';

/**
 * Componente reutilizable para mostrar indicador de calificación de sección anterior
 * Usado en modales de evaluaciones y detalles de estudiante
 * 
 * @param {Object} calificacion - Datos de la calificación con histórico
 * @param {boolean} calificacion.esDeSeccionAnterior - Si la calificación es de sección anterior
 * @param {Object} calificacion.seccionHistorico - Info de sección anterior
 * @param {Object} calificacion.profesorAnterior - Info del profesor anterior
 * @param {string} calificacion.fechaTransferencia - Fecha de la transferencia
 * @param {string} className - Clases CSS adicionales
 */
export const CalificacionHistoricoIndicator = ({ calificacion, className = '' }) => {
  if (!calificacion?.esDeSeccionAnterior) {
    return null;
  }

  const fecha = new Date(calificacion.fechaTransferencia);
  const fechaFormato = fecha.toLocaleDateString('es-VE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  const nombreProfesor = `${calificacion.profesorAnterior?.nombre} ${calificacion.profesorAnterior?.apellido}`;

  return (
    <div className={`bg-blue-50 border-l-4 border-blue-400 p-3 mt-2 rounded ${className}`}>
      <div className="flex items-start gap-2">
        <FaInfoCircle className="text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1 text-sm">
          <p className="text-blue-900 font-medium">
            De sección anterior
          </p>
          <div className="text-blue-800 text-xs mt-1 space-y-1">
            <p className="flex items-center gap-2">
              <span className="font-semibold">Sección:</span>
              <span>{calificacion.seccionHistorico?.nombre}</span>
              <FaArrowRight className="text-xs" />
              <span>{calificacion.seccionActual?.nombre}</span>
            </p>
            <p>
              <span className="font-semibold">Profesor:</span> {nombreProfesor}
            </p>
            <p>
              <span className="font-semibold">Transferido el:</span> {fechaFormato}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Componente para mostrar múltiples calificaciones con indicadores
 * Separa las calificaciones actuales de las históricas
 */
export const CalificacionesConIndicadores = ({ 
  calificaciones = [], 
  rendererCalificacion 
}) => {
  const actuales = calificaciones.filter(cal => !cal.esDeSeccionAnterior);
  const historicas = calificaciones.filter(cal => cal.esDeSeccionAnterior);

  return (
    <div className="space-y-4">
      {/* Sección de calificaciones actuales */}
      {actuales.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-2">
            Calificaciones Actuales
          </h4>
          <div className="space-y-2">
            {actuales.map((cal, idx) => rendererCalificacion(cal, idx))}
          </div>
        </div>
      )}

      {/* Sección de calificaciones de sección anterior */}
      {historicas.length > 0 && (
        <div className="border-t pt-4">
          <h4 className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
            <FaInfoCircle className="text-blue-600" />
            Calificaciones de Sección Anterior
          </h4>
          <div className="space-y-3">
            {historicas.map((cal, idx) => (
              <div key={idx}>
                {rendererCalificacion(cal, idx)}
                <CalificacionHistoricoIndicator 
                  calificacion={cal}
                  className="ml-0"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sin calificaciones */}
      {calificaciones.length === 0 && (
        <p className="text-gray-500 text-sm">
          No hay calificaciones registradas
        </p>
      )}
    </div>
  );
};

export default CalificacionHistoricoIndicator;
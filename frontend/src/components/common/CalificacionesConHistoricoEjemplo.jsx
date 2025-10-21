import React, { useContext, useState } from 'react';
import { AuthContext } from '@/context/AuthContext';
import {
  useCalificacionesHistorico,
  useCalificacionesPorMateria,
  useCalificacionesPorLapso,
  useCalificacionesEstadisticas,
  useCalificacionesFiltradas
} from '@/hooks/useCalificacionesHistorico';

/**
 * Componente ejemplo que muestra todas las formas de usar los hooks
 * de calificaciones con histórico de secciones
 */
export const CalificacionesConHistoricoEjemplo = ({ 
  estudianteID, 
  annoEscolarID,
  mostrarTipoDatos = 'todos' // 'todos', 'historico', 'porMateria', 'porLapso', 'estadisticas'
}) => {
  const { user } = useContext(AuthContext);
  const [filtrosActivos, setFiltrosActivos] = useState({});

  // Hook principal - todas las calificaciones
  const {
    calificaciones: todasCalificaciones,
    loading: loadingTodas,
    error: errorTodas
  } = useCalificacionesHistorico(estudianteID, annoEscolarID, user?.token);

  // Agrupadas por materia
  const {
    calificacionesPorMateria,
    loading: loadingMateria,
    error: errorMateria
  } = useCalificacionesPorMateria(estudianteID, annoEscolarID, user?.token);

  // Agrupadas por lapso
  const {
    calificacionesPorLapso,
    loading: loadingLapso,
    error: errorLapso
  } = useCalificacionesPorLapso(estudianteID, annoEscolarID, user?.token);

  // Estadísticas
  const {
    estadisticas,
    loading: loadingStats,
    error: errorStats
  } = useCalificacionesEstadisticas(estudianteID, annoEscolarID, user?.token);

  // Filtradas
  const {
    calificacionesFiltradas,
    total: totalFiltradas,
    totalHistoricas: totalHistoricasFiltradas,
    totalActuales: totalActualesFiltradas,
    loading: loadingFiltradas,
    error: errorFiltradas
  } = useCalificacionesFiltradas(estudianteID, annoEscolarID, user?.token, filtrosActivos);

  // Componente para mostrar una calificación individual
  const CalificacionItem = ({ cal, mostrarSeccion = true }) => (
    <div className={`p-3 border-l-4 ${cal.esDeSeccionAnterior ? 'border-blue-500 bg-blue-50' : 'border-green-500 bg-green-50'}`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="font-semibold">{cal.materia.nombre}</p>
          <p className="text-sm text-gray-600">{cal.evaluacion.nombre}</p>
          {cal.evaluacion.lapso && (
            <p className="text-xs text-gray-500">Lapso: {cal.evaluacion.lapso}</p>
          )}
        </div>
        <span className="text-2xl font-bold">{cal.calificacion}</span>
      </div>

      {cal.esDeSeccionAnterior && mostrarSeccion && (
        <div className="mt-2 pt-2 border-t border-blue-200 text-sm text-blue-700">
          <p>📍 De sección anterior: <strong>{cal.seccionHistorico.nombre}</strong></p>
          {cal.profesorAnterior && (
            <p>👨‍🏫 Profesor: {cal.profesorAnterior.nombre} {cal.profesorAnterior.apellido}</p>
          )}
          {cal.fechaTransferencia && (
            <p>📅 Transferencia: {new Date(cal.fechaTransferencia).toLocaleDateString()}</p>
          )}
        </div>
      )}
    </div>
  );

  // Vista 1: Todas las calificaciones
  if (mostrarTipoDatos === 'todos' || mostrarTipoDatos === 'historico') {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Todas las Calificaciones</h2>
          <div className="text-sm text-gray-600">
            Total: {todasCalificaciones.length} |
            Actuales: {todasCalificaciones.filter(c => !c.esDeSeccionAnterior).length} |
            Históricas: {todasCalificaciones.filter(c => c.esDeSeccionAnterior).length}
          </div>
        </div>

        {loadingTodas ? (
          <div className="text-center py-8 text-gray-500">Cargando calificaciones...</div>
        ) : errorTodas ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3">
            Error: {errorTodas}
          </div>
        ) : todasCalificaciones.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No hay calificaciones</div>
        ) : (
          <div className="space-y-2">
            {/* Calificaciones actuales */}
            <div>
              <h3 className="font-semibold text-green-700 mb-2">Calificaciones Actuales</h3>
              <div className="space-y-2">
                {todasCalificaciones
                  .filter(c => !c.esDeSeccionAnterior)
                  .map(cal => (
                    <CalificacionItem key={cal.id} cal={cal} />
                  ))}
              </div>
            </div>

            {/* Calificaciones históricas */}
            {todasCalificaciones.filter(c => c.esDeSeccionAnterior).length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold text-blue-700 mb-2">Calificaciones de Secciones Anteriores</h3>
                <div className="space-y-2">
                  {todasCalificaciones
                    .filter(c => c.esDeSeccionAnterior)
                    .map(cal => (
                      <CalificacionItem key={cal.id} cal={cal} />
                    ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Vista 2: Por materia
  if (mostrarTipoDatos === 'porMateria') {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Calificaciones por Materia</h2>

        {loadingMateria ? (
          <div className="text-center py-8 text-gray-500">Cargando...</div>
        ) : errorMateria ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3">
            Error: {errorMateria}
          </div>
        ) : (
          <div className="space-y-4">
            {calificacionesPorMateria.map(materia => (
              <div key={materia.id} className="border rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-3">{materia.nombre}</h3>

                {materia.actuales.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-semibold text-green-700 text-sm mb-2">Actuales ({materia.actuales.length})</h4>
                    <div className="space-y-2">
                      {materia.actuales.map(cal => (
                        <CalificacionItem key={cal.id} cal={cal} mostrarSeccion={false} />
                      ))}
                    </div>
                  </div>
                )}

                {materia.historicas.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-blue-700 text-sm mb-2">Históricas ({materia.historicas.length})</h4>
                    <div className="space-y-2">
                      {materia.historicas.map(cal => (
                        <CalificacionItem key={cal.id} cal={cal} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Vista 3: Por lapso
  if (mostrarTipoDatos === 'porLapso') {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Calificaciones por Lapso</h2>

        {loadingLapso ? (
          <div className="text-center py-8 text-gray-500">Cargando...</div>
        ) : errorLapso ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3">
            Error: {errorLapso}
          </div>
        ) : (
          <div className="space-y-4">
            {calificacionesPorLapso.map(lapsoData => (
              <div key={lapsoData.lapso} className="border rounded-lg p-4">
                <h3 className="text-lg font-bold mb-3 bg-blue-100 p-2 rounded">
                  Lapso {lapsoData.lapso}
                </h3>

                <div className="space-y-4">
                  {lapsoData.materias.map(materia => (
                    <div key={materia.materia.id} className="ml-4 border-l-2 pl-4">
                      <h4 className="font-semibold">{materia.materia.nombre}</h4>

                      {materia.actuales.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm text-green-600">Actuales:</p>
                          {materia.actuales.map(cal => (
                            <p key={cal.id} className="text-sm">
                              {cal.evaluacion.nombre}: <strong>{cal.calificacion}</strong>
                            </p>
                          ))}
                        </div>
                      )}

                      {materia.historicas.length > 0 && (
                        <div className="mt-2 p-2 bg-blue-50 rounded">
                          <p className="text-sm text-blue-600">Históricas:</p>
                          {materia.historicas.map(cal => (
                            <p key={cal.id} className="text-sm">
                              {cal.evaluacion.nombre}: <strong>{cal.calificacion}</strong>
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Vista 4: Estadísticas
  if (mostrarTipoDatos === 'estadisticas') {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Estadísticas Académicas</h2>

        {loadingStats ? (
          <div className="text-center py-8 text-gray-500">Calculando...</div>
        ) : errorStats ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3">
            Error: {errorStats}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Resumen general */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-100 p-4 rounded text-center">
                <p className="text-gray-600 text-sm">Total</p>
                <p className="text-2xl font-bold">{estadisticas.totalCalificaciones}</p>
              </div>
              <div className="bg-green-100 p-4 rounded text-center">
                <p className="text-gray-600 text-sm">Promedio Actual</p>
                <p className="text-2xl font-bold">{estadisticas.promedioActual}</p>
              </div>
              <div className="bg-yellow-100 p-4 rounded text-center">
                <p className="text-gray-600 text-sm">Promedio Histórico</p>
                <p className="text-2xl font-bold">{estadisticas.promedioHistorico}</p>
              </div>
              <div className="bg-purple-100 p-4 rounded text-center">
                <p className="text-gray-600 text-sm">Max - Min</p>
                <p className="text-xl font-bold">
                  {estadisticas.calificacionMaxima} - {estadisticas.calificacionMinima}
                </p>
              </div>
            </div>

            {/* Detalles */}
            <div className="bg-gray-100 p-4 rounded">
              <p>Calificaciones Actuales: <strong>{estadisticas.totalActuales}</strong></p>
              <p>Calificaciones Históricas: <strong>{estadisticas.totalHistoricas}</strong></p>
            </div>

            {/* Por materia */}
            <div>
              <h3 className="font-semibold mb-3">Desempeño por Materia</h3>
              <div className="space-y-2">
                {Object.entries(estadisticas.porMateria).map(([id, materia]) => (
                  <div key={id} className="flex justify-between items-center p-3 bg-white border rounded">
                    <span>{materia.nombre}</span>
                    <div className="text-right">
                      <p className="font-semibold">{materia.promedio}</p>
                      <p className="text-xs text-gray-500">{materia.total} calificaciones</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Vista 5: Filtradas
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Calificaciones Filtradas</h2>

      {/* Controles de filtro */}
      <div className="bg-gray-100 p-4 rounded space-y-2">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={filtrosActivos.historico === true}
            onChange={(e) => 
              setFiltrosActivos(prev => ({
                ...prev,
                historico: e.target.checked ? true : undefined
              }))
            }
          />
          Solo históricas
        </label>

        <label className="flex items-center gap-2">
          <input
            type="number"
            min="0"
            max="20"
            placeholder="Calificación mínima"
            value={filtrosActivos.calificacionMin || ''}
            onChange={(e) =>
              setFiltrosActivos(prev => ({
                ...prev,
                calificacionMin: e.target.value ? parseFloat(e.target.value) : undefined
              }))
            }
            className="px-2 py-1 border rounded"
          />
        </label>
      </div>

      {/* Resultados */}
      {loadingFiltradas ? (
        <div className="text-center py-8 text-gray-500">Filtrando...</div>
      ) : errorFiltradas ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3">
          Error: {errorFiltradas}
        </div>
      ) : (
        <div>
          <p className="text-sm text-gray-600 mb-3">
            Resultados: {totalFiltradas} | Actuales: {totalActualesFiltradas} | Históricas: {totalHistoricasFiltradas}
          </p>
          <div className="space-y-2">
            {calificacionesFiltradas.map(cal => (
              <CalificacionItem key={cal.id} cal={cal} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CalificacionesConHistoricoEjemplo;
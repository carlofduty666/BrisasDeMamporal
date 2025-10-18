import React, { useState, useEffect } from 'react';
import { FaTimes, FaLayerGroup, FaCheck, FaBook } from 'react-icons/fa';
import { formatearNombreGrado, formatearNombreNivel } from '../../../../utils/formatters';

const AsignarMateriaGradoSeccion = ({ 
  isOpen, 
  onClose, 
  materia, 
  grados, 
  secciones,
  annoEscolar,
  loading,
  onSubmitGrado,
  onSubmitSeccion,
  gradosYaAsignados = [],
  seccionesYaAsignadas = []
}) => {
  const [selectedGrados, setSelectedGrados] = useState([]);
  const [selectedSecciones, setSelectedSecciones] = useState([]);
  const [annoEscolarID, setAnnoEscolarID] = useState(annoEscolar?.id || '');
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';

  useEffect(() => {
    setSelectedGrados([]);
    setSelectedSecciones([]);
    setAnnoEscolarID(annoEscolar?.id || '');
  }, [annoEscolar, isOpen]);

  // Manejar tecla ESC
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleToggleGrado = (gradoID) => {
    setSelectedGrados(prev =>
      prev.includes(gradoID)
        ? prev.filter(id => id !== gradoID)
        : [...prev, gradoID]
    );
    // Resetear secciones cuando cambia la selección de grados
    setSelectedSecciones([]);
  };

  const handleToggleSeccion = (seccionID) => {
    setSelectedSecciones(prev =>
      prev.includes(seccionID)
        ? prev.filter(id => id !== seccionID)
        : [...prev, seccionID]
    );
  };

  const handleSelectAllGrados = () => {
    if (selectedGrados.length === gradosDisponibles.length) {
      setSelectedGrados([]);
      setSelectedSecciones([]);
    } else {
      setSelectedGrados(gradosDisponibles.map(g => g.id));
    }
  };

  const handleSelectAllSecciones = () => {
    if (selectedSecciones.length === seccionesParaGrados.length) {
      setSelectedSecciones([]);
    } else {
      setSelectedSecciones(seccionesParaGrados.map(s => s.id));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (selectedGrados.length === 0 && selectedSecciones.length === 0) return;

    // Enviar múltiples asignaciones de grados
    selectedGrados.forEach(gradoID => {
      onSubmitGrado({
        gradoID,
        annoEscolarID
      });
    });

    // Enviar múltiples asignaciones de secciones
    selectedSecciones.forEach(seccionID => {
      onSubmitSeccion({
        seccionID,
        annoEscolarID
      });
    });

    setSelectedGrados([]);
    setSelectedSecciones([]);
  };

  // Filtrar grados ya asignados
  const gradosDisponibles = grados.filter(
    g => !gradosYaAsignados.includes(g.id)
  );

  // Obtener secciones de los grados seleccionados
  const seccionesParaGrados = selectedGrados.length > 0
    ? secciones.filter(s =>
        selectedGrados.includes(s.gradoID) &&
        !seccionesYaAsignadas.includes(s.id)
      )
    : [];

  // Secciones disponibles (no asignadas)
  const seccionesDisponibles = secciones.filter(
    s => !seccionesYaAsignadas.includes(s.id)
  );

  // Obtener información de grados y secciones ya asignados
  const gradosAsignados = gradosYaAsignados.map(id => grados.find(g => g.id === id)).filter(Boolean);
  const seccionesAsignadas = seccionesYaAsignadas.map(id => secciones.find(s => s.id === id)).filter(Boolean);

  // Agrupar grados disponibles por nivel
  const gradosPorNivel = gradosDisponibles.reduce((acc, grado) => {
    const nivel = grado.Niveles?.nombre_nivel || 'Sin Nivel';
    if (!acc[nivel]) acc[nivel] = [];
    acc[nivel].push(grado);
    return acc;
  }, {});

  // Agrupar grados asignados por nivel
  const gradosAsignadosPorNivel = gradosAsignados.reduce((acc, grado) => {
    const nivel = grado.Niveles?.nombre_nivel || 'Sin Nivel';
    if (!acc[nivel]) acc[nivel] = [];
    acc[nivel].push(grado);
    return acc;
  }, {});

  // Agrupar secciones por nivel y grado
  const seccionesPorNivelGrado = seccionesParaGrados.reduce((acc, seccion) => {
    const grado = grados.find(g => g.id === seccion.gradoID);
    const nivel = grado?.Niveles?.nombre_nivel || 'Sin Nivel';
    const nombreGrado = grado?.nombre_grado || 'Grado desconocido';
    
    const key = `${nivel}-${nombreGrado}`;
    if (!acc[key]) acc[key] = { nivel, grado: nombreGrado, secciones: [] };
    acc[key].secciones.push(seccion);
    return acc;
  }, {});

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 animate-fade-in cursor-pointer"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4 animate-fade-in">
        <div
          className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden border-2 border-orange-200 animate-slide-up flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-600 to-orange-700 px-8 py-6 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <FaLayerGroup className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white">
                Asignar a Grado y Sección
              </h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1 hover:bg-white/20 rounded-lg transition-colors"
              aria-label="Cerrar"
            >
              <FaTimes className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Content - Scrollable */}
          <div className="flex-1 overflow-y-auto p-8">
            <p className="text-sm text-gray-600 mb-6">
              Asignando: <span className="font-semibold text-orange-700">{materia?.asignatura}</span>
            </p>

            {/* Asignaciones ya hechas */}
            {(gradosAsignados.length > 0 || seccionesAsignadas.length > 0) && (
              <div className="mb-8 space-y-4">
                {/* Grados asignados - Agrupados por nivel */}
                {gradosAsignados.length > 0 && (
                  <div className="p-4 bg-orange-50 rounded-lg border-2 border-orange-200">
                    <h4 className="text-sm font-semibold text-orange-800 mb-4 flex items-center gap-2">
                      <FaLayerGroup className="text-orange-600" />
                      Grados Asignados
                    </h4>
                    <div className="space-y-4">
                      {Object.entries(gradosAsignadosPorNivel).map(([nivel, gradosNivel]) => (
                        <div key={nivel} className="pl-4 border-l-4 border-orange-400">
                          <p className="text-xs font-bold text-orange-700 mb-2">{formatearNombreNivel(nivel)}</p>
                          <div className="space-y-1">
                            {gradosNivel.map(grado => (
                              <div key={grado.id} className="flex items-center gap-2 text-sm text-orange-700">
                                <FaCheck className="w-3 h-3 text-orange-600" />
                                <span>{formatearNombreGrado(grado.nombre_grado)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Secciones asignadas - Agrupadas por nivel/grado */}
                {seccionesAsignadas.length > 0 && (
                  <div className="p-4 bg-green-50 rounded-lg border-2 border-green-200">
                    <h4 className="text-sm font-semibold text-green-800 mb-4 flex items-center gap-2">
                      <FaBook className="text-green-600" />
                      Secciones Asignadas
                    </h4>
                    <div className="space-y-4">
                      {seccionesAsignadas.reduce((acc, seccion) => {
                        const grado = grados.find(g => g.id === seccion.gradoID);
                        const nivel = grado?.Niveles?.nombre_nivel || 'Sin Nivel';
                        const key = `${nivel}-${grado?.nombre_grado}`;
                        if (!acc[key]) acc[key] = { nivel, grado: grado?.nombre_grado, secciones: [] };
                        acc[key].secciones.push(seccion);
                        return acc;
                      }, {})}
                      {Object.entries(seccionesAsignadas.reduce((acc, seccion) => {
                        const grado = grados.find(g => g.id === seccion.gradoID);
                        const nivel = grado?.Niveles?.nombre_nivel || 'Sin Nivel';
                        const key = `${nivel}-${grado?.nombre_grado}`;
                        if (!acc[key]) acc[key] = { nivel, grado: grado?.nombre_grado, secciones: [] };
                        acc[key].secciones.push(seccion);
                        return acc;
                      }, {})).map(([key, { nivel, grado, secciones }]) => (
                        <div key={key} className="pl-4 border-l-4 border-green-400">
                          <p className="text-xs font-bold text-green-700 mb-2">
                            {formatearNombreNivel(nivel)} - {formatearNombreGrado(grado)}
                          </p>
                          <div className="space-y-1">
                            {secciones.map(seccion => (
                              <div key={seccion.id} className="flex items-center gap-2 text-sm text-green-700">
                                <FaCheck className="w-3 h-3 text-green-600" />
                                <span>{seccion.nombre_seccion}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Selección de Grados */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <FaLayerGroup className="text-orange-600" />
                    Seleccionar Grados <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleSelectAllGrados}
                    className="text-xs px-3 py-1 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded font-medium transition-colors"
                  >
                    {selectedGrados.length === gradosDisponibles.length ? 'Desmarcar Todo' : 'Marcar Todo'}
                  </button>
                </div>

                {/* Checkboxes de Grados - Agrupados por Nivel */}
                <div className="p-4 border-2 border-orange-200 rounded-lg bg-orange-50 space-y-4">
                  {gradosDisponibles.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">
                      Todos los grados ya han sido asignados
                    </p>
                  ) : (
                    Object.entries(gradosPorNivel).map(([nivel, gradosNivel]) => (
                      <div key={nivel} className="space-y-2">
                        <p className="text-xs font-bold text-orange-700 px-2">{formatearNombreNivel(nivel)}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-2 border-l-4 border-orange-300">
                          {gradosNivel.map((grado) => (
                            <label key={grado.id} className="flex items-center gap-3 p-2 hover:bg-orange-100 rounded cursor-pointer transition-colors">
                              <input
                                type="checkbox"
                                checked={selectedGrados.includes(grado.id)}
                                onChange={() => handleToggleGrado(grado.id)}
                                className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-2 focus:ring-orange-500"
                              />
                              <span className="text-sm text-gray-700">
                                {formatearNombreGrado(grado.nombre_grado)}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Selección de Secciones - Solo si hay grados seleccionados */}
              {selectedGrados.length > 0 && (
                <div className="space-y-3 p-4 bg-green-50 rounded-lg border-2 border-green-200">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <FaBook className="text-green-600" />
                      Seleccionar Secciones <span className="text-red-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleSelectAllSecciones}
                      className="text-xs px-3 py-1 bg-green-100 hover:bg-green-200 text-green-700 rounded font-medium transition-colors"
                    >
                      {selectedSecciones.length === seccionesParaGrados.length ? 'Desmarcar Todo' : 'Marcar Todo'}
                    </button>
                  </div>

                  {/* Checkboxes de Secciones - Agrupadas por Nivel y Grado */}
                  <div className="p-4 border-2 border-green-200 rounded-lg bg-white space-y-4">
                    {seccionesParaGrados.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-4">
                        No hay secciones disponibles para los grados seleccionados
                      </p>
                    ) : (
                      Object.entries(seccionesPorNivelGrado).map(([key, { nivel, grado, secciones }]) => (
                        <div key={key} className="space-y-2">
                          <p className="text-xs font-bold text-green-700 px-2">
                            {formatearNombreNivel(nivel)} - {formatearNombreGrado(grado)}
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-2 border-l-4 border-green-300">
                            {secciones.map((seccion) => (
                              <label key={seccion.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer transition-colors">
                                <input
                                  type="checkbox"
                                  checked={selectedSecciones.includes(seccion.id)}
                                  onChange={() => handleToggleSeccion(seccion.id)}
                                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-2 focus:ring-green-500"
                                />
                                <span className="text-sm text-gray-700">
                                  {seccion.nombre_seccion}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-3 pt-4 border-t-2 border-gray-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-all duration-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading || (selectedGrados.length === 0 && selectedSecciones.length === 0)}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-600 to-orange-700 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Asignando...' : `Asignar (${selectedGrados.length + selectedSecciones.length})`}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slide-up {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }

        .animate-slide-up {
          animation: slide-up 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      `}</style>
    </>
  );
};

export default AsignarMateriaGradoSeccion;
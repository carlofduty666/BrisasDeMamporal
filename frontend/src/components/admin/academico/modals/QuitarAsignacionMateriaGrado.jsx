import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  FaTimes,
  FaLayerGroup,
  FaTrash,
  FaExclamationTriangle,
  FaCheckCircle,
  FaInfoCircle,
  FaSpinner,
  FaArrowLeft
} from 'react-icons/fa';
import { FaChalkboardUser } from "react-icons/fa6";
import axios from 'axios';
import { formatearNombreGrado, formatearNombreNivel } from '../../../../utils/formatters';

/**
 * Modal para quitar asignaciones de materia a grados o profesores
 * Valida que no haya evaluaciones registradas
 */
const QuitarAsignacionMateriaGrado = ({
  isOpen,
  onClose,
  materia,
  grados,
  gradosAsignados = [],
  annoEscolar,
  onRefresh = null
}) => {
  // Estado para seleccionar tipo de asignación
  const [tipoAsignacion, setTipoAsignacion] = useState(null); // null, 'grado', 'profesor'
  const [selectedGrados, setSelectedGrados] = useState([]);
  const [selectedProfesores, setSelectedProfesores] = useState([]);
  const [profesores, setProfesores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cargandoProfesores, setCargandoProfesores] = useState(false);
  const [message, setMessage] = useState({ type: null, text: null });
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';

  // ✅ Memoizar ANTES del early return (Rules of Hooks)
  const gradosActuales = useMemo(() => 
    gradosAsignados
      .map(gradoID => grados.find(g => g.id === gradoID))
      .filter(Boolean),
    [gradosAsignados, grados]
  );

  const gradosPorNivel = useMemo(() => {
    const acc = {};
    gradosActuales.forEach(grado => {
      const nivel = grado.Niveles?.nombre_nivel || 'Sin Nivel';
      if (!acc[nivel]) acc[nivel] = [];
      acc[nivel].push(grado);
    });
    return acc;
  }, [gradosActuales]);

  const handleToggleGrado = useCallback((gradoID) => {
    setSelectedGrados(prev =>
      prev.includes(gradoID)
        ? prev.filter(id => id !== gradoID)
        : [...prev, gradoID]
    );
    setMessage({ type: null, text: null });
  }, []);

  const handleSelectAllGrados = useCallback(() => {
    setSelectedGrados(prev =>
      prev.length === gradosActuales.length ? [] : gradosActuales.map(g => g.id)
    );
  }, [gradosActuales]);

  const handleToggleProfesor = useCallback((profesorID) => {
    setSelectedProfesores(prev =>
      prev.includes(profesorID)
        ? prev.filter(id => id !== profesorID)
        : [...prev, profesorID]
    );
    setMessage({ type: null, text: null });
  }, []);

  const handleSelectAllProfesores = useCallback(() => {
    setSelectedProfesores(prev =>
      prev.length === profesores.length ? [] : profesores.map(p => p.id)
    );
  }, [profesores]);

  // Limpiar estados al abrir/cerrar
  useEffect(() => {
    if (isOpen) {
      setSelectedGrados([]);
      setSelectedProfesores([]);
      setTipoAsignacion(null);
      setMessage({ type: null, text: null });
      setProfesores([]);
    }
  }, [isOpen]);

  // Manejar tecla ESC
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Cargar profesores cuando se selecciona tipo "profesor"
  useEffect(() => {
    if (tipoAsignacion === 'profesor' && materia?.id && annoEscolar?.id) {
      cargarProfesores();
    }
  }, [tipoAsignacion]);

  const cargarProfesores = async () => {
    try {
      setCargandoProfesores(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/materias/${materia.id}/profesores?annoEscolarID=${annoEscolar.id}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      setProfesores(response.data || []);
      if (!response.data || response.data.length === 0) {
        setMessage({
          type: 'info',
          text: 'No hay profesores asignados a esta materia'
        });
      }
    } catch (error) {
      console.error('Error cargando profesores:', error);
      setMessage({
        type: 'error',
        text: 'Error al cargar los profesores'
      });
    } finally {
      setCargandoProfesores(false);
    }
  };

  if (!isOpen || !materia) return null;

  // Pantalla de selección de tipo
  if (!tipoAsignacion) {
    return (
      <>
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/40 z-40 cursor-pointer"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full border-2 border-blue-200 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <FaTrash className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    Quitar Asignación
                  </h3>
                  <p className="text-xs text-blue-100 mt-1">
                    {materia?.asignatura}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1 hover:bg-white/20 rounded-lg transition-colors duration-150"
                aria-label="Cerrar"
              >
                <FaTimes className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Content */}
            <div className="p-8 space-y-4">
              <div>
                <p className="text-sm text-gray-700 mb-6 font-medium">
                  ¿Qué deseas quitar de esta materia?
                </p>
              </div>

              {/* Opción: Quitar de Grado */}
              <button
                onClick={() => setTipoAsignacion('grado')}
                className="w-full p-6 border-2 border-orange-200 rounded-lg hover:bg-orange-50 transition-colors duration-150 text-left group"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors duration-150">
                    <FaLayerGroup className="w-5 h-5 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800 mb-1">
                      Quitar de un Grado
                    </h4>
                    <p className="text-xs text-gray-600">
                      Eliminar la materia de grados específicos
                    </p>
                  </div>
                  <FaArrowLeft className="w-4 h-4 text-gray-400 mt-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              {/* Opción: Quitar de Profesor */}
              <button
                onClick={() => setTipoAsignacion('profesor')}
                className="w-full p-6 border-2 border-purple-200 rounded-lg hover:bg-purple-50 transition-colors duration-150 text-left group"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors duration-150">
                    <FaChalkboardUser className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800 mb-1">
                      Quitar de un Profesor
                    </h4>
                    <p className="text-xs text-gray-600">
                      Eliminar la materia de profesores específicos
                    </p>
                  </div>
                  <FaArrowLeft className="w-4 h-4 text-gray-400 mt-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              {/* Botón Cancelar */}
              <button
                onClick={onClose}
                className="w-full mt-6 px-4 py-2 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors duration-150"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Pantalla de selección de grados o profesores
  const handleSubmit = async (e) => {
    e.preventDefault();

    const itemsSeleccionados = tipoAsignacion === 'grado' ? selectedGrados : selectedProfesores;

    if (itemsSeleccionados.length === 0) {
      setMessage({
        type: 'warning',
        text: `Selecciona al menos un ${tipoAsignacion === 'grado' ? 'grado' : 'profesor'}`
      });
      return;
    }

    try {
      setLoading(true);
      setMessage({ type: null, text: null });

      let successCount = 0;
      let failureCount = 0;
      let failureDetails = [];

      if (tipoAsignacion === 'grado') {
        // Quitar materia de grados
        for (const gradoID of selectedGrados) {
          try {
            const response = await axios.delete(
              `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/materias/grado/${gradoID}/${materia.id}/${annoEscolar.id}`,
              {
                headers: { 'Authorization': `Bearer ${token}` }
              }
            );

            if (response.data?.deleted || response.status === 200) {
              successCount++;
            }
          } catch (error) {
            failureCount++;
            const gradoInfo = grados.find(g => g.id === gradoID);
            const gradoNombre = gradoInfo ? formatearNombreGrado(gradoInfo.nombre_grado) : `Grado ${gradoID}`;

            if (error.response?.status === 409) {
              failureDetails.push({
                item: gradoNombre,
                reason: error.response.data?.message || 'No se puede eliminar',
                evaluaciones: error.response.data?.evaluacionesCount || 0
              });
            } else {
              failureDetails.push({
                item: gradoNombre,
                reason: error.response?.data?.message || 'Error desconocido'
              });
            }
          }
        }
      } else {
        // Quitar materia de profesores
        for (const profesorID of selectedProfesores) {
          const profesor = profesores.find(p => p.id === profesorID);
          const gradosDelProfesor = profesor?.profesor_materia_grados || [];
          let profesorSuccessCount = 0;

          // Para cada grado donde enseña, intentar eliminar
          for (const pmg of gradosDelProfesor) {
            try {
              const response = await axios.delete(
                `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/materias/profesor/${profesorID}/${materia.id}/${pmg.gradoID}/${annoEscolar.id}`,
                {
                  headers: { 'Authorization': `Bearer ${token}` }
                }
              );

              if (response.data?.deleted || response.status === 200) {
                profesorSuccessCount++;
                successCount++;
              }
            } catch (error) {
              const nombreProfesor = profesor ? `${profesor.nombre} ${profesor.apellido || ''}` : `Profesor ${profesorID}`;
              if (error.response?.status === 409) {
                failureDetails.push({
                  item: `${nombreProfesor} - ${pmg.gradoNombre || `Grado ${pmg.gradoID}`}`,
                  reason: error.response.data?.message || 'No se puede eliminar',
                  evaluaciones: error.response.data?.evaluacionesCount || 0
                });
              } else {
                failureCount++;
                failureDetails.push({
                  item: `${nombreProfesor} - ${pmg.gradoNombre || `Grado ${pmg.gradoID}`}`,
                  reason: error.response?.data?.message || 'Error desconocido'
                });
              }
            }
          }
        }
      }

      setLoading(false);

      // Mostrar resultado
      if (successCount > 0) {
        setMessage({
          type: 'success',
          text: `✓ ${successCount} asignación(es) eliminada(s) correctamente`
        });

        // Limpiar selección
        setSelectedGrados([]);
        setSelectedProfesores([]);

        // Llamar refresh después de 1.5s
        if (onRefresh) {
          setTimeout(() => {
            onRefresh();
            onClose();
          }, 1500);
        }
      }

      if (failureCount > 0 || failureDetails.length > 0) {
        setMessage({
          type: failureDetails.length > 0 ? 'error' : 'warning',
          text: `⚠ ${failureDetails.length > 0 ? failureDetails.length : failureCount} asignación(es) no se pudo(eron) eliminar`,
          details: failureDetails
        });
      }
    } catch (err) {
      setLoading(false);
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Error al quitar asignaciones'
      });
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40 cursor-pointer"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div
          className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden border-2 border-red-200 flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-red-600 to-red-700 px-8 py-6 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setTipoAsignacion(null);
                  setSelectedGrados([]);
                  setSelectedProfesores([]);
                  setMessage({ type: null, text: null });
                }}
                className="p-1 hover:bg-white/20 rounded-lg transition-colors duration-150"
                title="Volver"
              >
                <FaArrowLeft className="w-4 h-4 text-white" />
              </button>
              <div className="p-2 bg-white/20 rounded-lg">
                <FaTrash className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  Quitar {tipoAsignacion === 'grado' ? 'de Grado' : 'de Profesor'}
                </h3>
                <p className="text-xs text-red-100 mt-1">
                  {materia?.asignatura}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1 hover:bg-white/20 rounded-lg transition-colors duration-150"
              aria-label="Cerrar"
            >
              <FaTimes className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Content - Scrollable */}
          <div className="flex-1 overflow-y-auto p-8">
            {/* Mensaje de éxito */}
            {message.type === 'success' && (
              <div className="mb-6 p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <FaCheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-green-800">{message.text}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Mensaje de error */}
            {message.type === 'error' && (
              <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <FaExclamationTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-red-800">{message.text}</p>
                    {message.details && message.details.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {message.details.map((detail, idx) => (
                          <div key={idx} className="text-xs bg-white rounded p-2 border border-red-100">
                            <p className="font-semibold text-red-700">{detail.item}</p>
                            <p className="text-red-600">{detail.reason}</p>
                            {detail.evaluaciones > 0 && (
                              <p className="text-red-600 mt-1">
                                📊 {detail.evaluaciones} evaluación(es) registrada(s)
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Mensaje de advertencia o info */}
            {(message.type === 'warning' || message.type === 'info') && (
              <div className={`mb-6 p-4 border-2 rounded-lg ${
                message.type === 'warning'
                  ? 'bg-yellow-50 border-yellow-200'
                  : 'bg-blue-50 border-blue-200'
              }`}>
                <div className="flex items-start gap-3">
                  <FaInfoCircle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                    message.type === 'warning' ? 'text-yellow-600' : 'text-blue-600'
                  }`} />
                  <p className={`text-sm ${
                    message.type === 'warning' ? 'text-yellow-800' : 'text-blue-800'
                  }`}>
                    {message.text}
                  </p>
                </div>
              </div>
            )}

            {/* Info */}
            <div className="mb-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <FaInfoCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-semibold mb-1">Información importante:</p>
                  <p className="text-xs">
                    ⚠️ Si hay evaluaciones registradas, no podrá ser eliminada. 
                    Se recomienda revisar las evaluaciones antes de quitar la asignación.
                  </p>
                </div>
              </div>
            </div>

            {/* Contenido según tipo */}
            {cargandoProfesores ? (
              <div className="flex items-center justify-center py-12">
                <FaSpinner className="w-8 h-8 text-purple-600 animate-spin mr-3" />
                <p className="text-gray-600">Cargando profesores...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {tipoAsignacion === 'grado' ? (
                  // Selección de Grados
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <FaLayerGroup className="text-red-600" />
                        Grados a quitar <span className="text-red-500">*</span>
                      </label>
                      {gradosActuales.length > 1 && (
                        <button
                          type="button"
                          onClick={handleSelectAllGrados}
                          className="text-xs px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded font-medium transition-colors duration-150"
                        >
                          {selectedGrados.length === gradosActuales.length ? 'Desmarcar Todo' : 'Marcar Todo'}
                        </button>
                      )}
                    </div>

                    {/* Cards de Grados */}
                    <div className="space-y-3">
                      {gradosActuales.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-6 italic">
                          No hay grados asignados a esta materia
                        </p>
                      ) : (
                        Object.entries(gradosPorNivel).map(([nivel, gradosNivel]) => (
                          <div key={nivel} className="space-y-2">
                            <p className="text-xs font-bold text-gray-700 px-2">
                              {formatearNombreNivel(nivel)}
                            </p>
                            <div className="space-y-2 pl-2 border-l-4 border-red-300">
                              {gradosNivel.map((grado) => (
                                <label
                                  key={grado.id}
                                  className="flex items-center gap-3 p-3 bg-red-50 hover:bg-red-100 rounded-lg cursor-pointer border border-red-100 hover:border-red-300 transition-colors duration-150"
                                >
                                  <input
                                    type="checkbox"
                                    checked={selectedGrados.includes(grado.id)}
                                    onChange={() => handleToggleGrado(grado.id)}
                                    className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-2 focus:ring-red-500"
                                  />
                                  <span className="flex-1 text-sm font-medium text-gray-700">
                                    {formatearNombreGrado(grado.nombre_grado)}
                                  </span>
                                  <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                                    Eliminar
                                  </span>
                                </label>
                              ))}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ) : (
                  // Selección de Profesores
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <FaChalkboardUser className="text-purple-600" />
                        Profesores a quitar <span className="text-red-500">*</span>
                      </label>
                      {profesores.length > 1 && (
                        <button
                          type="button"
                          onClick={handleSelectAllProfesores}
                          className="text-xs px-3 py-1 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded font-medium transition-colors duration-150"
                        >
                          {selectedProfesores.length === profesores.length ? 'Desmarcar Todo' : 'Marcar Todo'}
                        </button>
                      )}
                    </div>

                    {/* Cards de Profesores */}
                    <div className="space-y-2">
                      {profesores.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-6 italic">
                          No hay profesores asignados a esta materia
                        </p>
                      ) : (
                        profesores.map((profesor) => (
                          <label
                            key={profesor.id}
                            className="flex items-center gap-3 p-3 bg-purple-50 hover:bg-purple-100 rounded-lg cursor-pointer border border-purple-100 hover:border-purple-300 transition-colors duration-150"
                          >
                            <input
                              type="checkbox"
                              checked={selectedProfesores.includes(profesor.id)}
                              onChange={() => handleToggleProfesor(profesor.id)}
                              className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
                            />
                            <div className="flex-1">
                              <span className="text-sm font-medium text-gray-700">
                                {profesor.nombre || profesor.Personas?.nombre || `Profesor ${profesor.id}`}
                              </span>
                              {profesor.profesor_materia_grados && profesor.profesor_materia_grados.length > 0 && (
                                <p className="text-xs text-gray-500">
                                  {profesor.profesor_materia_grados.length} grado(s)
                                </p>
                              )}
                            </div>
                            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                              Eliminar
                            </span>
                          </label>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* Buttons */}
                <div className="flex gap-3 pt-4 border-t-2 border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setTipoAsignacion(null);
                      setSelectedGrados([]);
                      setSelectedProfesores([]);
                      setMessage({ type: null, text: null });
                    }}
                    disabled={loading}
                    className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Volver
                  </button>
                  <button
                    type="submit"
                    disabled={loading || (tipoAsignacion === 'grado' ? selectedGrados.length === 0 : selectedProfesores.length === 0)}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <FaSpinner className="w-4 h-4 animate-spin" />
                        Eliminando...
                      </>
                    ) : (
                      <>
                        <FaTrash className="w-4 h-4" />
                        Quitar {tipoAsignacion === 'grado' ? selectedGrados.length > 0 ? `(${selectedGrados.length})` : '' : selectedProfesores.length > 0 ? `(${selectedProfesores.length})` : ''}
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default QuitarAsignacionMateriaGrado;
import React, { useState, useEffect } from 'react';
import { FaTimes, FaChalkboardTeacher, FaCheck, FaLayerGroup, FaIdCard, FaBook, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import axios from 'axios';
import { formatearNombreGrado, formatearNombreNivel, formatearCedula } from '../../../../utils/formatters';
import { getMateriaStyles } from '../../../../utils/materiaStyles';

/**
 * Modal para asignar profesor a grado y sección
 * Validación: El profesor debe tener la materia asignada y la materia debe estar en el grado
 * Permite múltiples asignaciones de profesor x grado x sección x materia
 * 
 * Props adicionales:
 * - preselectedGradoID: (opcional) ID del grado a preseleccionar y expandir automáticamente
 * - showMateria: (opcional, default true) Mostrar información de la materia en el header
 */
const AsignarProfesorGrado = ({ 
  isOpen, 
  onClose, 
  materia, 
  grados,
  profesores,
  secciones = [],
  annoEscolar,
  loading,
  onSubmit,
  profesoresYaAsignados = [],
  preselectedGradoID = null,
  showMateria = true
}) => {
  const [selectedProfesores, setSelectedProfesores] = useState([]);
  const [selectedGradosSecciones, setSelectedGradosSecciones] = useState({}); // { gradoID: [seccionIDs] }
  const [expandedGrados, setExpandedGrados] = useState({}); // { gradoID: true/false }
  const [annoEscolarID, setAnnoEscolarID] = useState(annoEscolar?.id || '');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [materiasDelGrado, setMateriasDelGrado] = useState([]);
  const [selectedMateria, setSelectedMateria] = useState(null);
  const [loadingMaterias, setLoadingMaterias] = useState(false);
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';

  // Cargar materias del grado cuando se abre el modal o cambia el grado preseleccionado
  useEffect(() => {
    if (isOpen && preselectedGradoID && annoEscolar?.id) {
      fetchMateriasDelGrado(preselectedGradoID);
    }
  }, [isOpen, preselectedGradoID, annoEscolar?.id]);

  const fetchMateriasDelGrado = async (gradoID) => {
    try {
      setLoadingMaterias(true);
      const config = {
        headers: { 'Authorization': `Bearer ${token}` }
      };
      
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/grado/${gradoID}/materias`,
        config
      );
      
      setMateriasDelGrado(response.data || []);
    } catch (error) {
      console.error('Error cargando materias del grado:', error);
      setMateriasDelGrado([]);
    } finally {
      setLoadingMaterias(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setSelectedProfesores([]);
      setSelectedGradosSecciones({});
      setSelectedMateria(null);
      
      // Preseleccionar grado si se proporciona
      if (preselectedGradoID) {
        setExpandedGrados({ [preselectedGradoID]: true });
      } else {
        setExpandedGrados({});
      }
      
      setAnnoEscolarID(annoEscolar?.id || '');
      setSuccessMessage('');
      setErrorMessage('');
      setIsSubmitting(false);
    }
  }, [annoEscolar, isOpen, preselectedGradoID]);

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

  const handleToggleProfesor = (profesorID) => {
    setSelectedProfesores(prev =>
      prev.includes(profesorID)
        ? prev.filter(id => id !== profesorID)
        : [...prev, profesorID]
    );
  };

  const handleToggleExpanded = (gradoID) => {
    setExpandedGrados(prev => ({
      ...prev,
      [gradoID]: !prev[gradoID]
    }));
  };

  const handleToggleSeccion = (gradoID, seccionID) => {
    setSelectedGradosSecciones(prev => {
      const currentSecciones = prev[gradoID] || [];
      const newSecciones = currentSecciones.includes(seccionID)
        ? currentSecciones.filter(id => id !== seccionID)
        : [...currentSecciones, seccionID];
      
      if (newSecciones.length === 0) {
        const updated = { ...prev };
        delete updated[gradoID];
        return updated;
      }
      
      return {
        ...prev,
        [gradoID]: newSecciones
      };
    });
  };

  const handleSelectAllSecciones = (gradoID, seccionesGrado) => {
    setSelectedGradosSecciones(prev => {
      const currentSecciones = prev[gradoID] || [];
      const allSeccionesSelected = currentSecciones.length === seccionesGrado.length;
      
      if (allSeccionesSelected) {
        const updated = { ...prev };
        delete updated[gradoID];
        return updated;
      }
      
      return {
        ...prev,
        [gradoID]: seccionesGrado.map(s => s.id)
      };
    });
  };

  const handleSelectAllProfesores = () => {
    if (selectedProfesores.length === profesoresDisponibles.length) {
      setSelectedProfesores([]);
    } else {
      setSelectedProfesores(profesoresDisponibles.map(p => p.id));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedMateria) {
      setErrorMessage('Debe seleccionar una materia');
      return;
    }

    const totalSelecciones = Object.values(selectedGradosSecciones).reduce((sum, secs) => sum + secs.length, 0);
    if (selectedProfesores.length === 0 || totalSelecciones === 0) return;

    try {
      setIsSubmitting(true);
      setErrorMessage('');
      
      // Enviar múltiples asignaciones: profesor x grado x sección x materia
      let allSuccess = true;
      let totalAsignaciones = 0;
      let failureMessage = '';
      
      for (const profesorID of selectedProfesores) {
        for (const [gradoID, seccionIDs] of Object.entries(selectedGradosSecciones)) {
          for (const seccionID of seccionIDs) {
            try {
              await onSubmit({
                profesorID,
                gradoID: parseInt(gradoID),
                materiaID: selectedMateria.id,
                seccionID,
                annoEscolarID
              });
              totalAsignaciones++;
            } catch (err) {
              allSuccess = false;
              failureMessage = err.response?.data?.message || err.message;
              console.error('Error en asignación:', err);
            }
          }
        }
      }

      if (allSuccess && totalAsignaciones > 0) {
        setSuccessMessage(`✓ ${totalAsignaciones} asignación(es) de profesor a grado completada(s)`);
        setSelectedProfesores([]);
        setSelectedGradosSecciones({});
        setExpandedGrados({});
        setSelectedMateria(null);
      } else if (totalAsignaciones > 0) {
        setErrorMessage(`Algunas asignaciones no pudieron completarse. ${failureMessage ? `Detalle: ${failureMessage}` : ''}`);
      }
      
      setIsSubmitting(false);
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Error al asignar profesor');
      setIsSubmitting(false);
    }
  };

  // Filtrar profesores ya asignados a este grado con esta materia
  const profesoresDisponibles = profesores.filter(p => {
    const key = `${p.id}`;
    return !profesoresYaAsignados.some(pa => 
      pa.profesorID === p.id
    );
  });

  // Filtrar grados disponibles que tengan esta materia asignada
  const gradosDisponibles = grados || [];

  // Profesores ya asignados 
  const profesoresAsignados = profesoresYaAsignados
    .map(pa => profesores.find(p => p.id === pa.profesorID))
    .filter(Boolean)
    .filter((p, idx, arr) => arr.findIndex(prof => prof.id === p.id) === idx); // Eliminar duplicados

  // Agrupar grados disponibles por nivel
  const gradosPorNivel = gradosDisponibles.reduce((acc, grado) => {
    const nivel = grado.Niveles?.nombre_nivel || 'Sin Nivel';
    if (!acc[nivel]) acc[nivel] = [];
    acc[nivel].push(grado);
    return acc;
  }, {});

  // Obtener secciones de un grado específico
  const getSeccionesDelGrado = (gradoID) => {
    return secciones.filter(seccion => seccion.gradoID === gradoID);
  };

  // Calcular total de selecciones
  const totalSelecciones = Object.values(selectedGradosSecciones).reduce((sum, secs) => sum + secs.length, 0);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40 cursor-pointer fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4 fade-in">
        <div
          className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden border-2 border-purple-200 slide-up flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-8 py-6 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <FaChalkboardTeacher className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white">
                Asignar Profesor a Grado
              </h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1 hover:bg-white/20 rounded-lg"
              aria-label="Cerrar"
            >
              <FaTimes className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Content - Scrollable */}
          <div className="flex-1 overflow-y-auto p-8 relative">
            {/* Notificación de Éxito */}
            {successMessage && (
              <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
                <div className="pointer-events-auto bg-white rounded-2xl shadow-2xl border-2 border-green-200 p-8 max-w-md mx-4 slide-up">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="p-3 bg-green-100 rounded-full">
                      <FaCheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800">{successMessage}</h3>
                    <button
                      onClick={() => {
                        setSuccessMessage('');
                        onClose();
                      }}
                      className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold rounded-lg hover:shadow-lg"
                    >
                      Cerrar
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Notificación de Error */}
            {errorMessage && (
              <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
                <div className="pointer-events-auto bg-white rounded-2xl shadow-2xl border-2 border-red-200 p-6 max-w-md mx-4 slide-up">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-red-100 rounded-full flex-shrink-0">
                      <FaExclamationCircle className="w-6 h-6 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800">Error</h3>
                      <p className="text-sm text-gray-600 mt-1">{errorMessage}</p>
                    </div>
                    <button
                      onClick={() => setErrorMessage('')}
                      className="text-gray-400 hover:text-gray-600 flex-shrink-0"
                    >
                      <FaTimes />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Profesores ya asignados */}
            {profesoresAsignados.length > 0 && (
              <div className="mb-8 p-4 bg-green-50 rounded-lg border-2 border-green-200">
                <h4 className="text-sm font-semibold text-green-800 mb-3 flex items-center gap-2">
                  <FaCheck className="text-green-600" />
                  Profesores Ya Asignados al Grado
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {profesoresAsignados.map(profesor => (
                    <div key={profesor.id} className="flex items-start gap-2 text-sm text-green-700 p-2 bg-white rounded border border-green-100">
                      <FaCheck className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium">{profesor.nombre} {profesor.apellido}</p>
                        {profesor.cedula && (
                          <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                            <FaIdCard className="w-3 h-3" />
                            {formatearCedula(profesor.cedula)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Selección de Profesores */}
              <div className="space-y-3 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <FaChalkboardTeacher className="text-blue-600" />
                    Seleccionar Profesores <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleSelectAllProfesores}
                    className="text-xs px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded font-medium"
                  >
                    {selectedProfesores.length === profesoresDisponibles.length ? 'Desmarcar Todo' : 'Marcar Todo'}
                  </button>
                </div>

                <div className="p-4 border-2 border-blue-200 rounded-lg bg-blue-50 space-y-3">
                  {profesoresDisponibles.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No hay profesores disponibles
                    </p>
                  ) : (
                    profesoresDisponibles.map((profesor) => (
                      <label 
                        key={profesor.id} 
                        className="flex items-start gap-3 p-4 bg-white hover:bg-blue-50 rounded-lg cursor-pointer border border-blue-100 hover:border-blue-300"
                      >
                        <input
                          type="checkbox"
                          checked={selectedProfesores.includes(profesor.id)}
                          onChange={() => handleToggleProfesor(profesor.id)}
                          className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 mt-0.5 flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          {/* Nombre y Cédula */}
                          <div className="flex items-center gap-3 mb-2">
                            <div>
                              <p className="font-semibold text-gray-800">
                                {profesor.nombre} {profesor.apellido}
                              </p>
                              {profesor.cedula && (
                                <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                  <FaIdCard className="w-3 h-3" />
                                  <span>Cédula: {formatearCedula(profesor.cedula)}</span>
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Materias Asignadas */}
                          {profesor.materiasAsignadas && profesor.materiasAsignadas.length > 0 && (
                            <div className="text-xs bg-blue-50 rounded p-2 border border-blue-200 mt-2">
                              <p className="font-semibold text-blue-700 mb-1 flex items-center gap-1">
                                <FaBook className="w-3 h-3" />
                                Materias en este Grado:
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {profesor.materiasAsignadas.map((mat, idx) => (
                                  <span key={idx} className="inline-block bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-medium">
                                    {typeof mat === 'object' ? mat.nombre : mat}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {/* Materias NO Asignadas en este Grado - Para Referencia */}
                          {profesor.otrasMateriasAsignadas && profesor.otrasMateriasAsignadas.length > 0 && (
                            <div className="text-xs bg-gray-50 rounded p-2 border border-gray-200 mt-2">
                              <p className="font-semibold text-gray-600 mb-1 flex items-center gap-1">
                                <FaBook className="w-3 h-3" />
                                Otras Materias:
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {profesor.otrasMateriasAsignadas.map((mat, idx) => (
                                  <span key={idx} className="inline-block bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs">
                                    {typeof mat === 'object' ? mat.nombre : mat}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </label>
                    ))
                  )}
                </div>
              </div>

              {/* Selección de Materia */}
              <div className="space-y-4 p-4 bg-gradient-to-br from-yellow-50 to-amber-50 rounded-lg border-2 border-yellow-300 shadow-sm">
                <div>
                  <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <div className="p-1.5 bg-yellow-200 rounded-lg">
                      <FaBook className="text-yellow-700 text-lg" />
                    </div>
                    Seleccionar Materia <span className="text-red-500">*</span>
                  </label>
                  <p className="text-xs text-gray-600 mt-1 ml-8">Elige una materia asignada a este grado</p>
                </div>

                <div className="p-4 border-2 border-yellow-200 rounded-lg bg-white">
                  {loadingMaterias ? (
                    <div className="flex flex-col items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-3 border-yellow-300 border-t-yellow-600 mb-3"></div>
                      <span className="text-sm text-gray-600 font-medium">Cargando materias...</span>
                    </div>
                  ) : materiasDelGrado.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <div className="p-3 bg-yellow-100 rounded-full mb-2">
                        <FaBook className="text-yellow-600 text-lg" />
                      </div>
                      <p className="text-sm text-gray-600 font-medium">No hay materias asignadas a este grado</p>
                      <p className="text-xs text-gray-500 mt-1">Asigna materias primero en la configuración del grado</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      {materiasDelGrado.map((mat) => {
                        const nombreMateria = mat.asignatura || mat.nombre;
                        const styles = getMateriaStyles(nombreMateria, 'full');
                        const isSelected = selectedMateria?.id === mat.id;
                        
                        return (
                          <button
                            key={mat.id}
                            type="button"
                            onClick={() => setSelectedMateria(mat)}
                            className={`p-4 rounded-lg border-2 cursor-pointer
                              ${isSelected 
                                ? `${styles.bgColorDark} border-yellow-500` 
                                : `${styles.bgColor} border-transparent`
                              }`}
                          >
                            <div className="flex flex-col items-center gap-2">
                              {/* Icono */}
                              <div className={`p-2 rounded-full ${styles.bgColorDark}`}>
                                <styles.Icon className={`text-lg ${styles.iconColor}`} />
                              </div>

                              {/* Nombre de materia */}
                              <p className={`text-xs font-bold text-center ${isSelected ? styles.textColorDark : styles.textColor}`}>
                                {nombreMateria.length > 16 
                                  ? nombreMateria.substring(0, 13) + '...' 
                                  : nombreMateria
                                }
                              </p>

                              {/* Indicador de selección */}
                              {isSelected && (
                                <div className="w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                                  <FaCheck className="text-yellow-800 text-xs" />
                                </div>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {selectedMateria && (
                  <div className="p-4 bg-gradient-to-r from-yellow-100 to-amber-100 rounded-lg border-2 border-yellow-400 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-yellow-200 rounded-full flex-shrink-0">
                        <FaCheckCircle className="text-yellow-700 text-lg" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-yellow-700">Materia seleccionada:</p>
                        <p className="text-sm font-bold text-yellow-800 truncate">
                          {selectedMateria.asignatura || selectedMateria.nombre}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Selección de Grados y Secciones */}
              <div className="space-y-3 p-4 bg-orange-50 rounded-lg border-2 border-orange-200">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <FaLayerGroup className="text-orange-600" />
                  Seleccionar Grados y Secciones <span className="text-red-500">*</span>
                </label>

                <div className="p-4 border-2 border-orange-200 rounded-lg bg-white space-y-3">
                  {gradosDisponibles.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No hay grados disponibles
                    </p>
                  ) : (
                    Object.entries(gradosPorNivel).map(([nivel, gradosNivel]) => (
                      <div key={nivel} className="space-y-2">
                        <p className="text-xs font-bold text-orange-700 px-2">{formatearNombreNivel(nivel)}</p>
                        <div className="pl-2 border-l-4 border-orange-300 space-y-2">
                          {gradosNivel.map((grado) => {
                            const seccionesGrado = getSeccionesDelGrado(grado.id);
                            const selectedSecciones = selectedGradosSecciones[grado.id] || [];
                            const isExpanded = expandedGrados[grado.id];
                            
                            return (
                              <div key={grado.id} className="space-y-2 p-2 bg-orange-50 rounded-lg border border-orange-200">
                                {/* Grado Header */}
                                <button
                                  type="button"
                                  onClick={() => handleToggleExpanded(grado.id)}
                                  className="w-full flex items-center justify-between p-2 hover:bg-orange-100 rounded"
                                >
                                  <span className="flex items-center gap-2">
                                    <span className={`${isExpanded ? 'rotate-90' : ''}`}>
                                      ▶
                                    </span>
                                    <span className="text-sm font-semibold text-gray-700">
                                      {formatearNombreGrado(grado.nombre_grado)}
                                    </span>
                                    {seccionesGrado.length > 0 && (
                                      <span className="text-xs bg-orange-200 text-orange-800 px-2 py-0.5 rounded">
                                        {selectedSecciones.length}/{seccionesGrado.length}
                                      </span>
                                    )}
                                  </span>
                                </button>

                                {/* Secciones */}
                                {isExpanded && (
                                  <div className="pl-4 space-y-2">
                                    {seccionesGrado.length === 0 ? (
                                      <p className="text-xs text-gray-500 italic py-2">
                                        No hay secciones para este grado
                                      </p>
                                    ) : (
                                      <>
                                        <button
                                          type="button"
                                          onClick={() => handleSelectAllSecciones(grado.id, seccionesGrado)}
                                          className="text-xs px-2 py-1 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded font-medium mb-1"
                                        >
                                          {selectedSecciones.length === seccionesGrado.length ? 'Desmarcar Todo' : 'Marcar Todo'}
                                        </button>
                                        <div className="grid grid-cols-2 gap-2">
                                          {seccionesGrado.map((seccion) => (
                                            <label key={seccion.id} className="flex items-center gap-2 p-2 hover:bg-orange-50 rounded cursor-pointer">
                                              <input
                                                type="checkbox"
                                                checked={selectedSecciones.includes(seccion.id)}
                                                onChange={() => handleToggleSeccion(grado.id, seccion.id)}
                                                className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-2 focus:ring-orange-500"
                                              />
                                              <span className="text-sm text-gray-700">
                                                {seccion.nombre_seccion || `Sección ${seccion.id}`}
                                              </span>
                                            </label>
                                          ))}
                                        </div>
                                      </>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4 border-t-2 border-gray-200">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || selectedProfesores.length === 0 || totalSelecciones === 0 || !selectedMateria}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  title={!selectedMateria ? 'Debe seleccionar una materia' : ''}
                >
                  {isSubmitting ? 'Asignando...' : `Asignar (${selectedProfesores.length} × ${totalSelecciones} × ${selectedMateria ? '1 materia' : '0 materias'})`}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <style>{`
        .fade-in {
          animation: fadeIn 0.15s ease-in-out forwards;
        }

        .slide-up {
          animation: slideUp 0.2s ease-out forwards;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from {
            transform: translateY(10px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
};

export default AsignarProfesorGrado;
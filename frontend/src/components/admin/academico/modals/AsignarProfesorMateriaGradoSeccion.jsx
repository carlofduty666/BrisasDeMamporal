import React, { useState, useEffect } from 'react';
import { FaTimes, FaChalkboardTeacher, FaCheck, FaLayerGroup, FaBook } from 'react-icons/fa';
import { formatearNombreGrado, formatearNombreNivel } from '../../../../utils/formatters';

const AsignarProfesorMateriaGradoSeccion = ({ 
  isOpen, 
  onClose, 
  materia, 
  profesores,
  grados,
  secciones,
  annoEscolar,
  loading,
  onSubmit,
  profesoresYaAsignados = []
}) => {
  const [selectedProfesores, setSelectedProfesores] = useState([]);
  const [gradoSeleccionado, setGradoSeleccionado] = useState('');
  const [selectedSecciones, setSelectedSecciones] = useState([]);
  const [annoEscolarID, setAnnoEscolarID] = useState(annoEscolar?.id || '');
  const [profesoresAsignados, setProfesoresAsignados] = useState(profesoresYaAsignados);
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';

  useEffect(() => {
    setSelectedProfesores([]);
    setGradoSeleccionado('');
    setSelectedSecciones([]);
    setAnnoEscolarID(annoEscolar?.id || '');
    setProfesoresAsignados(profesoresYaAsignados);
  }, [annoEscolar, isOpen, profesoresYaAsignados]);

  // Cargar profesores asignados desde el backend si no vienen del padre
  useEffect(() => {
    if (isOpen && materia?.id && profesoresYaAsignados.length === 0 && token) {
      const cargarProfesoresAsignados = async () => {
        try {
          const response = await fetch(
            `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/materias/${materia.id}/profesores`,
            { headers: { 'Authorization': `Bearer ${token}` } }
          );
          if (response.ok) {
            const data = await response.json();
            setProfesoresAsignados(Array.isArray(data) ? data : data.data || []);
          }
        } catch (err) {
          console.warn('Error cargando profesores asignados:', err);
          setProfesoresAsignados([]);
        }
      };
      cargarProfesoresAsignados();
    }
  }, [isOpen, materia?.id, token, profesoresYaAsignados]);

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

  const handleToggleSeccion = (seccionID) => {
    setSelectedSecciones(prev =>
      prev.includes(seccionID)
        ? prev.filter(id => id !== seccionID)
        : [...prev, seccionID]
    );
  };

  const handleSelectAllProfesores = () => {
    if (selectedProfesores.length === profesoresDisponibles.length) {
      setSelectedProfesores([]);
    } else {
      setSelectedProfesores(profesoresDisponibles.map(p => p.id));
    }
  };

  const handleSelectAllSecciones = () => {
    if (selectedSecciones.length === seccionesParaGrado.length) {
      setSelectedSecciones([]);
    } else {
      setSelectedSecciones(seccionesParaGrado.map(s => s.id));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedProfesores.length === 0 || !gradoSeleccionado || selectedSecciones.length === 0) return;

    // Enviar múltiples asignaciones: profesor x grado x sección
    selectedProfesores.forEach(profesorID => {
      selectedSecciones.forEach(seccionID => {
        onSubmit({
          profesorID,
          materiaID: materia.id,
          gradoID: parseInt(gradoSeleccionado),
          seccionID,
          annoEscolarID
        });
      });
    });

    setSelectedProfesores([]);
    setGradoSeleccionado('');
    setSelectedSecciones([]);
  };

  // Filtrar profesores ya asignados para el grado y sección
  const profesoresDisponibles = gradoSeleccionado
    ? profesores.filter(p => 
        !profesoresAsignados.some(pa => 
          pa.profesorID === p.id && pa.gradoID === parseInt(gradoSeleccionado)
        )
      )
    : profesores;

  // Obtener secciones del grado seleccionado
  const seccionesParaGrado = gradoSeleccionado
    ? secciones.filter(s => s.gradoID === parseInt(gradoSeleccionado))
    : [];

  // Obtener profesores ya asignados al grado seleccionado
  const profesoresDelGrado = gradoSeleccionado
    ? profesoresAsignados.filter(pa => pa.gradoID === parseInt(gradoSeleccionado))
    : [];

  // Obtener info del grado seleccionado
  const gradoInfo = gradoSeleccionado 
    ? grados.find(g => g.id === parseInt(gradoSeleccionado))
    : null;

  // Agrupar grados por nivel para el select
  const gradosPorNivel = grados.reduce((acc, grado) => {
    const nivel = grado.Niveles?.nombre_nivel || 'Sin Nivel';
    if (!acc[nivel]) acc[nivel] = [];
    acc[nivel].push(grado);
    return acc;
  }, {});

  // Agrupar secciones por nivel y grado
  const seccionesPorNivelGrado = seccionesParaGrado.reduce((acc, seccion) => {
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
          className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden border-2 border-blue-200 animate-slide-up flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <FaChalkboardTeacher className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white">
                Asignar Materia a Profesor y Profesor a Seccion. 
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
              Asignando: <span className="font-semibold text-blue-700">{materia?.asignatura}</span>
            </p>

            {/* Profesores ya asignados al grado seleccionado */}
            {gradoSeleccionado && profesoresDelGrado.length > 0 && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                <h4 className="text-sm font-semibold text-blue-800 mb-3">
                  Ya Asignados en {formatearNombreGrado(gradoInfo?.nombre_grado)}:
                </h4>
                <div className="space-y-2">
                  {profesoresDelGrado.map(pa => {
                    const profesor = profesores.find(p => p.id === pa.profesorID);
                    return (
                      <div key={`${pa.profesorID}-${pa.gradoID}`} className="flex items-center gap-2 text-sm text-blue-700">
                        <FaCheck className="text-blue-600" />
                        <span>{profesor?.nombre} {profesor?.apellido}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Selector de Grado - Agrupado por Nivel */}
              <div className="space-y-2">
                <label htmlFor="gradoID" className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <FaLayerGroup className="text-orange-600" />
                  Seleccionar Grado <span className="text-red-500">*</span>
                </label>
                <select
                  id="gradoID"
                  value={gradoSeleccionado}
                  onChange={(e) => {
                    setGradoSeleccionado(e.target.value);
                    setSelectedProfesores([]);
                    setSelectedSecciones([]);
                  }}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-700 transition-all duration-200 hover:border-blue-300 text-sm"
                >
                  <option value="">-- Seleccionar Grado --</option>
                  {Object.entries(gradosPorNivel).map(([nivel, gradosNivel]) => (
                    <optgroup key={nivel} label={formatearNombreNivel(nivel)}>
                      {gradosNivel.map((grado) => (
                        <option key={grado.id} value={grado.id}>
                          {formatearNombreGrado(grado.nombre_grado)}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              {gradoSeleccionado && (
                <>
                  {/* Selección de Secciones - Agrupadas por Nivel y Grado */}
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
                        {selectedSecciones.length === seccionesParaGrado.length ? 'Desmarcar Todo' : 'Marcar Todo'}
                      </button>
                    </div>

                    <div className="p-4 border-2 border-green-200 rounded-lg bg-white space-y-4">
                      {seccionesParaGrado.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-4">
                          No hay secciones disponibles para este grado
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
                        className="text-xs px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded font-medium transition-colors"
                      >
                        {selectedProfesores.length === profesoresDisponibles.length ? 'Desmarcar Todo' : 'Marcar Todo'}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-4 border-2 border-blue-200 rounded-lg bg-white max-h-64 overflow-y-auto">
                      {profesoresDisponibles.length === 0 ? (
                        <p className="text-sm text-gray-500 col-span-full text-center py-4">
                          Todos los profesores ya han sido asignados
                        </p>
                      ) : (
                        profesoresDisponibles.map((profesor) => (
                          <label key={profesor.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer transition-colors">
                            <input
                              type="checkbox"
                              checked={selectedProfesores.includes(profesor.id)}
                              onChange={() => handleToggleProfesor(profesor.id)}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">
                              {profesor.nombre} {profesor.apellido}
                            </span>
                          </label>
                        ))
                      )}
                    </div>
                  </div>
                </>
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
                  disabled={loading || !gradoSeleccionado || selectedProfesores.length === 0 || selectedSecciones.length === 0}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {loading ? 'Asignando...' : `Asignar (${selectedProfesores.length} × ${selectedSecciones.length})`}
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

export default AsignarProfesorMateriaGradoSeccion;
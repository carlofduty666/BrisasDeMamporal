import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaTimes, FaSpinner, FaUsers, FaChevronDown, FaChevronUp } from 'react-icons/fa';

const ModalEstudiantes = ({
  isOpen,
  onClose,
  profesor,
  annoEscolar,
  grados,
  selectedMateria
}) => {
  const [estudiantesModal, setEstudiantesModal] = useState([]);
  const [gradosModal, setGradosModal] = useState([]);
  const [seccionesModalFiltro, setSeccionesModalFiltro] = useState([]);
  const [filtroGradoEstudiantes, setFiltroGradoEstudiantes] = useState('');
  const [filtroSeccionEstudiantes, setFiltroSeccionEstudiantes] = useState('');
  const [loadingModal, setLoadingModal] = useState(false);
  const [estudianteExpandido, setEstudianteExpandido] = useState(null);
  const [progresoEstudiante, setProgresoEstudiante] = useState({});

  useEffect(() => {
    if (isOpen) {
      cargarEstudiantes();
    }
  }, [isOpen, selectedMateria]);

  const cargarEstudiantes = async () => {
    setLoadingModal(true);
    setFiltroGradoEstudiantes('');
    setFiltroSeccionEstudiantes('');
    
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { 'Authorization': `Bearer ${token}` } };
      
      const estudiantesResponse = await axios.get(
        `${import.meta.env.VITE_API_URL}/personas/profesor/${profesor.id}/estudiantes?annoEscolarID=${annoEscolar.id}`,
        config
      );
      
      setEstudiantesModal(estudiantesResponse.data);
      setGradosModal(grados);
    } catch (err) {
      console.error('Error al cargar estudiantes:', err);
    }
    
    setLoadingModal(false);
  };

  const handleFiltroGrado = async (gradoID) => {
    setFiltroGradoEstudiantes(gradoID);
    setFiltroSeccionEstudiantes('');
    
    if (gradoID) {
      try {
        const token = localStorage.getItem('token');
        const config = { headers: { 'Authorization': `Bearer ${token}` } };
        
        const seccionesResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/secciones/grado/${gradoID}`,
          config
        );
        setSeccionesModalFiltro(seccionesResponse.data);
        
        const estudiantesResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/grados/${gradoID}/estudiantes?annoEscolarID=${annoEscolar.id}`,
          config
        );
        setEstudiantesModal(estudiantesResponse.data);
      } catch (err) {
        console.error('Error al filtrar estudiantes:', err);
      }
    } else {
      cargarEstudiantes();
    }
  };

  const handleFiltroSeccion = async (seccionID) => {
    setFiltroSeccionEstudiantes(seccionID);
    
    if (filtroGradoEstudiantes) {
      try {
        const token = localStorage.getItem('token');
        const config = { headers: { 'Authorization': `Bearer ${token}` } };
        
        let url = `${import.meta.env.VITE_API_URL}/grados/${filtroGradoEstudiantes}/estudiantes?annoEscolarID=${annoEscolar.id}`;
        
        if (seccionID) {
          url += `&seccionID=${seccionID}`;
        }
        
        const estudiantesResponse = await axios.get(url, config);
        setEstudiantesModal(estudiantesResponse.data);
      } catch (err) {
        console.error('Error al filtrar por sección:', err);
      }
    }
  };

  const handleVerProgreso = async (estudiante) => {
    if (estudianteExpandido === estudiante.id) {
      setEstudianteExpandido(null);
      return;
    }
    
    setEstudianteExpandido(estudiante.id);
    
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { 'Authorization': `Bearer ${token}` } };
      
      const evaluacionesResponse = await axios.get(
        `${import.meta.env.VITE_API_URL}/evaluaciones/profesor/${profesor.id}`,
        config
      );
      
      const calificacionesResponse = await axios.get(
        `${import.meta.env.VITE_API_URL}/calificaciones/estudiante/${estudiante.id}?annoEscolarID=${annoEscolar.id}`,
        config
      );
      
      const evaluaciones = evaluacionesResponse.data;
      const calificaciones = calificacionesResponse.data;
      
      const progreso = evaluaciones.map(evaluacion => {
        const calificacion = calificaciones.find(c => c.evaluacionID === evaluacion.id);
        return {
          ...evaluacion,
          calificacion: calificacion ? calificacion.calificacion : null,
          observaciones: calificacion ? calificacion.observaciones : '',
          calificacionID: calificacion ? calificacion.id : null
        };
      });
      
      setProgresoEstudiante(prev => ({
        ...prev,
        [estudiante.id]: progreso
      }));
    } catch (err) {
      console.error('Error al cargar progreso:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-screen overflow-y-auto animate-scaleIn transition-all duration-300 ease-in-out">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">
              Estudiantes
              {selectedMateria && (
                <span className="text-sm font-normal text-gray-600 ml-2">
                  - {selectedMateria.asignatura}
                </span>
              )}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <FaTimes className="h-5 w-5" />
            </button>
          </div>
          
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filtrar por Grado
              </label>
              <select
                value={filtroGradoEstudiantes}
                onChange={(e) => handleFiltroGrado(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200 ease-in-out hover:border-slate-400"
              >
                <option value="">Todos los grados</option>
                {gradosModal.map(grado => (
                  <option key={grado.id} value={grado.id}>
                    {grado.nombre_grado || grado.nombre}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filtrar por Sección
              </label>
              <select
                value={filtroSeccionEstudiantes}
                onChange={(e) => handleFiltroSeccion(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200 ease-in-out hover:border-slate-400"
                disabled={!filtroGradoEstudiantes}
              >
                <option value="">Todas las secciones</option>
                {seccionesModalFiltro.map(seccion => (
                  <option key={seccion.id} value={seccion.id}>
                    {seccion.nombre_seccion || seccion.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          {loadingModal ? (
            <div className="flex justify-center py-8">
              <FaSpinner className="animate-spin h-8 w-8 text-slate-600" />
            </div>
          ) : estudiantesModal.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No hay estudiantes registrados</p>
          ) : (
            <div className="space-y-4">
              {estudiantesModal.map((estudiante, index) => (
                <div 
                  key={estudiante.id} 
                  className="bg-gray-50 rounded-lg transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1 animate-fadeIn"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div 
                    className="p-4 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleVerProgreso(estudiante)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-full mr-3">
                          <FaUsers className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {estudiante.nombre} {estudiante.apellido}
                          </p>
                          <p className="text-sm text-gray-500">C.I: {estudiante.cedula}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm text-gray-500 mr-2">Ver progreso</span>
                        {estudianteExpandido === estudiante.id ? (
                          <FaChevronUp className="h-4 w-4 text-gray-400" />
                        ) : (
                          <FaChevronDown className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {estudianteExpandido === estudiante.id && progresoEstudiante[estudiante.id] && (
                    <div className="px-4 pb-4 border-t border-gray-200">
                      <h4 className="text-sm font-medium text-gray-700 mb-3 mt-3">
                        Evaluaciones y Calificaciones
                      </h4>
                      <div className="space-y-2">
                        {progresoEstudiante[estudiante.id].map((evaluacion) => (
                          <div key={evaluacion.id} className="flex justify-between items-center p-2 bg-white rounded">
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {evaluacion.nombreEvaluacion}
                              </p>
                              <p className="text-xs text-gray-500">
                                {evaluacion.Materias?.asignatura} • Lapso {evaluacion.lapso}
                              </p>
                            </div>
                            <div className="text-right">
                              {evaluacion.calificacion !== null ? (
                                <div>
                                  <p className="text-sm font-bold text-green-700">
                                    {evaluacion.calificacion}/20
                                  </p>
                                  {evaluacion.observaciones && (
                                    <p className="text-xs text-gray-500">
                                      {evaluacion.observaciones}
                                    </p>
                                  )}
                                </div>
                              ) : (
                                <p className="text-sm text-red-600">Sin calificar</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModalEstudiantes;

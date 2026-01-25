import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FaTimes, 
  FaSpinner, 
  FaEdit, 
  FaTrash, 
  FaUpload, 
  FaPaperclip, 
  FaDownload 
} from 'react-icons/fa';

const ModalEvaluaciones = ({
  isOpen,
  onClose,
  profesor,
  annoEscolar,
  selectedMateria,
  onEditarEvaluacion,
  onCalificarEvaluacion,
  onVerEntregas,
  onEliminarEvaluacion,
  onDescargarArchivo
}) => {
  const [evaluacionesModal, setEvaluacionesModal] = useState([]);
  const [materiasModal, setMateriasModal] = useState([]);
  const [gradosModal, setGradosModal] = useState([]);
  const [seccionesModal, setSeccionesModal] = useState([]);
  const [filtroMateriaEvaluaciones, setFiltroMateriaEvaluaciones] = useState('');
  const [filtroGradoEvaluaciones, setFiltroGradoEvaluaciones] = useState('');
  const [filtroSeccionEvaluaciones, setFiltroSeccionEvaluaciones] = useState('');
  const [loadingModal, setLoadingModal] = useState(false);

  useEffect(() => {
    if (isOpen) {
      cargarDatos();
    }
  }, [isOpen, selectedMateria]);

  const cargarDatos = async () => {
    setLoadingModal(true);
    
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { 'Authorization': `Bearer ${token}` } };
      
      if (selectedMateria) {
        setFiltroMateriaEvaluaciones(selectedMateria.id);
        const evaluacionesResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/evaluaciones/filtradas?profesorID=${profesor.id}&materiaID=${selectedMateria.id}`,
          config
        );
        setEvaluacionesModal(evaluacionesResponse.data);
      } else {
        const evaluacionesResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/evaluaciones/profesor/${profesor.id}`,
          config
        );
        setEvaluacionesModal(evaluacionesResponse.data);
      }
      
      const materiasResponse = await axios.get(
        `${import.meta.env.VITE_API_URL}/materias/profesor/${profesor.id}?annoEscolarID=${annoEscolar.id}`,
        config
      );
      setMateriasModal(materiasResponse.data);
      
      const gradosResponse = await axios.get(
        `${import.meta.env.VITE_API_URL}/grados/profesor/${profesor.id}?annoEscolarID=${annoEscolar.id}`,
        config
      );
      setGradosModal(gradosResponse.data);
      
    } catch (err) {
      console.error('Error al cargar evaluaciones:', err);
    }
    
    setLoadingModal(false);
  };

  const handleFiltroGrado = async (gradoID) => {
    setFiltroGradoEvaluaciones(gradoID);
    setFiltroSeccionEvaluaciones('');
    
    if (gradoID) {
      try {
        const token = localStorage.getItem('token');
        const config = { headers: { 'Authorization': `Bearer ${token}` } };
        
        const seccionesResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/secciones/grado/${gradoID}`,
          config
        );
        setSeccionesModal(seccionesResponse.data);
        
        const evaluacionesResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/evaluaciones/profesor/${profesor.id}`,
          config
        );
        
        let evaluacionesFiltradas = evaluacionesResponse.data.filter(e => e.gradoID == gradoID);
        
        if (filtroMateriaEvaluaciones) {
          evaluacionesFiltradas = evaluacionesFiltradas.filter(e => e.materiaID == filtroMateriaEvaluaciones);
        }
        
        setEvaluacionesModal(evaluacionesFiltradas);
      } catch (err) {
        console.error('Error al filtrar evaluaciones por grado:', err);
      }
    } else {
      setSeccionesModal([]);
      cargarDatos();
    }
  };

  const handleFiltroSeccion = async (seccionID) => {
    setFiltroSeccionEvaluaciones(seccionID);
    
    if (seccionID && filtroGradoEvaluaciones) {
      try {
        const token = localStorage.getItem('token');
        const config = { headers: { 'Authorization': `Bearer ${token}` } };
        
        const evaluacionesResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/evaluaciones/profesor/${profesor.id}`,
          config
        );
        
        let evaluacionesFiltradas = evaluacionesResponse.data.filter(e => 
          e.gradoID == filtroGradoEvaluaciones && e.seccionID == seccionID
        );
        
        if (filtroMateriaEvaluaciones) {
          evaluacionesFiltradas = evaluacionesFiltradas.filter(e => e.materiaID == filtroMateriaEvaluaciones);
        }
        
        setEvaluacionesModal(evaluacionesFiltradas);
      } catch (err) {
        console.error('Error al filtrar por sección:', err);
      }
    }
  };

  const handleFiltroMateria = async (materiaID) => {
    setFiltroMateriaEvaluaciones(materiaID);
    
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { 'Authorization': `Bearer ${token}` } };
      
      const evaluacionesResponse = await axios.get(
        `${import.meta.env.VITE_API_URL}/evaluaciones/profesor/${profesor.id}`,
        config
      );
      
      let evaluacionesFiltradas = evaluacionesResponse.data;
      
      if (materiaID) {
        evaluacionesFiltradas = evaluacionesFiltradas.filter(e => e.materiaID == materiaID);
      }
      if (filtroGradoEvaluaciones) {
        evaluacionesFiltradas = evaluacionesFiltradas.filter(e => e.gradoID == filtroGradoEvaluaciones);
      }
      if (filtroSeccionEvaluaciones) {
        evaluacionesFiltradas = evaluacionesFiltradas.filter(e => e.seccionID == filtroSeccionEvaluaciones);
      }
      
      setEvaluacionesModal(evaluacionesFiltradas);
    } catch (err) {
      console.error('Error al filtrar por materia:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-screen overflow-y-auto animate-scaleIn transition-all duration-300 ease-in-out">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">
              Evaluaciones
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
        </div>
        
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filtrar por Materia
              </label>
              <select
                value={filtroMateriaEvaluaciones}
                onChange={(e) => handleFiltroMateria(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200 ease-in-out hover:border-slate-400"
              >
                <option value="">Todas las materias</option>
                {materiasModal.map((materia) => (
                  <option key={materia.id} value={materia.id}>
                    {materia.asignatura}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filtrar por Grado
              </label>
              <select
                value={filtroGradoEvaluaciones}
                onChange={(e) => handleFiltroGrado(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200 ease-in-out hover:border-slate-400"
              >
                <option value="">Todos los grados</option>
                {gradosModal.map((grado) => (
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
                value={filtroSeccionEvaluaciones}
                onChange={(e) => handleFiltroSeccion(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200 ease-in-out hover:border-slate-400"
                disabled={!filtroGradoEvaluaciones}
              >
                <option value="">Todas las secciones</option>
                {seccionesModal.map((seccion) => (
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
          ) : evaluacionesModal.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No hay evaluaciones registradas</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {evaluacionesModal.map((evaluacion, index) => (
                <div 
                  key={evaluacion.id} 
                  className="bg-gray-50 rounded-lg p-4 transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1 animate-fadeIn"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="mb-3">
                    <h3 className="font-medium text-gray-900">{evaluacion.nombreEvaluacion}</h3>
                    <p className="text-sm text-gray-500">
                      {evaluacion.Materias?.asignatura} • Lapso {evaluacion.lapso}
                    </p>
                    <p className="text-sm text-gray-500">
                      {evaluacion.tipoEvaluacion} • {evaluacion.porcentaje}%
                    </p>
                    <p className="text-sm text-gray-500">
                      Fecha: {new Date(evaluacion.fechaEvaluacion).toLocaleDateString()}
                    </p>
                    {evaluacion.requiereEntrega && (
                      <p className="text-sm text-blue-600">
                        Requiere entrega • Límite: {evaluacion.fechaLimiteEntrega 
                          ? new Date(evaluacion.fechaLimiteEntrega).toLocaleDateString() 
                          : 'No especificado'}
                      </p>
                    )}
                    {evaluacion.archivoURL && (
                      <div className="flex items-center text-sm text-green-600">
                        <FaPaperclip className="h-3 w-3 mr-1" />
                        <span>Archivo adjunto</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDescargarArchivo(evaluacion.id);
                          }}
                          className="ml-2 text-blue-600 hover:text-blue-800"
                          title="Descargar archivo"
                        >
                          <FaDownload className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => onEditarEvaluacion(evaluacion)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm transition-all duration-200 ease-in-out hover:shadow-md hover:-translate-y-0.5 flex items-center justify-center"
                      >
                        <FaEdit className="h-3 w-3 mr-1" />
                        Editar
                      </button>
                      <button
                        onClick={() => onCalificarEvaluacion(evaluacion)}
                        className="flex-1 bg-slate-600 hover:bg-slate-700 text-white px-3 py-2 rounded text-sm transition-all duration-200 ease-in-out hover:shadow-md hover:-translate-y-0.5"
                      >
                        Calificar
                      </button>
                    </div>
                    {evaluacion.requiereEntrega && (
                      <button
                        onClick={() => onVerEntregas(evaluacion)}
                        className="w-full bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm transition-all duration-200 ease-in-out hover:shadow-md hover:-translate-y-0.5 flex items-center justify-center"
                      >
                        <FaUpload className="h-3 w-3 mr-1" />
                        Ver Entregas
                      </button>
                    )}
                    <button
                      onClick={() => onEliminarEvaluacion(evaluacion)}
                      className="w-full bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm transition-all duration-200 ease-in-out hover:shadow-md hover:-translate-y-0.5 flex items-center justify-center"
                    >
                      <FaTrash className="h-3 w-3 mr-1" />
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModalEvaluaciones;

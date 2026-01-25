import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FaTimes, 
  FaSpinner, 
  FaUsers, 
  FaSearch, 
  FaFilter, 
  FaClipboardList,
  FaChartBar 
} from 'react-icons/fa';

const ModalPromedios = ({
  isOpen,
  onClose,
  profesor,
  annoEscolar,
  grados,
  materias
}) => {
  const [promediosCompletos, setPromediosCompletos] = useState([]);
  const [promediosFiltrados, setPromediosFiltrados] = useState([]);
  const [gradosModal, setGradosModal] = useState([]);
  const [materiasModal, setMateriasModal] = useState([]);
  const [seccionesPromedios, setSeccionesPromedios] = useState([]);
  const [filtroGradoPromedios, setFiltroGradoPromedios] = useState('');
  const [filtroSeccionPromedios, setFiltroSeccionPromedios] = useState('');
  const [filtroMateriaPromedios, setFiltroMateriaPromedios] = useState('');
  const [busquedaPromedios, setBusquedaPromedios] = useState('');
  const [loadingModal, setLoadingModal] = useState(false);

  useEffect(() => {
    if (isOpen) {
      cargarPromedios();
    }
  }, [isOpen]);

  const cargarPromedios = async () => {
    setLoadingModal(true);
    
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { 'Authorization': `Bearer ${token}` } };
      
      setGradosModal(grados);
      setMateriasModal(materias);
      
      const promediosResponse = await axios.get(
        `${import.meta.env.VITE_API_URL}/promedios/estudiantes/${profesor.id}?annoEscolarID=${annoEscolar.id}`,
        config
      );
      
      const datosCompletos = promediosResponse.data;
      setPromediosCompletos(datosCompletos);
      setPromediosFiltrados(datosCompletos);
    } catch (err) {
      console.error('Error al cargar promedios:', err);
    }
    
    setLoadingModal(false);
  };

  const handleFiltroGrado = async (gradoID) => {
    setFiltroGradoPromedios(gradoID);
    setFiltroSeccionPromedios('');
    
    if (gradoID) {
      try {
        const token = localStorage.getItem('token');
        const config = { headers: { 'Authorization': `Bearer ${token}` } };
        
        const seccionesResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/secciones/grado/${gradoID}`,
          config
        );
        setSeccionesPromedios(seccionesResponse.data);
      } catch (err) {
        console.error('Error al cargar secciones:', err);
      }
    } else {
      setSeccionesPromedios([]);
    }
    
    aplicarFiltros(gradoID, filtroSeccionPromedios, filtroMateriaPromedios, busquedaPromedios);
  };

  const handleFiltroSeccion = (seccionID) => {
    setFiltroSeccionPromedios(seccionID);
    aplicarFiltros(filtroGradoPromedios, seccionID, filtroMateriaPromedios, busquedaPromedios);
  };

  const handleFiltroMateria = (materiaID) => {
    setFiltroMateriaPromedios(materiaID);
    aplicarFiltros(filtroGradoPromedios, filtroSeccionPromedios, materiaID, busquedaPromedios);
  };

  const handleBusqueda = (texto) => {
    setBusquedaPromedios(texto);
    aplicarFiltros(filtroGradoPromedios, filtroSeccionPromedios, filtroMateriaPromedios, texto);
  };

  const aplicarFiltros = (gradoID, seccionID, materiaID, busqueda) => {
    let datosFiltrados = [...promediosCompletos];
    
    if (gradoID) {
      datosFiltrados = datosFiltrados.filter(est => 
        est.gradoID == gradoID || est.grado?.id == gradoID
      );
    }
    
    if (seccionID) {
      datosFiltrados = datosFiltrados.filter(est => 
        est.seccionID == seccionID || est.seccion?.id == seccionID
      );
    }
    
    if (materiaID) {
      datosFiltrados = datosFiltrados.filter(est => {
        return est.calificaciones?.some(cal => 
          cal.Evaluaciones?.materiaID == materiaID
        );
      });
    }
    
    if (busqueda) {
      const busquedaLower = busqueda.toLowerCase();
      datosFiltrados = datosFiltrados.filter(estudiante => 
        estudiante.nombre.toLowerCase().includes(busquedaLower) ||
        estudiante.apellido.toLowerCase().includes(busquedaLower) ||
        estudiante.cedula.toString().includes(busquedaLower)
      );
    }
    
    setPromediosFiltrados(datosFiltrados);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-lg max-w-7xl w-full max-h-screen overflow-y-auto animate-scaleIn transition-all duration-300 ease-in-out">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Calificaciones y Promedios de Estudiantes</h2>
              <p className="text-sm text-gray-600 mt-1">
                Visualiza todas las calificaciones y promedios de tus estudiantes
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FaTimes className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <FaSearch className="inline h-3 w-3 mr-1" />
                Buscar Estudiante
              </label>
              <input
                type="text"
                value={busquedaPromedios}
                onChange={(e) => handleBusqueda(e.target.value)}
                placeholder="Nombre, apellido o cédula..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200 ease-in-out hover:border-slate-400"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <FaFilter className="inline h-3 w-3 mr-1" />
                Grado
              </label>
              <select
                value={filtroGradoPromedios}
                onChange={(e) => handleFiltroGrado(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200 ease-in-out hover:border-slate-400"
              >
                <option value="">Todos los grados</option>
                {gradosModal.map((grado) => (
                  <option key={grado.id} value={grado.id}>
                    {grado.nombre_grado}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sección
              </label>
              <select
                value={filtroSeccionPromedios}
                onChange={(e) => handleFiltroSeccion(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200 ease-in-out hover:border-slate-400"
                disabled={!filtroGradoPromedios}
              >
                <option value="">Todas las secciones</option>
                {seccionesPromedios.map((seccion) => (
                  <option key={seccion.id} value={seccion.id}>
                    {seccion.nombre_seccion || seccion.nombreSeccion}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Materia
              </label>
              <select
                value={filtroMateriaPromedios}
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
            
            <div className="flex items-end">
              <div className="text-sm text-gray-600">
                <span className="font-medium">{promediosFiltrados.length}</span> estudiante{promediosFiltrados.length !== 1 ? 's' : ''} encontrado{promediosFiltrados.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          {loadingModal ? (
            <div className="flex justify-center py-8">
              <FaSpinner className="animate-spin h-8 w-8 text-slate-600" />
            </div>
          ) : promediosFiltrados.length === 0 ? (
            <div className="text-center py-8">
              <FaUsers className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No se encontraron estudiantes con los filtros aplicados</p>
            </div>
          ) : (
            <div className="space-y-6">
              {promediosFiltrados.map((estudiante, index) => (
                <div 
                  key={estudiante.estudianteID}
                  className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 animate-fadeIn"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
                            <FaUsers className="h-5 w-5 text-slate-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-lg font-semibold text-gray-900">
                            {estudiante.nombre} {estudiante.apellido}
                          </div>
                          <div className="text-sm text-gray-500">
                            C.I: {estudiante.cedula}
                            {estudiante.grado && ` • ${estudiante.grado.nombre_grado || estudiante.grado}`}
                            {estudiante.seccion && ` - ${estudiante.seccion.nombre_seccion || estudiante.seccion}`}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="flex items-center">
                          <span className="text-sm text-gray-500 mr-2">Promedio General:</span>
                          <span className={`text-xl font-bold ${
                            estudiante.promedio >= 14 ? 'text-green-600' :
                            estudiante.promedio >= 10 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {parseFloat(estudiante.promedio || 0).toFixed(2)}
                          </span>
                        </div>
                        {estudiante.evaluacionesPendientes > 0 && (
                          <div className="mt-1 text-sm text-orange-600">
                            <FaClipboardList className="inline h-3 w-3 mr-1" />
                            {estudiante.evaluacionesPendientes} por calificar
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {[1, 2, 3].map(lapso => {
                        const calificacionesLapso = estudiante.calificaciones?.filter(cal => 
                          cal.Evaluaciones?.lapso === lapso.toString()
                        ) || [];
                        
                        const materiasPorLapso = {};
                        calificacionesLapso.forEach(cal => {
                          const materia = cal.Evaluaciones?.Materias?.asignatura;
                          if (materia) {
                            if (!materiasPorLapso[materia]) {
                              materiasPorLapso[materia] = [];
                            }
                            materiasPorLapso[materia].push(cal);
                          }
                        });
                        
                        return (
                          <div key={lapso} className="bg-gray-50 rounded-lg p-4">
                            <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                              <span className="bg-slate-600 text-white rounded-full h-6 w-6 flex items-center justify-center text-xs mr-2">
                                {lapso}
                              </span>
                              Lapso {lapso}
                            </h4>
                            
                            {Object.keys(materiasPorLapso).length > 0 ? (
                              <div className="space-y-3">
                                {Object.entries(materiasPorLapso).map(([materia, calificaciones]) => {
                                  const promedioMateria = calificaciones.reduce((sum, cal) => sum + cal.calificacion, 0) / calificaciones.length;
                                  
                                  return (
                                    <div key={materia} className="bg-white rounded p-3 border border-gray-200">
                                      <div className="font-medium text-sm text-gray-800 mb-2 flex justify-between items-center">
                                        <span>{materia}</span>
                                        <span className={`text-sm font-bold ${
                                          promedioMateria >= 14 ? 'text-green-600' :
                                          promedioMateria >= 10 ? 'text-yellow-600' : 'text-red-600'
                                        }`}>
                                          {promedioMateria.toFixed(2)}
                                        </span>
                                      </div>
                                      
                                      <div className="space-y-2">
                                        {calificaciones.map((cal, idx) => (
                                          <div key={idx} className="border-l-2 border-gray-100 pl-2">
                                            <div className="flex justify-between items-center text-xs">
                                              <span className="text-gray-600 truncate flex-1 mr-2">
                                                {cal.Evaluaciones?.nombreEvaluacion}
                                                {cal.Evaluaciones?.tipoEvaluacion && (
                                                  <span className="text-gray-400 ml-1">
                                                    ({cal.Evaluaciones.tipoEvaluacion})
                                                  </span>
                                                )}
                                              </span>
                                              <span className={`font-medium px-2 py-1 rounded ${
                                                cal.calificacion >= 14 ? 'bg-green-100 text-green-700' :
                                                cal.calificacion >= 10 ? 'bg-yellow-100 text-yellow-700' : 
                                                'bg-red-100 text-red-700'
                                              }`}>
                                                {parseFloat(cal.calificacion).toFixed(1)}
                                              </span>
                                            </div>
                                            {cal.observaciones && (
                                              <div className="text-xs text-gray-600 italic mt-1 pl-1">
                                                "{cal.observaciones}"
                                              </div>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <div className="text-sm text-gray-400 italic">
                                Sin evaluaciones en este lapso
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
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

export default ModalPromedios;

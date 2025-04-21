import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FaEdit, FaTrash, FaEye, FaUserGraduate, FaChalkboardTeacher, FaBook, FaUsers } from 'react-icons/fa';
import { formatearNombreGrado } from '../../../utils/formatters';

const GradosList = () => {
  const [grados, setGrados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [annoEscolar, setAnnoEscolar] = useState(null);
  const [selectedGrado, setSelectedGrado] = useState(null);
  const [activeTab, setActiveTab] = useState('info');
  const [estudiantes, setEstudiantes] = useState([]);
  const [profesores, setProfesores] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [cupos, setCupos] = useState({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [gradoToDelete, setGradoToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Obtener token de autenticación
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Obtener año escolar activo
        const annoResponse = await axios.get(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/anno-escolar/actual`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        setAnnoEscolar(annoResponse.data);
        
        // Obtener grados
        const gradosResponse = await axios.get(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/grados`,
          { 
            headers: { 'Authorization': `Bearer ${token}` },
            params: { include: 'niveles' } // Solicitar que incluya la información de niveles
          }
        );
        setGrados(gradosResponse.data);
        
        // Obtener información de cupos - CORREGIDO
        try {
          // Usar la ruta correcta para obtener el resumen de cupos
          const cuposResponse = await axios.get(
            `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/cupos/resumen`,
            { 
              headers: { 'Authorization': `Bearer ${token}` },
              params: { annoEscolarID: annoResponse.data.id } // Añadir el año escolar como parámetro
            }
          );
          
          // Procesar los datos de cupos correctamente según la estructura de la respuesta
          const cuposData = {};
          if (cuposResponse.data && cuposResponse.data.cuposPorGrado) {
            Object.entries(cuposResponse.data.cuposPorGrado).forEach(([gradoID, cupoInfo]) => {
              cuposData[gradoID] = {
                capacidad: cupoInfo.capacidadTotal || 0,
                ocupados: cupoInfo.ocupados || 0,
                disponibles: cupoInfo.disponibles || 0
              };
            });
          }
          setCupos(cuposData);
        } catch (error) {
          console.error('Error al cargar cupos:', error);
          // No interrumpir la carga si falla la obtención de cupos
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error al cargar datos:', error);
        setError('Error al cargar los datos. Por favor, intente de nuevo.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [token]);
  

  const loadGradoDetails = async (grado) => {
    setSelectedGrado(grado);
    setActiveTab('info');
    setLoadingDetails(true);
    
    try {
      // Intentar cargar estudiantes
      try {
        const estudiantesResponse = await axios.get(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/grados/${grado.id}/estudiantes`,
          { 
            headers: { 'Authorization': `Bearer ${token}` },
            params: { 
              annoEscolarID: annoEscolar.id,
              tipo: 'estudiante'
            }
          }
        );
        setEstudiantes(estudiantesResponse.data);
      } catch (estudiantesError) {
        console.error('Error al cargar estudiantes:', estudiantesError);
        setEstudiantes([]);
      }
      
      // Intentar cargar profesores
      try {
        const profesoresResponse = await axios.get(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/grados/${grado.id}/profesores`,
          { 
            headers: { 'Authorization': `Bearer ${token}` },
            params: { 
              annoEscolarID: annoEscolar.id,
              tipo: 'profesor'
            }
          }
        );
        setProfesores(profesoresResponse.data);
      } catch (profesoresError) {
        console.error('Error al cargar profesores:', profesoresError);
        setProfesores([]);
      }
      
      // Intentar cargar materias
      try {
        const materiasResponse = await axios.get(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/materias/grado/${grado.id}`,
          { 
            headers: { 'Authorization': `Bearer ${token}` },
            params: { 
              annoEscolarID: annoEscolar.id,
              limit: 0
            }
          }
        );
        console.log('Materias cargadas:', materiasResponse.data.length);
        setMaterias(materiasResponse.data);
      } catch (materiasError) {
        console.error('Error al cargar materias:', materiasError);
        setMaterias([]);
      }
      
      setLoadingDetails(false);
    } catch (error) {
      console.error('Error general al cargar detalles del grado:', error);
      setLoadingDetails(false);
    }
  };
  
  


  // Función para confirmar eliminación de grado
  const confirmDelete = (grado) => {
    setGradoToDelete(grado);
    setShowDeleteModal(true);
  };

  // Función para eliminar grado
  const handleDeleteGrado = async () => {
    if (!gradoToDelete) return;
    
    setDeleteLoading(true);
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/grados/${gradoToDelete.id}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      // Actualizar la lista de grados
      setGrados(grados.filter(g => g.id !== gradoToDelete.id));
      
      // Si el grado eliminado es el seleccionado, limpiar la selección
      if (selectedGrado && selectedGrado.id === gradoToDelete.id) {
        setSelectedGrado(null);
      }
      
      setSuccessMessage(`El grado ${formatearNombreGrado(gradoToDelete.nombre_grado)} ha sido eliminado correctamente.`);
      setTimeout(() => setSuccessMessage(''), 3000);
      
      setShowDeleteModal(false);
      setGradoToDelete(null);
      setDeleteLoading(false);
    } catch (error) {
      console.error('Error al eliminar grado:', error);
      setError('No se pudo eliminar el grado. Verifique que no tenga estudiantes o profesores asignados.');
      setDeleteLoading(false);
    }
  };

  return (
     
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">Gestión de Grados</h1>
          <Link
            to="/admin/academico/grados/nuevo"
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
          >
            Nuevo Grado
          </Link>
        </div>
        
        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}
        
        {successMessage && (
          <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-md">
            {successMessage}
          </div>
        )}
        
        {annoEscolar && (
          <div className="mb-6 p-4 bg-blue-50 rounded-md">
            <h2 className="text-lg font-medium text-blue-800">
              Año Escolar: {annoEscolar.periodo}
              {annoEscolar.activo ? ' (Activo)' : ''}
            </h2>
            <p className="text-sm text-blue-600 mt-1">
              Los datos mostrados corresponden al año escolar actual.
            </p>
          </div>
        )}
        
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-6">
            {/* Lista de grados */}
            <div className="md:w-1/3">
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 border-b">
                  <h2 className="text-lg font-medium text-gray-800">Grados</h2>
                </div>
                
                {grados.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    No hay grados registrados.
                  </div>
                ) : (
                  <ul className="divide-y divide-gray-200">
                    {grados.map(grado => {
                      const cupoInfo = cupos[grado.id] || { capacidad: 0, ocupados: 0, disponibles: 0 };
                      
                      return (
                        <li 
                          key={grado.id} 
                          className={`hover:bg-gray-50 cursor-pointer ${
                            selectedGrado && selectedGrado.id === grado.id ? 'bg-indigo-50' : ''
                          }`}
                          onClick={() => loadGradoDetails(grado)}
                        >
                            <div className="px-4 py-4">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="text-md font-medium text-gray-900">
                                    {formatearNombreGrado(grado.nombre_grado)}
                                  </h3>
                                  <p className="text-sm text-gray-500 mt-1">
                                    Nivel: {grado.Niveles ? 
                                      grado.Niveles.nombre_nivel.charAt(0).toUpperCase() + grado.Niveles.nombre_nivel.slice(1) : 
                                      'No especificado'}
                                  </p>
                              </div>
                              
                              <div className="flex space-x-2">
                                <Link
                                  to={`/admin/academico/grados/${grado.id}/editar`}
                                  className="text-indigo-600 hover:text-indigo-800"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <FaEdit />
                                </Link>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    confirmDelete(grado);
                                  }}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  <FaTrash />
                                </button>
                              </div>
                            </div>
                            
                            <div className="mt-2 flex items-center text-sm">
                              <div className="flex items-center text-green-600 mr-4">
                                <FaUsers className="mr-1" />
                                <span>{cupoInfo.ocupados} estudiantes</span>
                              </div>
                              
                              <div className={`flex items-center ${
                                cupoInfo.disponibles > 0 ? 'text-blue-600' : 'text-red-600'
                              }`}>
                                <span>{cupoInfo.disponibles} cupos disponibles</span>
                              </div>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>
            
            {/* Detalles del grado seleccionado */}
            <div className="md:w-2/3">
              {selectedGrado ? (
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 border-b">
                    <h2 className="text-lg font-medium text-gray-800">
                      {formatearNombreGrado(selectedGrado.nombre_grado)}
                    </h2>
                  </div>
                  
                  {/* Tabs de navegación */}
                  <div className="border-b border-gray-200">
                    <nav className="flex -mb-px">
                      <button
                        onClick={() => setActiveTab('info')}
                        className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                          activeTab === 'info'
                            ? 'border-indigo-500 text-indigo-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <FaEye className="inline mr-2" />
                        Información
                      </button>
                      
                      <button
                        onClick={() => setActiveTab('estudiantes')}
                        className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                          activeTab === 'estudiantes'
                            ? 'border-indigo-500 text-indigo-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <FaUserGraduate className="inline mr-2" />
                        Estudiantes
                      </button>
                      
                      <button
                        onClick={() => setActiveTab('profesores')}
                        className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                          activeTab === 'profesores'
                            ? 'border-indigo-500 text-indigo-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <FaChalkboardTeacher className="inline mr-2" />
                        Profesores
                      </button>
                      
                      <button
                        onClick={() => setActiveTab('materias')}
                        className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                          activeTab === 'materias'
                            ? 'border-indigo-500 text-indigo-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <FaBook className="inline mr-2" />
                        Materias
                      </button>
                    </nav>
                  </div>
                  
                  {/* Contenido según la pestaña activa */}
                  <div className="p-6">
                    {loadingDetails ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
                      </div>
                    ) : (
                      <>
                        {/* Información general */}
                        {activeTab === 'info' && (
                          <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Información General</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <h4 className="text-sm font-medium text-gray-500">Nombre del Grado</h4>
                                <p className="mt-1 text-sm text-gray-900">{formatearNombreGrado(selectedGrado.nombre_grado)}</p>
                              </div>
                              
                              <div>
                                <h4 className="text-sm font-medium text-gray-500">Nivel</h4>
                                <p className="mt-1 text-sm text-gray-900">{selectedGrado.nivel || 'No especificado'}</p>
                              </div>
                              
                              <div>
                                <h4 className="text-sm font-medium text-gray-500">Cantidad de Estudiantes</h4>
                                <p className="mt-1 text-sm text-gray-900">{estudiantes.length}</p>
                              </div>
                              
                              <div>
                                <h4 className="text-sm font-medium text-gray-500">Cantidad de Materias</h4>
                                <p className="mt-1 text-sm text-gray-900">{materias.length}</p>
                              </div>
                              
                              <div>
                                <h4 className="text-sm font-medium text-gray-500">Cantidad de Profesores</h4>
                                <p className="mt-1 text-sm text-gray-900">{profesores.length}</p>
                              </div>
                            </div>
                            
                            <div className="mt-6">
                              <h4 className="text-sm font-medium text-gray-500 mb-2">Cupos</h4>
                              <div className="bg-gray-50 p-4 rounded-md">
                                <div className="grid grid-cols-3 gap-4">
                                  <div>
                                    <span className="block text-sm text-gray-500">Capacidad Total</span>
                                    <span className="text-lg font-medium text-gray-900">
                                      {cupos[selectedGrado.id]?.capacidad || 0}
                                    </span>
                                  </div>
                                  
                                  <div>
                                    <span className="block text-sm text-gray-500">Ocupados</span>
                                    <span className="text-lg font-medium text-gray-900">
                                      {cupos[selectedGrado.id]?.ocupados || 0}
                                    </span>
                                  </div>
                                  
                                  <div>
                                    <span className="block text-sm text-gray-500">Disponibles</span>
                                    <span className="text-lg font-medium text-gray-900">
                                      {cupos[selectedGrado.id]?.disponibles || 0}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="mt-6 flex space-x-4">
                              <Link
                                to={`/admin/academico/grados/${selectedGrado.id}/editar`}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                              >
                                <FaEdit className="mr-2" /> Editar Grado
                              </Link>
                              
                              <Link
                                to={`/admin/cupos`}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
                              >
                                Gestionar Cupos
                              </Link>
                            </div>
                          </div>
                        )}
                        
                        {/* Lista de estudiantes */}
                        {activeTab === 'estudiantes' && (
                          <div>
                            <div className="flex justify-between items-center mb-4">
                              <h3 className="text-lg font-medium text-gray-900">Estudiantes</h3>
                              
                              <Link
                                to={`/admin/academico/grados/${selectedGrado.id}/asignar-estudiante`}
                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                              >
                                Asignar Estudiante
                              </Link>
                            </div>
                            
                            {estudiantes.length === 0 ? (
                              <div className="bg-gray-50 p-4 text-center rounded-md">
                                <p className="text-gray-500">No hay estudiantes asignados a este grado.</p>
                              </div>
                            ) : (
                              <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                  <thead className="bg-gray-50">
                                    <tr>
                                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Nombre
                                      </th>
                                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Cédula
                                      </th>
                                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Fecha Nacimiento
                                      </th>
                                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Acciones
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="bg-white divide-y divide-gray-200">
                                    {estudiantes.map(estudiante => (
                                      <tr key={estudiante.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                          <div className="text-sm font-medium text-gray-900">
                                            {estudiante.nombre} {estudiante.apellido}
                                          </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                          <div className="text-sm text-gray-500">{estudiante.cedula}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                          <div className="text-sm text-gray-500">
                                            {new Date(estudiante.fechaNacimiento).toLocaleDateString()}
                                          </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                          <div className="flex space-x-3">
                                            <Link
                                              to={`/admin/estudiantes/${estudiante.id}`}
                                              className="text-indigo-600 hover:text-indigo-900"
                                            >
                                              <FaEye />
                                            </Link>
                                            
                                            <button
                                              onClick={async () => {
                                                if (window.confirm(`¿Está seguro de eliminar a ${estudiante.nombre} ${estudiante.apellido} de este grado?`)) {
                                                  try {
                                                    await axios.delete(
                                                      `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/grados/${selectedGrado.id}/estudiantes/${estudiante.id}/${annoEscolar.id}`,
                                                      { headers: { 'Authorization': `Bearer ${token}` } }
                                                    );
                                                    
                                                    // Actualizar la lista de estudiantes
                                                    setEstudiantes(estudiantes.filter(e => e.id !== estudiante.id));
                                                    
                                                    setSuccessMessage(`Estudiante eliminado del grado correctamente.`);
                                                    setTimeout(() => setSuccessMessage(''), 3000);
                                                  } catch (error) {
                                                    console.error('Error al eliminar estudiante del grado:', error);
                                                    setError('No se pudo eliminar el estudiante del grado.');
                                                  }
                                                }
                                              }}
                                              className="text-red-600 hover:text-red-900"
                                            >
                                              <FaTrash />
                                            </button>
                                          </div>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {/* Lista de profesores */}
                        {activeTab === 'profesores' && (
                          <div>
                            <div className="flex justify-between items-center mb-4">
                              <h3 className="text-lg font-medium text-gray-900">Profesores</h3>
                              
                              <Link
                                to={`/admin/academico/grados/${selectedGrado.id}/asignar-profesor`}
                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                              >
                                Asignar Profesor
                              </Link>
                            </div>
                            
                            {profesores.length === 0 ? (
                              <div className="bg-gray-50 p-4 text-center rounded-md">
                                <p className="text-gray-500">No hay profesores asignados a este grado.</p>
                              </div>
                            ) : (
                              <div className="space-y-6">
                                {profesores.map(profesor => (
                                  <div key={profesor.id} className="bg-gray-50 p-4 rounded-md">
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <h4 className="text-md font-medium text-gray-900">
                                          {profesor.nombre} {profesor.apellido}
                                        </h4>
                                        <p className="text-sm text-gray-500 mt-1">
                                          Cédula: {profesor.cedula}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                          Contacto: {profesor.email || 'No disponible'} | {profesor.telefono || 'No disponible'}
                                        </p>
                                      </div>
                                      
                                      <div className="flex space-x-2">
                                        <Link
                                          to={`/admin/profesores/${profesor.id}`}
                                          className="text-indigo-600 hover:text-indigo-900"
                                        >
                                          <FaEye />
                                        </Link>
                                        
                                        <button
                                          onClick={async () => {
                                            if (window.confirm(`¿Está seguro de eliminar al profesor ${profesor.nombre} ${profesor.apellido} de este grado?`)) {
                                              try {
                                                await axios.delete(
                                                  `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/grados/${selectedGrado.id}/profesores/${profesor.id}/${annoEscolar.id}`,
                                                  { headers: { 'Authorization': `Bearer ${token}` } }
                                                );
                                                
                                                // Actualizar la lista de profesores
                                                setProfesores(profesores.filter(p => p.id !== profesor.id));
                                                
                                                setSuccessMessage(`Profesor eliminado del grado correctamente.`);
                                                setTimeout(() => setSuccessMessage(''), 3000);
                                              } catch (error) {
                                                console.error('Error al eliminar profesor del grado:', error);
                                                setError('No se pudo eliminar el profesor del grado.');
                                              }
                                            }
                                          }}
                                          className="text-red-600 hover:text-red-900"
                                        >
                                          <FaTrash />
                                        </button>
                                      </div>
                                    </div>
                                    
                                    {/* Materias asignadas al profesor */}
                                    {profesor.materiasAsignadas && profesor.materiasAsignadas.length > 0 && (
                                      <div className="mt-3">
                                        <h5 className="text-sm font-medium text-gray-700 mb-2">Materias asignadas:</h5>
                                        <div className="flex flex-wrap gap-2">
                                          {profesor.materiasAsignadas.map(materia => (
                                            <span 
                                              key={materia.id} 
                                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                            >
                                              {materia.asignatura}
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                        
                        {/* Lista de materias */}
                        {activeTab === 'materias' && (
                          <div>
                            <div className="flex justify-between items-center mb-4">
                              <h3 className="text-lg font-medium text-gray-900">Materias ({materias.length})</h3>
                              
                              <Link
                                to={`/admin/academico/grados/${selectedGrado.id}/asignar-materia`}
                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                              >
                                Asignar Materia
                              </Link>
                            </div>
                            
                            {materias.length === 0 ? (
                              <div className="bg-gray-50 p-4 text-center rounded-md">
                                <p className="text-gray-500">No hay materias asignadas a este grado.</p>
                              </div>
                            ) : (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto">
                                {materias.map(materia => (
                                  <div key={materia.id} className="bg-gray-50 p-4 rounded-md">
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <h4 className="text-md font-medium text-gray-900">
                                          {materia.asignatura || materia.asignatura}
                                        </h4>
                                        <p className="text-sm text-gray-500 mt-1">
                                          Código: {materia.codigo || materia.id || 'No disponible'}
                                        </p>
                                        {materia.descripcion && (
                                          <p className="text-sm text-gray-500 mt-1">
                                            {materia.descripcion}
                                          </p>
                                        )}
                                      </div>
                                      
                                      <div className="flex space-x-2">
                                        <Link
                                          to={`/admin/academico/materias/${materia.id}`}
                                          className="text-indigo-600 hover:text-indigo-900"
                                        >
                                          <FaEye />
                                        </Link>
                                        
                                        <button
                                          onClick={async () => {
                                            if (window.confirm(`¿Está seguro de eliminar la materia ${materia.asignatura || materia.asignatura} de este grado?`)) {
                                              try {
                                                await axios.delete(
                                                  `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/grados/${selectedGrado.id}/materias/${materia.id}`,
                                                  { headers: { 'Authorization': `Bearer ${token}` } }
                                                );
                                                
                                                // Actualizar la lista de materias
                                                setMaterias(materias.filter(m => m.id !== materia.id));
                                                
                                                setSuccessMessage(`Materia eliminada del grado correctamente.`);
                                                setTimeout(() => setSuccessMessage(''), 3000);
                                              } catch (error) {
                                                console.error('Error al eliminar materia del grado:', error);
                                                setError('No se pudo eliminar la materia del grado.');
                                              }
                                            }
                                          }}
                                          className="text-red-600 hover:text-red-900"
                                        >
                                          <FaTrash />
                                        </button>
                                      </div>
                                    </div>
                                    
                                    {/* Profesores asignados a esta materia */}
                                    {materia.profesoresAsignados && materia.profesoresAsignados.length > 0 && (
                                      <div className="mt-3">
                                        <h5 className="text-sm font-medium text-gray-700 mb-2">Profesores asignados:</h5>
                                        <div className="flex flex-wrap gap-2">
                                          {materia.profesoresAsignados.map(profesor => (
                                            <span 
                                              key={profesor.id} 
                                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                                            >
                                              {profesor.nombre} {profesor.apellido}
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                  <p className="text-gray-500">Seleccione un grado para ver sus detalles.</p>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Modal de confirmación para eliminar grado */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Confirmar eliminación</h3>
              <p className="text-sm text-gray-500 mb-4">
                ¿Está seguro de eliminar el grado {formatearNombreGrado(gradoToDelete.nombre_grado)}? Esta acción no se puede deshacer.
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setGradoToDelete(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDeleteGrado}
                  disabled={deleteLoading}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  {deleteLoading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Eliminando...
                    </span>
                  ) : 'Eliminar'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
     
  );
};

export default GradosList;

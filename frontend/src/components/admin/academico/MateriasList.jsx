import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FaEdit, FaTrash, FaPlus, FaUserPlus, FaLayerGroup, FaChalkboardTeacher, FaTimes, FaFilter, FaSearch } from 'react-icons/fa';
import { getMateriaStyles, MateriaIcon, MateriaTag, MateriaCard } from '../../../utils/materiaStyles';

const MateriasList = () => {
  const [materias, setMaterias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedMateria, setSelectedMateria] = useState(null);
  const [grados, setGrados] = useState([]);
  const [loadingMateriasGrado, setLoadingMateriasGrado] = useState(false);
  const [profesores, setProfesores] = useState([]);
  const [secciones, setSecciones] = useState([]);
  const [annoEscolar, setAnnoEscolar] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredMaterias, setFilteredMaterias] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  // Estados para modales
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAsignGradoModal, setShowAsignGradoModal] = useState(false);
  const [showAsignProfesorModal, setShowAsignProfesorModal] = useState(false);
  const [showAsignSeccionModal, setShowAsignSeccionModal] = useState(false);
  
  // Estados para formularios
  const [newMateria, setNewMateria] = useState({
    asignatura: ''
  });
  
  const [asignGradoForm, setAsignGradoForm] = useState({
    gradoID: '',
    annoEscolarID: ''
  });
  
  const [asignProfesorForm, setAsignProfesorForm] = useState({
    profesorID: '',
    gradoID: '',
    annoEscolarID: ''
  });
  
  const [asignSeccionForm, setAsignSeccionForm] = useState({
    seccionID: '',
    annoEscolarID: ''
  });

  // Nuevo estado para filtros
  const [gradoFilter, setGradoFilter] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'list' o 'grid'
  
  const token = localStorage.getItem('token');
  
  // Cargar datos iniciales
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        
        // Obtener año escolar activo
        const annoResponse = await axios.get(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/anno-escolar/actual`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        setAnnoEscolar(annoResponse.data);
        
        // Obtener todas las materias
        const materiasResponse = await axios.get(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/materias`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        setMaterias(materiasResponse.data);
        setFilteredMaterias(materiasResponse.data);
        
        // Obtener todos los grados
        const gradosResponse = await axios.get(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/grados`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        setGrados(gradosResponse.data);
        
        // Obtener todos los profesores
        const profesoresResponse = await axios.get(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/personas`,
          { 
            headers: { 'Authorization': `Bearer ${token}` },
            params: { tipo: 'profesor' }  // Usar parámetros de consulta
          }
        );
        
        // Asegurarse de que profesores sea siempre un array
        if (Array.isArray(profesoresResponse.data)) {
          setProfesores(profesoresResponse.data.filter(p => p.tipo === 'profesor'));
        } else if (profesoresResponse.data && typeof profesoresResponse.data === 'object') {
          if (profesoresResponse.data.tipo === 'profesor') {
            setProfesores([profesoresResponse.data]);
          } else {
            setProfesores([]);
          }
        } else {
          setProfesores([]);
        }
        
        // Obtener todas las secciones
        const seccionesResponse = await axios.get(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/secciones`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        setSecciones(seccionesResponse.data);
        
        setLoading(false);
      } catch (err) {
        console.error('Error al cargar datos iniciales:', err);
        setError('Error al cargar datos. Por favor, recargue la página.');
        setLoading(false);
      }
    };
    
    fetchInitialData();
  }, [token]);
  

  // Efecto para filtrar materias cuando cambia el filtro de grado
  useEffect(() => {
    const filterMateriasByGrado = async () => {
      if (gradoFilter === '') {
        // Si no hay filtro de grado, mostrar todas las materias
        setFilteredMaterias(
          searchTerm.trim() === '' 
            ? materias 
            : materias.filter(materia => 
                materia.asignatura.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (materia.id && materia.id.toString().toLowerCase().includes(searchTerm.toLowerCase()))
              )
        );
      } else {
        // Si hay filtro de grado, cargar las materias de ese grado
        setLoading(true);
        try {
          const materiasByGrado = await loadMateriasByGrado(gradoFilter);
          
          // Aplicar también el filtro de búsqueda si existe
          const filtered = searchTerm.trim() === ''
            ? materiasByGrado
            : materiasByGrado.filter(materia =>
                materia.asignatura.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (materia.id && materia.id.toString().toLowerCase().includes(searchTerm.toLowerCase()))
              );
              
          setFilteredMaterias(filtered);
        } catch (error) {
          console.error("Error al filtrar materias por grado:", error);
          setError("Error al filtrar materias por grado");
        } finally {
          setLoading(false);
        }
      }
    };
    
    if (annoEscolar) {
      filterMateriasByGrado();
    }
  }, [gradoFilter, searchTerm, materias, annoEscolar]);
    
  
  // Función para crear una nueva materia
  const handleCreateMateria = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/materias`,
        newMateria,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      setMaterias([...materias, response.data]);
      setSuccessMessage('Materia creada correctamente');
      setShowCreateModal(false);
      setNewMateria({
        asignatura: ''
      });
      
      setTimeout(() => setSuccessMessage(''), 3000);
      setLoading(false);
    } catch (err) {
      console.error('Error al crear materia:', err);
      setError(err.response?.data?.message || 'Error al crear la materia');
      setLoading(false);
    }
  };
  
  // Función para asignar materia a un grado
  const handleAsignGrado = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/materias/asignar-a-grado`,
        {
          materiaID: selectedMateria.id,
          gradoID: asignGradoForm.gradoID,
          annoEscolarID: asignGradoForm.annoEscolarID || annoEscolar.id
        },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      setSuccessMessage(`Materia asignada al grado correctamente`);
      setShowAsignGradoModal(false);
      setAsignGradoForm({
        gradoID: '',
        annoEscolarID: ''
      });

      if (gradoFilter === asignGradoForm.gradoID) {
        const materiasByGrado = await loadMateriasByGrado(gradoFilter);
        setFilteredMaterias(materiasByGrado);
      }
      
      
      setTimeout(() => setSuccessMessage(''), 3000);
      setLoading(false);
    } catch (err) {
      console.error('Error al asignar materia a grado:', err);
      setError(err.response?.data?.message || 'Error al asignar la materia al grado');
      setLoading(false);
    }
  };
  
  // Función para asignar profesor a una materia
  const handleAsignProfesor = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/materias/asignar-profesor`,
        {
          profesorID: asignProfesorForm.profesorID,
          materiaID: selectedMateria.id,
          gradoID: asignProfesorForm.gradoID,
          annoEscolarID: asignProfesorForm.annoEscolarID || annoEscolar.id
        },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      setSuccessMessage(`Profesor asignado a la materia correctamente`);
      setShowAsignProfesorModal(false);
      setAsignProfesorForm({
        profesorID: '',
        gradoID: '',
        annoEscolarID: ''
      });
      
      setTimeout(() => setSuccessMessage(''), 3000);
      setLoading(false);
    } catch (err) {
      console.error('Error al asignar profesor a materia:', err);
      setError(err.response?.data?.message || 'Error al asignar el profesor a la materia');
      setLoading(false);
    }
  };
  
  // Función para asignar materia a una sección
  const handleAsignSeccion = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/materias/asignar-a-seccion`,
        {
          materiaID: selectedMateria.id,
          seccionID: asignSeccionForm.seccionID,
          annoEscolarID: asignSeccionForm.annoEscolarID || annoEscolar.id
        },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      setSuccessMessage(`Materia asignada a la sección correctamente`);
      setShowAsignSeccionModal(false);
      setAsignSeccionForm({
        seccionID: '',
        annoEscolarID: ''
      });
      
      setTimeout(() => setSuccessMessage(''), 3000);
      setLoading(false);
    } catch (err) {
      console.error('Error al asignar materia a sección:', err);
      setError(err.response?.data?.message || 'Error al asignar la materia a la sección');
      setLoading(false);
    }
  };
  
  // Función para eliminar una materia
  const handleDeleteMateria = async (materiaID) => {
    if (!window.confirm('¿Está seguro de eliminar esta materia? Esta acción no se puede deshacer.')) {
      return;
    }
    
    try {
      setLoading(true);
      
      await axios.delete(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/materias/${materiaID}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      setMaterias(materias.filter(materia => materia.id !== materiaID));
      setSuccessMessage('Materia eliminada correctamente');
      
      setTimeout(() => setSuccessMessage(''), 3000);
      setLoading(false);
    } catch (err) {
      console.error('Error al eliminar materia:', err);
      setError(err.response?.data?.message || 'Error al eliminar la materia');
      setLoading(false);
    }
  };

    // Nueva función para cargar materias por grado
    const loadMateriasByGrado = async (gradoID) => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/materias/grado/${gradoID}`,
          { 
            headers: { 'Authorization': `Bearer ${token}` },
            params: { 
              annoEscolarID: annoEscolar?.id,
              limit: 0
            }
          }
        );
        
        return response.data;
      } catch (err) {
        console.error('Error al cargar materias del grado:', err);
        return [];
      }
    };
  
  // Componente Modal personalizado
  const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div className="fixed inset-0 transition-opacity" aria-hidden="true">
            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
          </div>
          
          <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
          
          <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">{title}</h3>
                    <button
                      type="button"
                      className="text-gray-400 hover:text-gray-500"
                      onClick={onClose}
                    >
                      <FaTimes />
                    </button>
                  </div>
                  <div className="mt-4">
                    {children}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="relative">
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Gestión de Materias</h1>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md flex items-center justify-center"
          >
            <FaPlus className="mr-2" /> Nueva Materia
          </button>
          
          <div className="flex items-center">
            <button 
              onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
              className={`px-3 py-2 rounded-md ${viewMode === 'grid' ? 'bg-gray-200 text-gray-800' : 'bg-gray-100 text-gray-600'} mr-2`}
              title="Vista de cuadrícula"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button 
              onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
              className={`px-3 py-2 rounded-md ${viewMode === 'list' ? 'bg-gray-200 text-gray-800' : 'bg-gray-100 text-gray-600'}`}
              title="Vista de lista"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
        
      {/* Formulario desplegable */}
      {showCreateForm && (
        <div className="absolute left-0 mt-2 w-96 bg-white rounded-md shadow-lg z-10 p-4 border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Crear Nueva Materia</h3>
            <button 
              onClick={() => setShowCreateForm(false)}
              className="text-gray-400 hover:text-gray-500"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <form onSubmit={(e) => {
            e.preventDefault();
            handleCreateMateria(e);
            setShowCreateForm(false);
          }}>
            <div className="space-y-4">
              <div>
                <label htmlFor="asignatura" className="block text-sm font-medium text-gray-700">
                  Nombre de la Materia *
                </label>
                <input
                  type="text"
                  id="asignatura"
                  name="asignatura"
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={newMateria.asignatura}
                  onChange={(e) => setNewMateria({...newMateria, asignatura: e.target.value})}
                />
              </div>
            </div>
            <div className="mt-5 flex justify-end space-x-3">
              <button
                type="button"
                className="inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={() => setShowCreateForm(false)}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                disabled={loading}
              >
                {loading ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Mensajes de éxito o error */}
      {successMessage && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4 rounded">
          <p>{successMessage}</p>
        </div>
      )}
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded">
          <p>{error}</p>
        </div>
      )}
      
      {/* Filtros y búsqueda */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Buscar por nombre o código..."
            className="pl-10 w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaFilter className="h-5 w-5 text-gray-400" />
          </div>
          <select
            className="pl-10 w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={gradoFilter}
            onChange={(e) => setGradoFilter(e.target.value)}
          >
            <option value="">Todos los grados</option>
            {grados.map((grado) => (
              <option key={grado.id} value={grado.id}>
                {grado.nombre_grado}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Vista de cuadrícula */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {loading ? (
            <div className="col-span-full flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
            </div>
          ) : filteredMaterias.length === 0 ? (
            <div className="col-span-full py-8 text-center text-gray-500">
              No se encontraron materias con los filtros aplicados
            </div>
          ) : (
            filteredMaterias.map((materia) => {
              const { bgColor, textColor, borderColor, Icon } = getMateriaStyles(materia.asignatura);

              
              return (
                <div 
                  key={materia.id} 
                  className={`${bgColor} border ${borderColor} rounded-lg shadow-sm hover:shadow-md transition-shadow p-4`}
                >
                  <div className="flex items-center mb-3">
                    <div className={`p-2 rounded-full ${textColor} bg-white mr-3`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className={`font-semibold ${textColor}`}>{materia.asignatura}</h3>
                      <p className="text-xs text-gray-500">Código: {materia.id || 'N/A'}</p>
                    </div>
                  </div>
                  
                  {/* {gradosDeMateria.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs text-gray-600 mb-1">Impartida en:</p>
                      <div className="flex flex-wrap gap-1">
                        {gradosDeMateria.map(grado => (
                          <span 
                            key={grado.id} 
                            className="inline-block px-2 py-1 text-xs bg-white rounded-full text-gray-700"
                          >
                            {grado.nombre_grado}
                          </span>
                        ))}
                      </div>
                    </div>
                  )} */}
                  
                  <div className="flex justify-between mt-3 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => {
                        setSelectedMateria(materia);
                        setShowAsignGradoModal(true);
                      }}
                      className={`text-sm ${textColor} hover:underline flex items-center`}
                      title="Asignar a Grado"
                    >
                      <FaLayerGroup className="mr-1" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedMateria(materia);
                        setShowAsignProfesorModal(true);
                      }}
                      className={`text-sm ${textColor} hover:underline flex items-center`}
                      title="Asignar Profesor"
                    >
                      <FaUserPlus className="mr-1" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedMateria(materia);
                        setShowAsignSeccionModal(true);
                      }}
                      className={`text-sm ${textColor} hover:underline flex items-center`}
                      title="Asignar a Sección"
                    >
                      <FaChalkboardTeacher className="mr-1" />
                    </button>
                    <button
                      onClick={() => handleDeleteMateria(materia.id)}
                      className="text-sm text-red-600 hover:underline flex items-center"
                      title="Eliminar"
                    >
                      <FaTrash className="mr-1" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
      
      {/* Vista de tabla */}
      {viewMode === 'list' && (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Materia
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Código
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Grados
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredMaterias.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                    No se encontraron materias con los filtros aplicados
                  </td>
                </tr>
              ) : (
                filteredMaterias.map((materia) => {
                  const { textColor, Icon } = getMateriaStyles(materia.asignatura, 'icon');

                  
                  return (
                    <tr key={materia.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center">
                            <Icon className={`h-6 w-6 ${textColor}`} />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {materia.asignatura}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {materia.id || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-wrap gap-1">
                          {gradosDeMateria.length > 0 ? (
                            gradosDeMateria.map(grado => (
                              <span 
                                key={grado.id} 
                                className="inline-block px-2 py-1 text-xs bg-gray-100 rounded-full text-gray-700"
                              >
                                {grado.nombre_grado}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-gray-400">No asignada</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-3">
                          <button
                            onClick={() => {
                              setSelectedMateria(materia);
                              setShowAsignGradoModal(true);
                            }}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="Asignar a Grado"
                          >
                            <FaLayerGroup />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedMateria(materia);
                              setShowAsignProfesorModal(true);
                            }}
                            className="text-green-600 hover:text-green-900"
                            title="Asignar Profesor"
                          >
                            <FaUserPlus />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedMateria(materia);
                              setShowAsignSeccionModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                            title="Asignar a Sección"
                          >
                            <FaChalkboardTeacher />
                          </button>
                          <button
                            onClick={() => handleDeleteMateria(materia.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Eliminar"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Modal para asignar materia a grado */}
      <Modal
        isOpen={showAsignGradoModal}
        onClose={() => setShowAsignGradoModal(false)}
        title="Asignar Materia a Grado"
      >
        <form onSubmit={handleAsignGrado}>
          {selectedMateria && (
            <div className="mb-4">
              <p className="text-sm text-gray-500">
                Materia: 
              </p>
              <div className="flex items-center mt-1">
                <MateriaIcon nombreMateria={selectedMateria.asignatura} size="1.5em" className="mr-2" />
                <span className="font-medium">{selectedMateria.asignatura}</span>
              </div>
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label htmlFor="gradoID" className="block text-sm font-medium text-gray-700">
                Grado *
              </label>
              <select
                id="gradoID"
                name="gradoID"
                required
                className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={asignGradoForm.gradoID}
                onChange={(e) => setAsignGradoForm({...asignGradoForm, gradoID: e.target.value})}
              >
                <option value="">Seleccione un grado</option>
                {grados.map((grado) => (
                  <option key={grado.id} value={grado.id}>
                    {grado.nombre_grado}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="annoEscolarID" className="block text-sm font-medium text-gray-700">
                Año Escolar
              </label>
              <input
                type="text"
                id="annoEscolarID"
                name="annoEscolarID"
                className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-gray-100 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={annoEscolar ? annoEscolar.periodo : 'Cargando...'}
                disabled
              />
            </div>
          </div>
          <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
            <button
              type="submit"
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:col-start-2 sm:text-sm"
              disabled={loading}
            >
              {loading ? 'Asignando...' : 'Asignar'}
            </button>
            <button
              type="button"
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
              onClick={() => setShowAsignGradoModal(false)}
            >
              Cancelar
            </button>
          </div>
        </form>
      </Modal>
      
      {/* Modal para asignar profesor a materia */}
      <Modal
        isOpen={showAsignProfesorModal}
        onClose={() => setShowAsignProfesorModal(false)}
        title="Asignar Profesor a Materia"
      >
        <form onSubmit={handleAsignProfesor}>
          {selectedMateria && (
            <div className="mb-4">
              <p className="text-sm text-gray-500">
                Materia: 
              </p>
              <div className="flex items-center mt-1">
                <MateriaIcon nombreMateria={selectedMateria.asignatura} size="1.5em" className="mr-2" />
                <span className="font-medium">{selectedMateria.asignatura}</span>
              </div>
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label htmlFor="profesorID" className="block text-sm font-medium text-gray-700">
                Profesor *
              </label>
              <select
                id="profesorID"
                name="profesorID"
                required
                className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={asignProfesorForm.profesorID}
                onChange={(e) => setAsignProfesorForm({...asignProfesorForm, profesorID: e.target.value})}
              >
                <option value="">Seleccione un profesor</option>
                {Array.isArray(profesores) && profesores.length > 0 ? (
                  profesores.map((profesor) => (
                    <option key={profesor.id} value={profesor.id}>
                      {profesor.nombre} {profesor.apellido}
                    </option>
                  ))
                ) : (
                  <option value="">No hay profesores disponibles</option>
                )}
              </select>
            </div>
            <div>
              <label htmlFor="gradoID" className="block text-sm font-medium text-gray-700">
                Grado *
              </label>
              <select
                id="gradoID"
                name="gradoID"
                required
                className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={asignProfesorForm.gradoID}
                onChange={(e) => setAsignProfesorForm({...asignProfesorForm, gradoID: e.target.value})}
              >
                <option value="">Seleccione un grado</option>
                {grados.map((grado) => (
                  <option key={grado.id} value={grado.id}>
                    {grado.nombre_grado}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="annoEscolarID" className="block text-sm font-medium text-gray-700">
                Año Escolar
              </label>
              <input
                type="text"
                id="annoEscolarID"
                name="annoEscolarID"
                className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-gray-100 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={annoEscolar ? annoEscolar.periodo : 'Cargando...'}
                disabled
              />
            </div>
          </div>
          <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
            <button
              type="submit"
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:col-start-2 sm:text-sm"
              disabled={loading}
            >
              {loading ? 'Asignando...' : 'Asignar'}
            </button>
            <button
              type="button"
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
              onClick={() => setShowAsignProfesorModal(false)}
            >
              Cancelar
            </button>
          </div>
        </form>
      </Modal>
      
      {/* Modal para asignar materia a sección */}
      <Modal
        isOpen={showAsignSeccionModal}
        onClose={() => setShowAsignSeccionModal(false)}
        title="Asignar Materia a Sección"
      >
        <form onSubmit={handleAsignSeccion}>
          {selectedMateria && (
            <div className="mb-4">
              <p className="text-sm text-gray-500">
                Materia: 
              </p>
              <div className="flex items-center mt-1">
                <MateriaIcon nombreMateria={selectedMateria.asignatura} size="1.5em" className="mr-2" />
                <span className="font-medium">{selectedMateria.asignatura}</span>
              </div>
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label htmlFor="seccionID" className="block text-sm font-medium text-gray-700">
                Sección *
              </label>
              <select
                id="seccionID"
                name="seccionID"
                required
                className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={asignSeccionForm.seccionID}
                onChange={(e) => setAsignSeccionForm({...asignSeccionForm, seccionID: e.target.value})}
              >
                <option value="">Seleccione una sección</option>
                {secciones.map((seccion) => (
                  <option key={seccion.id} value={seccion.id}>
                    {seccion.nombre_seccion} - {grados.find(g => g.id === seccion.gradoID)?.nombre_grado || 'Sin grado'}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="annoEscolarID" className="block text-sm font-medium text-gray-700">
                Año Escolar
              </label>
              <input
                type="text"
                id="annoEscolarID"
                name="annoEscolarID"
                className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-gray-100 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={annoEscolar ? annoEscolar.periodo : 'Cargando...'}
                disabled
              />
            </div>
          </div>
          <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
            <button
              type="submit"
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:col-start-2 sm:text-sm"
              disabled={loading}
            >
              {loading ? 'Asignando...' : 'Asignar'}
            </button>
            <button
              type="button"
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
              onClick={() => setShowAsignSeccionModal(false)}
            >
              Cancelar
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default MateriasList;

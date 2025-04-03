import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaEdit, FaTrash, FaArrowLeft, FaPlus, FaFileAlt, FaBook, FaChalkboardTeacher, FaUserGraduate, FaTimes } from 'react-icons/fa';
import { formatearFecha } from '../../../utils/formatters';
import AdminLayout from '../layout/AdminLayout';

const ProfesorDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profesor, setProfesor] = useState(null);
  const [materias, setMaterias] = useState([]);
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [grados, setGrados] = useState([]);
  const [gradoSeleccionado, setGradoSeleccionado] = useState('');
  const [materiasPorGrado, setMateriasPorGrado] = useState([]);

  const [documentos, setDocumentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('info');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [annoEscolar, setAnnoEscolar] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Estados para modales
  const [showAsignMateriaModal, setShowAsignMateriaModal] = useState(false);
  const [showAsignGradoModal, setShowAsignGradoModal] = useState(false);
  
  // Estados para formularios
  const [asignMateriaForm, setAsignMateriaForm] = useState({
    materiaID: '',
    gradoID: '',
    annoEscolarID: ''
  });
  
  const [asignGradoForm, setAsignGradoForm] = useState({
    gradoID: '',
    annoEscolarID: ''
  });
  
  // Estados para listas de opciones
  const [materiasDisponibles, setMateriasDisponibles] = useState([]);
  const [gradosDisponibles, setGradosDisponibles] = useState([]);

  const token = localStorage.getItem('token');

// 
useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Obtener año escolar actual
        const annoResponse = await axios.get(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/anno-escolar/actual`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        setAnnoEscolar(annoResponse.data);
        
        // Obtener datos del profesor
        const profesorResponse = await axios.get(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/personas/${id}`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        
        if (profesorResponse.data.tipo !== 'profesor') {
          throw new Error('La persona seleccionada no es un profesor');
        }
        
        setProfesor(profesorResponse.data);
        
        // Obtener materias asignadas al profesor (usando la ruta correcta)
        const materiasResponse = await axios.get(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/materias/profesor/${id}`,
          { 
            headers: { 'Authorization': `Bearer ${token}` },
            params: { annoEscolarID: annoResponse.data.id }
          }
        );
        setMaterias(Array.isArray(materiasResponse.data) ? materiasResponse.data : []);
        
        // Obtener evaluaciones creadas por el profesor
        const evaluacionesResponse = await axios.get(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/evaluaciones/profesor/${id}?annoEscolarID=${annoResponse.data.id}`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        setEvaluaciones(Array.isArray(evaluacionesResponse.data) ? evaluacionesResponse.data : []);
        
        // Obtener grados asignados al profesor
        const gradosResponse = await axios.get(
            `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/grados/profesor/${id}`,
            { 
              headers: { 'Authorization': `Bearer ${token}` },
              params: { annoEscolarID: annoResponse.data.id }
            }
          );
          
          console.log('Grados del profesor:', gradosResponse.data);
          
          if (Array.isArray(gradosResponse.data)) {
            setGrados(gradosResponse.data);
          } else {
            console.error('La respuesta de grados no es un array:', gradosResponse.data);
            setGrados([]);
          }
        
        // Obtener documentos del profesor
        const documentosResponse = await axios.get(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/documentos/persona/${id}`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        setDocumentos(Array.isArray(documentosResponse.data) ? documentosResponse.data : []);
        
        // Obtener todas las materias disponibles para asignar
        const todasMateriasResponse = await axios.get(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/materias`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        setMateriasDisponibles(Array.isArray(todasMateriasResponse.data) ? todasMateriasResponse.data : []);
        
        // Obtener todos los grados disponibles para asignar
        const todosGradosResponse = await axios.get(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/grados`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        setGradosDisponibles(Array.isArray(todosGradosResponse.data) ? todosGradosResponse.data : []);
        
        setLoading(false);
      } catch (err) {
        console.error('Error al cargar datos del profesor:', err);
        setError(err.response?.data?.message || 'Error al cargar los datos del profesor. Por favor, intente nuevamente.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id, token]);
  
  
  const handleDelete = async () => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/personas/${id}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      navigate('/admin/profesores', { 
        state: { message: 'Profesor eliminado correctamente' } 
      });
    } catch (err) {
      console.error('Error al eliminar profesor:', err);
      setError('Error al eliminar el profesor. Por favor, intente nuevamente.');
    }
  };

  // Función para asignar materia a profesor
  const handleAsignarMateria = async (e) => {
    e.preventDefault();
    
    if (!gradoSeleccionado || !asignMateriaForm.materiaID) {
      setError('Por favor, seleccione un grado y una materia');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('token');
      
      // Asignar materia al profesor
      await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/materias/asignar-profesor`,
        {
          profesorID: id,
          materiaID: asignMateriaForm.materiaID,
          gradoID: gradoSeleccionado,
          annoEscolarID: annoEscolar.id
        },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      // Actualizar lista de materias
      const materiasResponse = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/materias/profesor/${id}`,
        { 
          headers: { 'Authorization': `Bearer ${token}` },
          params: { annoEscolarID: annoEscolar.id }
        }
      );
      
      setMaterias(Array.isArray(materiasResponse.data) ? materiasResponse.data : []);
      
      // Cerrar modal y limpiar formulario
      setShowAsignMateriaModal(false);
      setAsignMateriaForm({ materiaID: '', gradoID: '' });
      setGradoSeleccionado('');
      setMateriasPorGrado([]);
      
      setSuccessMessage('Materia asignada correctamente');
      setTimeout(() => setSuccessMessage(''), 3000);
      
      setLoading(false);
    } catch (err) {
      console.error('Error al asignar materia:', err);
      setError(err.response?.data?.message || 'Error al asignar la materia. Por favor, intente nuevamente.');
      setLoading(false);
    }
  };
  
  
  // Función para asignar grado a profesor
  const handleAsignarGrado = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/grados/${asignGradoForm.gradoID}/asignar-profesor`,
        {
          profesorID: id,
          annoEscolarID: asignGradoForm.annoEscolarID || annoEscolar.id
        },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      // Recargar los grados
      const gradosResponse = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/grados/profesor/${id}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      setGrados(Array.isArray(gradosResponse.data) ? gradosResponse.data : []);
      
      setSuccessMessage('Grado asignado correctamente');
      setShowAsignGradoModal(false);
      setAsignGradoForm({
        gradoID: '',
        annoEscolarID: ''
      });
      
      setTimeout(() => setSuccessMessage(''), 3000);
      setLoading(false);
    } catch (err) {
      console.error('Error al asignar grado:', err);
      setError(err.response?.data?.message || 'Error al asignar el grado. Por favor, intente nuevamente.');
      setLoading(false);
    }
  };
  
  // Función para eliminar materia asignada
  const handleEliminarMateria = async (materiaID, gradoID) => {
    if (!window.confirm('¿Está seguro de eliminar esta asignación? Esta acción no se puede deshacer.')) {
      return;
    }
    
    try {
      setLoading(true);
      
      await axios.delete(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/materias/profesor/${id}/${materiaID}/${gradoID}/${annoEscolar.id}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      // Recargar las materias
      const materiasResponse = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/materias`,
        { 
          headers: { 'Authorization': `Bearer ${token}` },
          params: { profesorID: id }
        }
      );
      setMaterias(Array.isArray(materiasResponse.data) ? materiasResponse.data : []);
      
      setSuccessMessage('Asignación eliminada correctamente');
      setTimeout(() => setSuccessMessage(''), 3000);
      setLoading(false);
    } catch (err) {
      console.error('Error al eliminar asignación:', err);
      setError(err.response?.data?.message || 'Error al eliminar la asignación. Por favor, intente nuevamente.');
      setLoading(false);
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
          <p>{error}</p>
        </div>
        <Link
          to="/admin/profesores"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <FaArrowLeft className="mr-2" /> Volver a la lista
        </Link>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Botón de regreso */}
        <div className="mb-6 flex justify-between items-center">
          <Link
            to="/admin/profesores"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <FaArrowLeft className="mr-2" /> Volver a la lista
          </Link>
          
          <div className="flex space-x-2">
            <Link
              to={`/admin/profesores/editar/${id}`}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-yellow-600 hover:bg-yellow-700"
            >
              <FaEdit className="mr-2" /> Editar
            </Link>
            
            {!confirmDelete ? (
              <button
                onClick={() => setConfirmDelete(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700"
              >
                <FaTrash className="mr-2" /> Eliminar
              </button>
            ) : (
              <div className="flex space-x-2">
                <button
                  onClick={handleDelete}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700"
                >
                  Confirmar
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancelar
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Mensajes de éxito */}
        {successMessage && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4" role="alert">
            <p>{successMessage}</p>
          </div>
        )}
        
        {/* Información del profesor */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {profesor.nombre} {profesor.apellido}
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Profesor - {profesor.cedula}
              </p>
            </div>
            <div className="flex space-x-2">
              <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
                Activo
              </span>
            </div>
          </div>
          
          {/* Pestañas */}
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                className={`${
                  activeTab === 'info'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm mx-4`}
                onClick={() => setActiveTab('info')}
              >
                Información Personal
              </button>
              <button
                className={`${
                  activeTab === 'materias'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm mx-4`}
                onClick={() => setActiveTab('materias')}
              >
                Materias Asignadas
              </button>
              <button
                className={`${
                  activeTab === 'grados'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm mx-4`}
                onClick={() => setActiveTab('grados')}
              >
                Grados Asignados
              </button>
              <button
                className={`${
                  activeTab === 'evaluaciones'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm mx-4`}
                onClick={() => setActiveTab('evaluaciones')}
              >
                Evaluaciones
              </button>
              <button
                className={`${
                  activeTab === 'documentos'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm mx-4`}
                onClick={() => setActiveTab('documentos')}
              >
                Documentos
              </button>
            </nav>
          </div>
          
          {/* Contenido de las pestañas */}
          <div className="px-4 py-5 sm:p-6">
            {/* Información Personal */}
            {activeTab === 'info' && (
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <h4 className="text-sm font-medium text-gray-500">Cédula</h4>
                  <p className="mt-1 text-sm text-gray-900">{profesor.cedula}</p>
                </div>
                
                <div className="sm:col-span-3">
                  <h4 className="text-sm font-medium text-gray-500">Nombre Completo</h4>
                  <p className="mt-1 text-sm text-gray-900">{profesor.nombre} {profesor.apellido}</p>
                </div>
                
                <div className="sm:col-span-3">
                  <h4 className="text-sm font-medium text-gray-500">Fecha de Nacimiento</h4>
                  <p className="mt-1 text-sm text-gray-900">{formatearFecha(profesor.fechaNacimiento)}</p>
                </div>
                
                <div className="sm:col-span-3">
                  <h4 className="text-sm font-medium text-gray-500">Género</h4>
                  <p className="mt-1 text-sm text-gray-900">{profesor.genero === 'M' ? 'Masculino' : 'Femenino'}</p>
                </div>
                
                <div className="sm:col-span-3">
                  <h4 className="text-sm font-medium text-gray-500">Teléfono</h4>
                  <p className="mt-1 text-sm text-gray-900">{profesor.telefono || 'No especificado'}</p>
                </div>
                
                <div className="sm:col-span-3">
                  <h4 className="text-sm font-medium text-gray-500">Email</h4>
                  <p className="mt-1 text-sm text-gray-900">{profesor.email || 'No especificado'}</p>
                </div>
                
                <div className="sm:col-span-6">
                  <h4 className="text-sm font-medium text-gray-500">Dirección</h4>
                  <p className="mt-1 text-sm text-gray-900">{profesor.direccion || 'No especificada'}</p>
                </div>
                
                <div className="sm:col-span-6">
                  <h4 className="text-sm font-medium text-gray-500">Observaciones</h4>
                  <p className="mt-1 text-sm text-gray-900">{profesor.observaciones || 'No hay observaciones'}</p>
                </div>
              </div>
            )}
            
            {/* Materias Asignadas */}
            {activeTab === 'materias' && (
            <div>
                <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Materias Asignadas</h3>
                <button
                    onClick={() => setShowAsignMateriaModal(true)}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    <FaPlus className="mr-2" /> Asignar Materia
                </button>
                </div>
                
                {materias.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                    No hay materias asignadas a este profesor
                </div>
                ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {materias.map((materia) => (
                    <div key={`${materia.id}-${materia.gradoID || 'sin-grado'}`} className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="px-4 py-5 sm:p-6">
                        <div className="flex justify-between">
                            <div>
                            <h4 className="text-lg font-medium text-gray-900">
                                {materia.asignatura || materia.nombre}
                            </h4>
                            <p className="mt-1 text-sm text-gray-500">
                                Grado: {materia.Grado?.nombre_grado || materia.nombreGrado || 'No asignado'}
                            </p>
                            {materia.seccionNombre && (
                                <p className="text-sm text-gray-500">
                                Sección: {materia.seccionNombre}
                                </p>
                            )}
                            </div>
                            <div>
                            <button
                                onClick={() => handleEliminarMateria(materia.id, materia.gradoID || materia.Grado?.id)}
                                className="text-red-600 hover:text-red-900"
                                title="Eliminar asignación"
                            >
                                <FaTrash />
                            </button>
                            </div>
                        </div>
                        </div>
                        <div className="bg-gray-50 px-4 py-4 sm:px-6">
                        <div className="text-sm">
                            <Link
                            to={`/admin/academico/materias/${materia.id}`}
                            className="font-medium text-indigo-600 hover:text-indigo-500"
                            >
                            Ver detalles
                            </Link>
                        </div>
                        </div>
                    </div>
                    ))}
                </div>
                )}
            </div>
            )}

            {/* Grados Asignados */}
            {activeTab === 'grados' && (
            <div>
                <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Grados Asignados</h3>
                <button
                    onClick={() => setShowAsignGradoModal(true)}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    <FaPlus className="mr-2" /> Asignar Grado
                </button>
                </div>
                
                {grados.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">
                        No hay grados asignados a este profesor
                    </div>
                    ) : (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {grados.map((grado) => (
                        <div key={grado.id} className="bg-white overflow-hidden shadow rounded-lg">
                            <div className="px-4 py-5 sm:p-6">
                            <div className="flex justify-between">
                                <div>
                                <h4 className="text-lg font-medium text-gray-900">
                                    {grado.nombre_grado}
                                </h4>
                                {grado.Nivel && (
                                    <p className="mt-1 text-sm text-gray-500">
                                    Nivel: {grado.Nivel.nombre_nivel}
                                    </p>
                                )}
                                </div>
                                <div>
                                <button
                                    onClick={async () => {
                                    if (window.confirm(`¿Está seguro de eliminar la asignación de este grado?`)) {
                                        try {
                                        await axios.delete(
                                            `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/materias/profesor/${id}/${grado.id}/${annoEscolar.id}`,
                                            { headers: { 'Authorization': `Bearer ${token}` } }
                                        );
                                        
                                        // Actualizar la lista de grados
                                        setGrados(grados.filter(g => g.id !== grado.id));
                                        
                                        setSuccessMessage('Asignación eliminada correctamente');
                                        setTimeout(() => setSuccessMessage(''), 3000);
                                        } catch (error) {
                                        console.error('Error al eliminar asignación:', error);
                                        setError('Error al eliminar la asignación. Por favor, intente nuevamente.');
                                        }
                                    }
                                    }}
                                    className="text-red-600 hover:text-red-900"
                                    title="Eliminar asignación"
                                >
                                    <FaTrash />
                                </button>
                                </div>
                            </div>
                            
                            {/* Mostrar materias que imparte en este grado */}
                            {grado.materiasImpartidas && grado.materiasImpartidas.length > 0 && (
                                <div className="mt-4">
                                <h5 className="text-sm font-medium text-gray-700 mb-2">Materias que imparte:</h5>
                                <div className="flex flex-wrap gap-2">
                                    {grado.materiasImpartidas.map(materia => (
                                    <span 
                                        key={materia.id} 
                                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                    >
                                        {materia.asignatura || materia.nombre}
                                    </span>
                                    ))}
                                </div>
                                </div>
                            )}
                            </div>
                            <div className="bg-gray-50 px-4 py-4 sm:px-6">
                            <div className="text-sm">
                                <Link
                                to={`/admin/academico/grados/${grado.id}`}
                                className="font-medium text-indigo-600 hover:text-indigo-500"
                                >
                                Ver detalles
                                </Link>
                            </div>
                            </div>
                        </div>
                        ))}
                    </div>
                    )}
                </div>
                )}


            
            {/* Evaluaciones */}
            {activeTab === 'evaluaciones' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Evaluaciones</h3>
                  <Link
                    to={`/admin/evaluaciones/nueva?profesorID=${id}`}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <FaPlus className="mr-2" /> Nueva Evaluación
                  </Link>
                </div>
                
                {evaluaciones.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">
                    No hay evaluaciones registradas por este profesor
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
                            Tipo
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Materia
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Grado/Sección
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Fecha
                          </th>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Acciones
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {evaluaciones.map((evaluacion) => (
                          <tr key={evaluacion.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {evaluacion.nombreEvaluacion}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {evaluacion.tipoEvaluacion}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {evaluacion.Materias?.asignatura || 'No especificada'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {evaluacion.Grado?.nombre_grado || 'No especificado'} / {evaluacion.Seccion?.nombre_seccion || 'No especificada'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatearFecha(evaluacion.fechaEvaluacion)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <Link
                                to={`/admin/evaluaciones/${evaluacion.id}`}
                                className="text-indigo-600 hover:text-indigo-900 mr-4"
                              >
                                Ver
                              </Link>
                              <Link
                                to={`/admin/evaluaciones/editar/${evaluacion.id}`}
                                className="text-yellow-600 hover:text-yellow-900"
                              >
                                Editar
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
            
            {/* Documentos */}
            {activeTab === 'documentos' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Documentos</h3>
                  <Link
                    to={`/admin/documentos/subir?personaID=${id}&tipo=profesor`}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <FaPlus className="mr-2" /> Subir Documento
                  </Link>
                </div>
                
                {documentos.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">
                    No hay documentos subidos para este profesor
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {documentos.map((documento) => (
                      <div key={documento.id} className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="px-4 py-5 sm:p-6">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 bg-indigo-100 rounded-md p-3">
                              <FaFileAlt className="h-6 w-6 text-indigo-600" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                              <dl>
                                <dt className="text-sm font-medium text-gray-500 truncate">
                                  {documento.tipoDocumento}
                                </dt>
                                <dd>
                                  <div className="text-sm text-gray-900">
                                    {documento.nombre_archivo || 'Documento'}
                                  </div>
                                </dd>
                              </dl>
                            </div>
                          </div>
                        </div>
                        <div className="bg-gray-50 px-4 py-4 sm:px-6">
                          <div className="text-sm">
                            <a
                              href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${documento.urlDocumento}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-medium text-indigo-600 hover:text-indigo-500"
                            >
                              Ver documento
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
{/* Modal para asignar materia */}
<Modal
  isOpen={showAsignMateriaModal}
  onClose={() => {
    setShowAsignMateriaModal(false);
    setGradoSeleccionado('');
    setMateriasPorGrado([]);
  }}
  title="Asignar Materia"
>
  <form onSubmit={handleAsignarMateria}>
    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
      <div className="sm:col-span-6">
        <label htmlFor="gradoID" className="block text-sm font-medium text-gray-700">
          Grado
        </label>
        <div className="mt-1">
          <select
            id="gradoID"
            name="gradoID"
            value={gradoSeleccionado}
            onChange={async (e) => {
              const selectedGradoID = e.target.value;
              setGradoSeleccionado(selectedGradoID);
              setAsignMateriaForm({...asignMateriaForm, gradoID: selectedGradoID, materiaID: ''});
              
              if (selectedGradoID) {
                try {
                  // Obtener materias asignadas a este grado
                  const response = await axios.get(
                    `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/materias/grado/${selectedGradoID}`,
                    { headers: { 'Authorization': `Bearer ${token}` } }
                  );
                  
                  // Filtrar materias que ya están asignadas a este profesor en este grado
                  const materiasDelGrado = Array.isArray(response.data) ? response.data : [];
                  const materiasYaAsignadas = materias.filter(m => 
                    m.gradoID === selectedGradoID || 
                    m.Grado?.id === selectedGradoID
                  ).map(m => m.id);
                  
                  const materiasDisponibles = materiasDelGrado.filter(m => 
                    !materiasYaAsignadas.includes(m.id)
                  );
                  
                  setMateriasPorGrado(materiasDisponibles);
                } catch (error) {
                  console.error('Error al cargar materias del grado:', error);
                  setError('No se pudieron cargar las materias para este grado');
                }
              } else {
                setMateriasPorGrado([]);
              }
            }}
            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
            required
          >
            <option value="">Seleccione un grado</option>
            {gradosDisponibles.map((grado) => (
              <option key={grado.id} value={grado.id}>
                {grado.nombre_grado}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="sm:col-span-6">
        <label htmlFor="materiaID" className="block text-sm font-medium text-gray-700">
          Materia
        </label>
        <div className="mt-1">
          <select
            id="materiaID"
            name="materiaID"
            value={asignMateriaForm.materiaID}
            onChange={(e) => setAsignMateriaForm({...asignMateriaForm, materiaID: e.target.value})}
            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
            required
            disabled={!gradoSeleccionado}
          >
            <option value="">
              {!gradoSeleccionado 
                ? 'Primero seleccione un grado' 
                : materiasPorGrado.length === 0 
                  ? 'No hay materias disponibles para este grado' 
                  : 'Seleccione una materia'
              }
            </option>
            {materiasPorGrado.map((materia) => (
              <option key={materia.id} value={materia.id}>
                {materia.asignatura || materia.nombre}
              </option>
            ))}
          </select>
        </div>
        {gradoSeleccionado && materiasPorGrado.length === 0 && (
          <p className="mt-2 text-sm text-yellow-600">
            No hay materias disponibles para asignar en este grado o todas ya están asignadas a este profesor.
          </p>
        )}
      </div>
    </div>
    
    <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
      <button
        type="submit"
        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:col-start-2 sm:text-sm"
        disabled={loading || !gradoSeleccionado || !asignMateriaForm.materiaID}
      >
        {loading ? 'Asignando...' : 'Asignar'}
      </button>
      <button
        type="button"
        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
        onClick={() => {
          setShowAsignMateriaModal(false);
          setGradoSeleccionado('');
          setMateriasPorGrado([]);
        }}
      >
        Cancelar
      </button>
    </div>
  </form>
</Modal>


            {/* Modal para asignar grado */}
            <Modal
            isOpen={showAsignGradoModal}
            onClose={() => setShowAsignGradoModal(false)}
            title="Asignar Grado"
            >
            <form onSubmit={handleAsignarGrado}>
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-6">
                    <label htmlFor="gradoID" className="block text-sm font-medium text-gray-700">
                    Grado
                    </label>
                    <div className="mt-1">
                    <select
                        id="gradoID"
                        name="gradoID"
                        value={asignGradoForm.gradoID}
                        onChange={(e) => setAsignGradoForm({...asignGradoForm, gradoID: e.target.value})}
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        required
                    >
                        <option value="">Seleccione un grado</option>
                        {gradosDisponibles
                        .filter(grado => !grados.some(g => g.id === grado.id)) // Filtrar grados ya asignados
                        .map((grado) => (
                            <option key={grado.id} value={grado.id}>
                            {grado.nombre_grado}
                            </option>
                        ))
                        }
                    </select>
                    </div>
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

      </div>
    </AdminLayout>
  );
};

export default ProfesorDetail;

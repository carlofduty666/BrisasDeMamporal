import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaEdit, FaTrash, FaArrowLeft, FaPlus, FaFileAlt, FaBook, FaChalkboardTeacher, FaUserGraduate } from 'react-icons/fa';
import { formatearFecha } from '../../../utils/formatters';
import AdminLayout from '../layout/AdminLayout';

const ProfesorDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profesor, setProfesor] = useState(null);
  const [materias, setMaterias] = useState([]);
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [grados, setGrados] = useState([]);
  const [documentos, setDocumentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('info');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [annoEscolar, setAnnoEscolar] = useState(null);

  const token = localStorage.getItem('token');

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
        
        // Obtener materias asignadas al profesor
        const materiasResponse = await axios.get(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/materias`,
          { 
            headers: { 'Authorization': `Bearer ${token}` },
            params: { profesorID: id }
        }
        );
        setMaterias(materiasResponse.data);
        
        // Obtener evaluaciones creadas por el profesor
        const evaluacionesResponse = await axios.get(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/evaluaciones/profesor/${id}?annoEscolarID=${annoResponse.data.id}`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        setEvaluaciones(evaluacionesResponse.data);
        
        // Obtener grados asignados al profesor
        const gradosResponse = await axios.get(
            `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/grados/profesor/${id}`,
            { headers: { 'Authorization': `Bearer ${token}` } }
          );
          setGrados(gradosResponse.data);
          
          // Obtener documentos del profesor
          const documentosResponse = await axios.get(
            `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/documentos/persona/${id}`,
            { headers: { 'Authorization': `Bearer ${token}` } }
          );
          setDocumentos(documentosResponse.data);
          
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
  
    const handleAsignarGrado = async (gradoID) => {
      try {
        await axios.post(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/grados/${gradoID}/asignar-profesor`,
          { profesorID: id, annoEscolarID: annoEscolar.id },
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        
        // Recargar los grados
        const gradosResponse = await axios.get(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/grados/profesor/${id}`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        setGrados(gradosResponse.data);
        
        alert('Grado asignado correctamente');
      } catch (err) {
        console.error('Error al asignar grado:', err);
        alert('Error al asignar el grado. Por favor, intente nuevamente.');
      }
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
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                >
                <FaEdit className="mr-2" /> Editar
                </Link>
                
                {confirmDelete ? (
                <div className="flex items-center space-x-2">
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
                ) : (
                <button
                    onClick={() => setConfirmDelete(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700"
                >
                    <FaTrash className="mr-2" /> Eliminar
                </button>
                )}
            </div>
            </div>
    
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Información del Profesor
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    Detalles y asignaciones del profesor.
                </p>
                </div>
                <div className="flex space-x-2">
                <button
                    onClick={() => setActiveTab('info')}
                    className={`px-3 py-2 text-sm font-medium rounded-md ${
                    activeTab === 'info'
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    <FaUserGraduate className="inline mr-1" /> Información
                </button>
                <button
                    onClick={() => setActiveTab('materias')}
                    className={`px-3 py-2 text-sm font-medium rounded-md ${
                    activeTab === 'materias'
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    <FaBook className="inline mr-1" /> Materias
                </button>
                <button
                    onClick={() => setActiveTab('grados')}
                    className={`px-3 py-2 text-sm font-medium rounded-md ${
                    activeTab === 'grados'
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    <FaChalkboardTeacher className="inline mr-1" /> Grados
                </button>
                <button
                    onClick={() => setActiveTab('evaluaciones')}
                    className={`px-3 py-2 text-sm font-medium rounded-md ${
                    activeTab === 'evaluaciones'
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    <FaFileAlt className="inline mr-1" /> Evaluaciones
                </button>
                <button
                    onClick={() => setActiveTab('documentos')}
                    className={`px-3 py-2 text-sm font-medium rounded-md ${
                    activeTab === 'documentos'
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    <FaFileAlt className="inline mr-1" /> Documentos
                </button>
                </div>
            </div>
    
            {activeTab === 'info' && (
                <div className="border-t border-gray-200">
                <dl>
                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Nombre completo</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {profesor.nombre} {profesor.apellido}
                    </dd>
                    </div>
                    <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Cédula</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {profesor.cedula}
                    </dd>
                    </div>
                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {profesor.email || 'No disponible'}
                    </dd>
                    </div>
                    <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Teléfono</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {profesor.telefono || 'No disponible'}
                    </dd>
                    </div>
                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Dirección</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {profesor.direccion || 'No disponible'}
                    </dd>
                    </div>
                    <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Fecha de nacimiento</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {profesor.fechaNacimiento ? formatearFecha(profesor.fechaNacimiento) : 'No disponible'}
                    </dd>
                    </div>
                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Especialidad</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {profesor.especialidad || 'No disponible'}
                    </dd>
                    </div>
                    <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Observaciones</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {profesor.observaciones || 'No hay observaciones'}
                    </dd>
                    </div>
                </dl>
                </div>
            )}
    
            {activeTab === 'materias' && (
                <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Materias asignadas
                    </h3>
                    <Link
                    to={`/admin/materias/asignar?profesorID=${id}`}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                    <FaPlus className="mr-1" /> Asignar Materia
                    </Link>
                </div>
                
                {materias.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Nombre
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Grado
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Año Escolar
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Acciones
                        </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {materias.map((materia) => (
                        <tr key={materia.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {materia.nombre}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {materia.grado?.nombre_grado || 'No asignado'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {materia.annoEscolar?.periodo || 'No asignado'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <Link
                                to={`/admin/materias/${materia.id}`}
                                className="text-indigo-600 hover:text-indigo-900 mr-3"
                            >
                                Ver
                            </Link>
                            </td>
                        </tr>
                        ))}
                    </tbody>
                    </table>
                </div>
                ) : (
                <div className="text-center py-4 text-gray-500">
                    No hay materias asignadas a este profesor
                </div>
                )}
            </div>
            )}

            {activeTab === 'grados' && (
            <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Grados asignados
                </h3>
                <div className="relative">
                    <select
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    onChange={(e) => {
                        if (e.target.value) {
                        handleAsignarGrado(e.target.value);
                        }
                    }}
                    defaultValue=""
                    >
                    <option value="" disabled>Asignar grado</option>
                    {/* Aquí deberías cargar los grados disponibles */}
                    </select>
                </div>
                </div>
                
                {grados.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Grado
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Nivel
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Año Escolar
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Acciones
                        </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {grados.map((grado) => (
                        <tr key={grado.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {grado.nombre_grado}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {grado.nivel}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {grado.annoEscolar?.periodo || 'No asignado'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <Link
                                to={`/admin/grados/${grado.id}`}
                                className="text-indigo-600 hover:text-indigo-900 mr-3"
                            >
                                Ver
                            </Link>
                            </td>
                        </tr>
                        ))}
                    </tbody>
                    </table>
                </div>
                ) : (
                <div className="text-center py-4 text-gray-500">
                    No hay grados asignados a este profesor
                </div>
                )}
            </div>
            )}

            {activeTab === 'evaluaciones' && (
            <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Evaluaciones creadas
                </h3>
                <Link
                    to={`/admin/evaluaciones/nueva?profesorID=${id}`}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                >
                    <FaPlus className="mr-1" /> Nueva Evaluación
                </Link>
                </div>
                
                {evaluaciones.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Título
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Materia
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Fecha
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Acciones
                        </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {evaluaciones.map((evaluacion) => (
                        <tr key={evaluacion.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {evaluacion.titulo}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {evaluacion.materia?.nombre || 'No asignada'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {evaluacion.fecha ? formatearFecha(evaluacion.fecha) : 'No asignada'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <Link
                                to={`/admin/evaluaciones/${evaluacion.id}`}
                                className="text-indigo-600 hover:text-indigo-900 mr-3"
                            >
                                Ver
                            </Link>
                            </td>
                        </tr>
                        ))}
                    </tbody>
                    </table>
                </div>
                ) : (
                <div className="text-center py-4 text-gray-500">
                    No hay evaluaciones creadas por este profesor
                </div>
                )}
            </div>
            )}

            {activeTab === 'documentos' && (
            <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Documentos del profesor
                </h3>
                <Link
                    to={`/admin/documentos/subir?personaID=${id}&tipo=profesor`}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                >
                    <FaPlus className="mr-1" /> Subir Documento
                </Link>
                </div>
                
                {documentos.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {documentos.map((documento) => (
                    <div key={documento.id} className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="px-4 py-5 sm:p-6">
                        <h4 className="text-lg font-medium text-gray-900 truncate">
                            {documento.nombre_archivo || 'Documento'}
                        </h4>
                        <p className="mt-1 text-sm text-gray-500">
                            {documento.descripcion || 'Sin descripción'}
                        </p>
                        <div className="mt-4 flex justify-between">
                            <a
                            href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${documento.urlDocumento}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                            >
                            Ver documento
                            </a>
                        </div>
                        </div>
                    </div>
                    ))}
                </div>
                ) : (
                <div className="text-center py-4 text-gray-500">
                    No hay documentos subidos para este profesor
                </div>
                )}
            </div>
            )}
        </div>
        </div>

        </AdminLayout>
  );
};

export default ProfesorDetail;